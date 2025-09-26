import {
  type User,
  type InsertUser,
  type Ingredient,
  type InsertIngredient,
  type Supplier,
  type InsertSupplier,
  type Product,
  type InsertProduct,
  type Purchase,
  type InsertPurchase,
  type PurchaseItem,
  type InsertPurchaseItem,
  type InventoryLot,
  type InsertInventoryLot,
  type RecipeItem,
  type InsertRecipeItem,
  type CashSession,
  type InsertCashSession,
  type Sale,
  type InsertSale,
  type SaleItem,
  type InsertSaleItem,
  type StockMovement,
  type InsertStockMovement,
  type Expense,
  type InsertExpense,
  type NewPurchase,
  type NewSale,
  type StockAdjustment,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;

  // Ingredients
  getIngredients(): Promise<Ingredient[]>;
  getIngredient(id: string): Promise<Ingredient | undefined>;
  createIngredient(ingredient: InsertIngredient): Promise<Ingredient>;
  updateIngredient(
    id: string,
    ingredient: Partial<InsertIngredient>
  ): Promise<Ingredient>;

  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;

  // Recipe Items
  getRecipeItems(productId: string): Promise<RecipeItem[]>;
  createRecipeItem(recipeItem: InsertRecipeItem): Promise<RecipeItem>;
  deleteRecipeItems(productId: string): Promise<void>;

  // Inventory Lots
  getInventoryLots(ingredientId: string): Promise<InventoryLot[]>;
  createInventoryLot(lot: InsertInventoryLot): Promise<InventoryLot>;
  updateInventoryLot(
    id: string,
    lot: Partial<InsertInventoryLot>
  ): Promise<InventoryLot>;

  // Purchases
  createPurchase(purchase: NewPurchase): Promise<Purchase>;
  getPurchases(): Promise<Purchase[]>;

  // Stock Movements
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;
  getStockMovements(ingredientId?: string): Promise<StockMovement[]>;

  // Stock Adjustments
  adjustStock(adjustment: StockAdjustment): Promise<void>;

  // Sales
  createSale(sale: NewSale, userId: string): Promise<Sale>;
  getSales(from?: Date, to?: Date): Promise<Sale[]>;
  getSaleItems(saleId: string): Promise<SaleItem[]>;

  // Cash Sessions
  getActiveCashSession(): Promise<CashSession | undefined>;
  openCashSession(session: InsertCashSession): Promise<CashSession>;
  closeCashSession(
    sessionId: string,
    closingFloat: string,
    notes?: string,
    closedBy?: string
  ): Promise<CashSession>;
  getCashSessions(): Promise<CashSession[]>;
  createInventorySnapshots(
    sessionId: string,
    snapshots: { ingredientId: string; quantity: string }[],
    type: "OPENING" | "CLOSING"
  ): Promise<void>;

  // Expenses
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpenses(): Promise<Expense[]>;

  // Reports
  getCurrentStock(): Promise<
    {
      ingredientId: string;
      ingredientName: string;
      totalQuantity: string;
      unit: string;
      lowStockLevel: string | null;
    }[]
  >;
  getLowStockIngredients(): Promise<
    {
      ingredientId: string;
      ingredientName: string;
      totalQuantity: string;
      unit: string;
      lowStockLevel: string;
    }[]
  >;
  getTodayKPIs(): Promise<{
    revenue: string;
    cogs: string;
    grossMargin: string;
    orderCount: number;
  }>;
  getTopProducts(
    from: Date,
    to: Date
  ): Promise<
    {
      productId: string;
      productName: string;
      sku: string;
      totalQty: number;
      totalRevenue: string;
    }[]
  >;
  getRecentActivity(limit: number): Promise<any[]>;
}

import { SqliteStorage } from "./sqlite-storage";

export const storage = new SqliteStorage();
