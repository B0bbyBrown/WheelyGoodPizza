// From javascript_auth_all_persistance blueprint - adapted for email authentication
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser, loginSchema, registerSchema, sanitizeUser } from "@shared/schema";
import { hashPassword, comparePasswords } from "./lib/password";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

// Helper function to check if a password is plaintext (legacy)
function isPlaintextPassword(storedPassword: string): boolean {
  return !storedPassword.includes('.');
}

// Migration-safe password comparison
async function comparePasswordsSafe(supplied: string, stored: string): Promise<boolean> {
  if (isPlaintextPassword(stored)) {
    // Legacy plaintext password - compare directly
    return supplied === stored;
  }
  // Hashed password - use normal comparison
  return await comparePasswords(supplied, stored);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport strategy using email instead of username with migration support
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false);
        }

        const isValidPassword = await comparePasswordsSafe(password, user.password);
        if (!isValidPassword) {
          return done(null, false);
        }

        // If password is plaintext, migrate to hashed on successful login
        if (isPlaintextPassword(user.password)) {
          const hashedPassword = await hashPassword(password);
          await storage.updateUser(user.id, { password: hashedPassword });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate request body
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.errors 
        });
      }

      const { email, password, name } = validation.data;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser({
        email,
        password: await hashPassword(password),
        name,
        role: "CASHIER", // Always hardcode role to CASHIER for security
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Return sanitized user object (without password)
        res.status(201).json(sanitizeUser(user));
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validation.error.errors 
      });
    }

    passport.authenticate("local", (err: any, user: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        // Return sanitized user object (without password)
        res.status(200).json(sanitizeUser(user));
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Return sanitized user object (without password)
    res.json(sanitizeUser(req.user!));
  });
}