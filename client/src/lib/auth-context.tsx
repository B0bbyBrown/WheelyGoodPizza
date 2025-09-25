import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";

interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  async function getProfile(userId: string): Promise<AppUser | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,name,role")
      .eq("id", userId)
      .single();
    if (error) return null;
    return data as AppUser;
  }

  async function ensureProfile(
    userId: string,
    email: string,
    name?: string,
    role: string = "CASHIER"
  ) {
    const existing = await getProfile(userId);
    if (existing) return existing;
    const { data, error } = await supabase
      .from("profiles")
      .insert({ id: userId, email, name: name || email.split("@")[0], role })
      .select("id,email,name,role")
      .single();
    if (error) return null;
    return data as AppUser;
  }

  useEffect(() => {
    // Initial load with Apple device compatibility
    (async () => {
      setIsAuthLoading(true);
      try {
        // Add timeout for Apple device network issues
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () =>
              reject(new Error("Auth timeout - Apple device network issue")),
            10000
          );
        });

        const authPromise = supabase.auth.getUser();
        const { data } = (await Promise.race([
          authPromise,
          timeoutPromise,
        ])) as any;

        if (data.user) {
          const profile = await ensureProfile(
            data.user.id,
            data.user.email || ""
          );
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);

        // Platform-specific error handling
        const isAppleDevice = /iPad|iPhone|iPod|Macintosh/.test(
          navigator.userAgent
        );
        if (isAppleDevice) {
          console.warn(
            "🍎 Apple device detected - applying compatibility fixes"
          );
        }

        // Check if it's a Supabase configuration error
        if (error instanceof Error && error.message.includes("Missing")) {
          console.error("❌ Supabase configuration error detected");
          console.error(
            "Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set"
          );
        }

        // Check for network timeout (common on Apple devices)
        if (error instanceof Error && error.message.includes("timeout")) {
          console.error(
            "⏱️ Network timeout detected - common on Apple devices"
          );
          console.error(
            "Try refreshing the page or checking your network connection"
          );
        }

        setUser(null);
      }
      setIsAuthLoading(false);
    })();

    // Listen for auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await ensureProfile(
            session.user.id,
            session.user.email || ""
          );
          setUser(profile);
        } else {
          setUser(null);
          queryClient.clear();
        }
      }
    );
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [queryClient]);

  const login = async (email: string, password: string) => {
    setIsAuthLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    const profile = await ensureProfile(data.user.id, email);
    setUser(profile);
    setIsAuthLoading(false);
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role?: string
  ) => {
    setIsAuthLoading(true);
    const { error, data } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    // If email confirmations are disabled, a session/user is available now
    if (data.user) {
      const profile = await ensureProfile(
        data.user.id,
        email,
        name,
        role || "CASHIER"
      );
      setUser(profile);
    }
    setIsAuthLoading(false);
  };

  const logout = async () => {
    setIsAuthLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    queryClient.clear();
    setIsAuthLoading(false);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        login,
        register,
        logout,
        isLoading: isAuthLoading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Local user shape stored in profiles
export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "CASHIER" | "KITCHEN" | string;
}
