import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth"; // From javascript_auth_all_persistance blueprint
import { 
  insertIngredientSchema, insertSupplierSchema, insertProductSchema,
  newPurchaseSchema, newSaleSchema, stockAdjustmentSchema,
  insertCashSessionSchema, insertExpenseSchema, insertRecipeItemSchema
} from "@shared/schema";

// Authentication middleware (from javascript_auth_all_persistance blueprint)
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

function requireRole(role: string) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (req.user.role !== role && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication (from javascript_auth_all_persistance blueprint)
  setupAuth(app);

  // Demo endpoint to get admin user ID for development
  app.get("/api/auth/demo-admin", async (req, res) => {
    try {
      const adminUser = await storage.getUserByEmail("admin@pizzatruck.com");
      res.json({ adminId: adminUser?.id || null });
    } catch (error) {
      res.json({ adminId: null });
    }
  });

  // Ingredients
  app.get("/api/ingredients", requireAuth, async (req, res) => {
    try {
      const ingredients = await storage.getIngredients();
      res.json(ingredients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ingredients" });
    }
  });

  app.post("/api/ingredients", requireRole("ADMIN"), async (req, res) => {
    try {
      const data = insertIngredientSchema.parse(req.body);
      const ingredient = await storage.createIngredient(data);
      res.json(ingredient);
    } catch (error) {
      res.status(400).json({ error: "Invalid ingredient data" });
    }
  });

  // Suppliers
  app.get("/api/suppliers", requireAuth, async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", requireRole("ADMIN"), async (req, res) => {
    try {
      const data = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(data);
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ error: "Invalid supplier data" });
    }
  });

  // Products
  app.get("/api/products", requireAuth, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", requireRole("ADMIN"), async (req, res) => {
    try {
      const { recipe, ...productData } = req.body;
      const data = insertProductSchema.parse(productData);
      const product = await storage.createProduct(data);

      // Add recipe items if provided
      if (recipe && Array.isArray(recipe)) {
        for (const item of recipe) {
          const recipeData = insertRecipeItemSchema.parse({
            productId: product.id,
            ingredientId: item.ingredientId,
            quantity: item.quantity,
          });
          await storage.createRecipeItem(recipeData);
        }
      }

      res.json(product);
    } catch (error) {
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.get("/api/products/:id/recipe", requireAuth, async (req, res) => {
    try {
      const recipeItems = await storage.getRecipeItems(req.params.id);
      res.json(recipeItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recipe" });
    }
  });

  // Purchases
  app.get("/api/purchases", requireAuth, async (req, res) => {
    try {
      const purchases = await storage.getPurchases();
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchases" });
    }
  });

  app.post("/api/purchases", requireRole("ADMIN"), async (req, res) => {
    try {
      const data = newPurchaseSchema.parse(req.body);
      const purchase = await storage.createPurchase(data);
      res.json(purchase);
    } catch (error) {
      res.status(400).json({ error: "Invalid purchase data" });
    }
  });

  // Stock management
  app.get("/api/stock/current", requireAuth, async (req, res) => {
    try {
      const stock = await storage.getCurrentStock();
      res.json(stock);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch current stock" });
    }
  });

  app.get("/api/stock/low", requireAuth, async (req, res) => {
    try {
      const lowStock = await storage.getLowStockIngredients();
      res.json(lowStock);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch low stock items" });
    }
  });

  app.post("/api/stock/adjust", requireRole("ADMIN"), async (req, res) => {
    try {
      const data = stockAdjustmentSchema.parse(req.body);
      await storage.adjustStock(data);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Stock adjustment failed" });
    }
  });

  app.get("/api/stock/movements", requireAuth, async (req, res) => {
    try {
      const ingredientId = req.query.ingredientId as string;
      const movements = await storage.getStockMovements(ingredientId);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock movements" });
    }
  });

  // Sales
  app.get("/api/sales", requireAuth, async (req, res) => {
    try {
      const from = req.query.from ? new Date(req.query.from as string) : undefined;
      const to = req.query.to ? new Date(req.query.to as string) : undefined;
      const sales = await storage.getSales(from, to);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales" });
    }
  });

  app.post("/api/sales", requireAuth, async (req: any, res) => {
    try {
      const data = newSaleSchema.parse(req.body);
      const sale = await storage.createSale(data, req.user.id);
      res.json(sale);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Sale creation failed" });
    }
  });

  app.get("/api/sales/:id/items", requireAuth, async (req, res) => {
    try {
      const items = await storage.getSaleItems(req.params.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sale items" });
    }
  });

  // Cash sessions
  app.get("/api/sessions", requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getCashSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cash sessions" });
    }
  });

  app.get("/api/sessions/active", requireAuth, async (req, res) => {
    try {
      const session = await storage.getActiveCashSession();
      res.json(session || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active session" });
    }
  });

  app.post("/api/sessions/open", requireAuth, async (req: any, res) => {
    try {
      const data = insertCashSessionSchema.parse({
        ...req.body,
        openedBy: req.user.id,
      });
      const session = await storage.openCashSession(data);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Failed to open cash session" });
    }
  });

  app.post("/api/sessions/:id/close", requireAuth, async (req: any, res) => {
    try {
      const { closingFloat, notes } = req.body;
      const session = await storage.closeCashSession(
        req.params.id,
        closingFloat,
        notes,
        req.user.id
      );
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Failed to close cash session" });
    }
  });

  // Expenses
  app.get("/api/expenses", requireAuth, async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", requireAuth, async (req, res) => {
    try {
      const data = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(data);
      res.json(expense);
    } catch (error) {
      res.status(400).json({ error: "Invalid expense data" });
    }
  });

  // Reports
  app.get("/api/reports/overview", requireAuth, async (req, res) => {
    try {
      const kpis = await storage.getTodayKPIs();
      res.json(kpis);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch overview" });
    }
  });

  app.get("/api/reports/top-products", requireAuth, async (req, res) => {
    try {
      const from = req.query.from ? new Date(req.query.from as string) : new Date();
      const to = req.query.to ? new Date(req.query.to as string) : new Date();
      
      // Set default to today if no dates provided
      if (!req.query.from && !req.query.to) {
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
      }
      
      const topProducts = await storage.getTopProducts(from, to);
      res.json(topProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top products" });
    }
  });

  app.get("/api/reports/activity", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activity = await storage.getRecentActivity(limit);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent activity" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
