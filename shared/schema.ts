import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, pgEnum, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum("role", ["ADMIN", "CASHIER", "KITCHEN"]);
export const paymentTypeEnum = pgEnum("payment_type", ["CASH", "CARD", "OTHER"]);
export const movementKindEnum = pgEnum("movement_kind", ["PURCHASE", "SALE_CONSUME", "ADJUSTMENT", "WASTAGE"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").default("CASHIER").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Ingredients table
export const ingredients = pgTable("ingredients", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").unique().notNull(),
  unit: text("unit").notNull(), // 'g','kg','ml','l','unit'
  lowStockLevel: decimal("low_stock_level", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").unique().notNull(),
  phone: text("phone"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Inventory lots (FIFO)
export const inventoryLots = pgTable("inventory_lots", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ingredientId: uuid("ingredient_id").references(() => ingredients.id).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(), // remaining in same unit as ingredient
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(), // cost per unit at purchase time
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Purchases table
export const purchases = pgTable("purchases", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Purchase items table
export const purchaseItems = pgTable("purchase_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  purchaseId: uuid("purchase_id").references(() => purchases.id).notNull(),
  ingredientId: uuid("ingredient_id").references(() => ingredients.id).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
});

// Products table
export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").unique().notNull(),
  sku: text("sku").unique().notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Recipe items (BOM)
export const recipeItems = pgTable("recipe_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").references(() => products.id).notNull(),
  ingredientId: uuid("ingredient_id").references(() => ingredients.id).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
});

// Cash sessions table
export const cashSessions = pgTable("cash_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  openedAt: timestamp("opened_at").defaultNow().notNull(),
  openedBy: uuid("opened_by").references(() => users.id).notNull(),
  closedAt: timestamp("closed_at"),
  closedBy: uuid("closed_by").references(() => users.id),
  openingFloat: decimal("opening_float", { precision: 10, scale: 2 }).default("0").notNull(),
  closingFloat: decimal("closing_float", { precision: 10, scale: 2 }),
  notes: text("notes"),
});

// Sales table
export const sales = pgTable("sales", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").references(() => cashSessions.id),
  userId: uuid("user_id").references(() => users.id).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  cogs: decimal("cogs", { precision: 10, scale: 2 }).notNull(), // computed via FIFO
  paymentType: paymentTypeEnum("payment_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sale items table
export const saleItems = pgTable("sale_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  saleId: uuid("sale_id").references(() => sales.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  qty: integer("qty").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
});

// Stock movements table
export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  kind: movementKindEnum("kind").notNull(),
  ingredientId: uuid("ingredient_id").references(() => ingredients.id).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(), // negative for consumption
  reference: text("reference"), // sale_id, purchase_id, manual_adj, etc.
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Expenses table
export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  label: text("label").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paidVia: paymentTypeEnum("paid_via").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIngredientSchema = createInsertSchema(ingredients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseItemSchema = createInsertSchema(purchaseItems).omit({
  id: true,
});

export const insertInventoryLotSchema = createInsertSchema(inventoryLots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRecipeItemSchema = createInsertSchema(recipeItems).omit({
  id: true,
});

export const insertCashSessionSchema = createInsertSchema(cashSessions).omit({
  id: true,
  openedAt: true,
  closedAt: true,
  closedBy: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertSaleItemSchema = createInsertSchema(saleItems).omit({
  id: true,
});

export const insertStockMovementSchema = createInsertSchema(stockMovements).omit({
  id: true,
  createdAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});

// Additional schemas for complex operations
export const newPurchaseSchema = z.object({
  supplierId: z.string().uuid().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    ingredientId: z.string().uuid(),
    quantity: z.string(),
    totalCost: z.string(),
  })).min(1),
});

export const newSaleSchema = z.object({
  sessionId: z.string().uuid().optional(),
  paymentType: z.enum(["CASH", "CARD", "OTHER"]),
  items: z.array(z.object({
    productId: z.string().uuid(),
    qty: z.number().min(1),
  })).min(1),
});

export const stockAdjustmentSchema = z.object({
  ingredientId: z.string().uuid(),
  quantity: z.string(),
  note: z.string().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type PurchaseItem = typeof purchaseItems.$inferSelect;
export type InsertPurchaseItem = z.infer<typeof insertPurchaseItemSchema>;
export type InventoryLot = typeof inventoryLots.$inferSelect;
export type InsertInventoryLot = z.infer<typeof insertInventoryLotSchema>;
export type RecipeItem = typeof recipeItems.$inferSelect;
export type InsertRecipeItem = z.infer<typeof insertRecipeItemSchema>;
export type CashSession = typeof cashSessions.$inferSelect;
export type InsertCashSession = z.infer<typeof insertCashSessionSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type SaleItem = typeof saleItems.$inferSelect;
export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;
export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type NewPurchase = z.infer<typeof newPurchaseSchema>;
export type NewSale = z.infer<typeof newSaleSchema>;
export type StockAdjustment = z.infer<typeof stockAdjustmentSchema>;
