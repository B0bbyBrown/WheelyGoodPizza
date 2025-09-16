import { 
  type User, type InsertUser, type Ingredient, type InsertIngredient,
  type Supplier, type InsertSupplier, type Product, type InsertProduct,
  type Purchase, type InsertPurchase, type PurchaseItem, type InsertPurchaseItem,
  type InventoryLot, type InsertInventoryLot, type RecipeItem, type InsertRecipeItem,
  type CashSession, type InsertCashSession, type Sale, type InsertSale,
  type SaleItem, type InsertSaleItem, type StockMovement, type InsertStockMovement,
  type Expense, type InsertExpense, type NewPurchase, type NewSale, type StockAdjustment
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Ingredients
  getIngredients(): Promise<Ingredient[]>;
  getIngredient(id: string): Promise<Ingredient | undefined>;
  createIngredient(ingredient: InsertIngredient): Promise<Ingredient>;
  updateIngredient(id: string, ingredient: Partial<InsertIngredient>): Promise<Ingredient>;

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
  updateInventoryLot(id: string, lot: Partial<InsertInventoryLot>): Promise<InventoryLot>;

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
  closeCashSession(sessionId: string, closingFloat: string, notes?: string, closedBy?: string): Promise<CashSession>;
  getCashSessions(): Promise<CashSession[]>;

  // Expenses
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpenses(): Promise<Expense[]>;

  // Reports
  getCurrentStock(): Promise<{ ingredientId: string; ingredientName: string; totalQuantity: string; unit: string; lowStockLevel: string | null }[]>;
  getLowStockIngredients(): Promise<{ ingredientId: string; ingredientName: string; totalQuantity: string; unit: string; lowStockLevel: string }[]>;
  getTodayKPIs(): Promise<{ revenue: string; cogs: string; grossMargin: string; orderCount: number }>;
  getTopProducts(from: Date, to: Date): Promise<{ productId: string; productName: string; sku: string; totalQty: number; totalRevenue: string }[]>;
  getRecentActivity(limit: number): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private ingredients: Map<string, Ingredient> = new Map();
  private suppliers: Map<string, Supplier> = new Map();
  private products: Map<string, Product> = new Map();
  private purchases: Map<string, Purchase> = new Map();
  private purchaseItems: Map<string, PurchaseItem> = new Map();
  private inventoryLots: Map<string, InventoryLot> = new Map();
  private recipeItems: Map<string, RecipeItem> = new Map();
  private cashSessions: Map<string, CashSession> = new Map();
  private sales: Map<string, Sale> = new Map();
  private saleItems: Map<string, SaleItem> = new Map();
  private stockMovements: Map<string, StockMovement> = new Map();
  private expenses: Map<string, Expense> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || "CASHIER",
      createdAt: now, 
      updatedAt: now 
    };
    this.users.set(id, user);
    return user;
  }

  async getIngredients(): Promise<Ingredient[]> {
    return Array.from(this.ingredients.values());
  }

  async getIngredient(id: string): Promise<Ingredient | undefined> {
    return this.ingredients.get(id);
  }

  async createIngredient(insertIngredient: InsertIngredient): Promise<Ingredient> {
    const id = randomUUID();
    const now = new Date();
    const ingredient: Ingredient = { 
      ...insertIngredient,
      lowStockLevel: insertIngredient.lowStockLevel || null,
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.ingredients.set(id, ingredient);
    return ingredient;
  }

  async updateIngredient(id: string, updateData: Partial<InsertIngredient>): Promise<Ingredient> {
    const existing = this.ingredients.get(id);
    if (!existing) throw new Error("Ingredient not found");
    
    const updated: Ingredient = { 
      ...existing, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.ingredients.set(id, updated);
    return updated;
  }

  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const now = new Date();
    const supplier: Supplier = { 
      ...insertSupplier,
      email: insertSupplier.email || null,
      phone: insertSupplier.phone || null,
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.suppliers.set(id, supplier);
    return supplier;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const now = new Date();
    const product: Product = { 
      ...insertProduct,
      active: insertProduct.active ?? true,
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product> {
    const existing = this.products.get(id);
    if (!existing) throw new Error("Product not found");
    
    const updated: Product = { 
      ...existing, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.products.set(id, updated);
    return updated;
  }

  async getRecipeItems(productId: string): Promise<RecipeItem[]> {
    return Array.from(this.recipeItems.values()).filter(item => item.productId === productId);
  }

  async createRecipeItem(insertRecipeItem: InsertRecipeItem): Promise<RecipeItem> {
    const id = randomUUID();
    const recipeItem: RecipeItem = { ...insertRecipeItem, id };
    this.recipeItems.set(id, recipeItem);
    return recipeItem;
  }

  async deleteRecipeItems(productId: string): Promise<void> {
    const toDelete = Array.from(this.recipeItems.entries())
      .filter(([_, item]) => item.productId === productId)
      .map(([id, _]) => id);
    
    toDelete.forEach(id => this.recipeItems.delete(id));
  }

  async getInventoryLots(ingredientId: string): Promise<InventoryLot[]> {
    return Array.from(this.inventoryLots.values())
      .filter(lot => lot.ingredientId === ingredientId)
      .sort((a, b) => a.purchasedAt.getTime() - b.purchasedAt.getTime());
  }

  async createInventoryLot(insertLot: InsertInventoryLot): Promise<InventoryLot> {
    const id = randomUUID();
    const now = new Date();
    const lot: InventoryLot = { 
      ...insertLot, 
      id, 
      purchasedAt: insertLot.purchasedAt || now,
      createdAt: now, 
      updatedAt: now 
    };
    this.inventoryLots.set(id, lot);
    return lot;
  }

  async updateInventoryLot(id: string, updateData: Partial<InsertInventoryLot>): Promise<InventoryLot> {
    const existing = this.inventoryLots.get(id);
    if (!existing) throw new Error("Inventory lot not found");
    
    const updated: InventoryLot = { 
      ...existing, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.inventoryLots.set(id, updated);
    return updated;
  }

  async createPurchase(newPurchase: NewPurchase): Promise<Purchase> {
    const purchaseId = randomUUID();
    const now = new Date();
    
    const purchase: Purchase = {
      id: purchaseId,
      supplierId: newPurchase.supplierId || null,
      notes: newPurchase.notes || null,
      createdAt: now,
    };
    this.purchases.set(purchaseId, purchase);

    // Create purchase items and inventory lots
    for (const item of newPurchase.items) {
      const purchaseItemId = randomUUID();
      const purchaseItem: PurchaseItem = {
        id: purchaseItemId,
        purchaseId,
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        totalCost: item.totalCost,
      };
      this.purchaseItems.set(purchaseItemId, purchaseItem);

      // Create inventory lot
      const unitCost = parseFloat(item.totalCost) / parseFloat(item.quantity);
      await this.createInventoryLot({
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        unitCost: unitCost.toString(),
        purchasedAt: now,
      });

      // Create stock movement
      await this.createStockMovement({
        kind: "PURCHASE",
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        reference: purchaseId,
        note: "Purchase order",
      });
    }

    return purchase;
  }

  async getPurchases(): Promise<Purchase[]> {
    return Array.from(this.purchases.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createStockMovement(insertMovement: InsertStockMovement): Promise<StockMovement> {
    const id = randomUUID();
    const movement: StockMovement = { 
      ...insertMovement,
      note: insertMovement.note || null,
      reference: insertMovement.reference || null,
      id, 
      createdAt: new Date() 
    };
    this.stockMovements.set(id, movement);
    return movement;
  }

  async getStockMovements(ingredientId?: string): Promise<StockMovement[]> {
    const movements = Array.from(this.stockMovements.values());
    if (ingredientId) {
      return movements.filter(m => m.ingredientId === ingredientId);
    }
    return movements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async adjustStock(adjustment: StockAdjustment): Promise<void> {
    const quantity = parseFloat(adjustment.quantity);
    const isPositive = quantity > 0;
    
    if (isPositive) {
      // Add inventory lot for positive adjustments
      await this.createInventoryLot({
        ingredientId: adjustment.ingredientId,
        quantity: adjustment.quantity,
        unitCost: "0", // Adjustments have no cost
      });
    } else {
      // For negative adjustments, consume from existing lots using FIFO
      const lots = await this.getInventoryLots(adjustment.ingredientId);
      let remaining = Math.abs(quantity);
      
      for (const lot of lots) {
        if (remaining <= 0) break;
        
        const lotQuantity = parseFloat(lot.quantity);
        if (lotQuantity <= 0) continue;
        
        const consumed = Math.min(remaining, lotQuantity);
        const newQuantity = lotQuantity - consumed;
        
        await this.updateInventoryLot(lot.id, {
          quantity: newQuantity.toString(),
        });
        
        remaining -= consumed;
      }
    }

    // Create stock movement
    await this.createStockMovement({
      kind: isPositive ? "ADJUSTMENT" : "WASTAGE",
      ingredientId: adjustment.ingredientId,
      quantity: adjustment.quantity,
      reference: "manual_adjustment",
      note: adjustment.note || "Manual stock adjustment",
    });
  }

  async createSale(newSale: NewSale, userId: string): Promise<Sale> {
    const saleId = randomUUID();
    let totalAmount = 0;
    let totalCogs = 0;

    // Calculate totals and check stock availability
    const saleItemsToCreate: InsertSaleItem[] = [];
    
    for (const item of newSale.items) {
      const product = await this.getProduct(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      
      const lineTotal = parseFloat(product.price) * item.qty;
      totalAmount += lineTotal;

      saleItemsToCreate.push({
        saleId,
        productId: item.productId,
        qty: item.qty,
        unitPrice: product.price,
        lineTotal: lineTotal.toString(),
      });

      // Calculate COGS using FIFO
      const recipeItems = await this.getRecipeItems(item.productId);
      for (const recipeItem of recipeItems) {
        const requiredQuantity = parseFloat(recipeItem.quantity) * item.qty;
        const lots = await this.getInventoryLots(recipeItem.ingredientId);
        
        let remaining = requiredQuantity;
        let itemCogs = 0;
        
        // Check if we have enough stock
        const totalAvailable = lots.reduce((sum, lot) => sum + parseFloat(lot.quantity), 0);
        if (totalAvailable < requiredQuantity) {
          const ingredient = await this.getIngredient(recipeItem.ingredientId);
          throw new Error(`Insufficient stock for ${ingredient?.name || 'ingredient'}. Required: ${requiredQuantity}, Available: ${totalAvailable}`);
        }

        // Consume stock using FIFO
        for (const lot of lots) {
          if (remaining <= 0) break;
          
          const lotQuantity = parseFloat(lot.quantity);
          if (lotQuantity <= 0) continue;
          
          const consumed = Math.min(remaining, lotQuantity);
          const newQuantity = lotQuantity - consumed;
          
          await this.updateInventoryLot(lot.id, {
            quantity: newQuantity.toString(),
          });
          
          itemCogs += consumed * parseFloat(lot.unitCost);
          remaining -= consumed;

          // Create stock movement for consumption
          await this.createStockMovement({
            kind: "SALE_CONSUME",
            ingredientId: recipeItem.ingredientId,
            quantity: (-consumed).toString(),
            reference: saleId,
            note: `Sale consumption for ${product.name}`,
          });
        }
        
        totalCogs += itemCogs;
      }
    }

    // Create the sale
    const sale: Sale = {
      id: saleId,
      sessionId: newSale.sessionId || null,
      userId,
      total: totalAmount.toString(),
      cogs: totalCogs.toString(),
      paymentType: newSale.paymentType,
      createdAt: new Date(),
    };
    this.sales.set(saleId, sale);

    // Create sale items
    for (const saleItem of saleItemsToCreate) {
      const id = randomUUID();
      const item: SaleItem = { ...saleItem, id };
      this.saleItems.set(id, item);
    }

    return sale;
  }

  async getSales(from?: Date, to?: Date): Promise<Sale[]> {
    let sales = Array.from(this.sales.values());
    
    if (from || to) {
      sales = sales.filter(sale => {
        if (from && sale.createdAt < from) return false;
        if (to && sale.createdAt > to) return false;
        return true;
      });
    }
    
    return sales.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getSaleItems(saleId: string): Promise<SaleItem[]> {
    return Array.from(this.saleItems.values()).filter(item => item.saleId === saleId);
  }

  async getActiveCashSession(): Promise<CashSession | undefined> {
    return Array.from(this.cashSessions.values()).find(session => !session.closedAt);
  }

  async openCashSession(insertSession: InsertCashSession): Promise<CashSession> {
    const id = randomUUID();
    const session: CashSession = { 
      ...insertSession,
      notes: insertSession.notes || null,
      openingFloat: insertSession.openingFloat || "0",
      id,
      openedAt: new Date(),
      closedAt: null,
      closedBy: null,
      closingFloat: null,
    };
    this.cashSessions.set(id, session);
    return session;
  }

  async closeCashSession(sessionId: string, closingFloat: string, notes?: string, closedBy?: string): Promise<CashSession> {
    const session = this.cashSessions.get(sessionId);
    if (!session) throw new Error("Cash session not found");
    
    const updated: CashSession = {
      ...session,
      closedAt: new Date(),
      closingFloat,
      notes: notes || session.notes,
      closedBy: closedBy || null,
    };
    this.cashSessions.set(sessionId, updated);
    return updated;
  }

  async getCashSessions(): Promise<CashSession[]> {
    return Array.from(this.cashSessions.values()).sort((a, b) => b.openedAt.getTime() - a.openedAt.getTime());
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const expense: Expense = { 
      ...insertExpense, 
      id, 
      createdAt: new Date() 
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCurrentStock(): Promise<{ ingredientId: string; ingredientName: string; totalQuantity: string; unit: string; lowStockLevel: string | null }[]> {
    const result: { ingredientId: string; ingredientName: string; totalQuantity: string; unit: string; lowStockLevel: string | null }[] = [];
    
    for (const ingredient of Array.from(this.ingredients.values())) {
      const lots = await this.getInventoryLots(ingredient.id);
      const totalQuantity = lots.reduce((sum, lot) => sum + parseFloat(lot.quantity), 0);
      
      result.push({
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        totalQuantity: totalQuantity.toString(),
        unit: ingredient.unit,
        lowStockLevel: ingredient.lowStockLevel,
      });
    }
    
    return result;
  }

  async getLowStockIngredients(): Promise<{ ingredientId: string; ingredientName: string; totalQuantity: string; unit: string; lowStockLevel: string }[]> {
    const currentStock = await this.getCurrentStock();
    
    return currentStock.filter(item => {
      if (!item.lowStockLevel) return false;
      return parseFloat(item.totalQuantity) < parseFloat(item.lowStockLevel);
    }).map(item => ({
      ...item,
      lowStockLevel: item.lowStockLevel!,
    }));
  }

  async getTodayKPIs(): Promise<{ revenue: string; cogs: string; grossMargin: string; orderCount: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaySales = await this.getSales(today, tomorrow);
    
    const revenue = todaySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const cogs = todaySales.reduce((sum, sale) => sum + parseFloat(sale.cogs), 0);
    const grossMargin = revenue > 0 ? ((revenue - cogs) / revenue) * 100 : 0;
    
    return {
      revenue: revenue.toString(),
      cogs: cogs.toString(),
      grossMargin: grossMargin.toString(),
      orderCount: todaySales.length,
    };
  }

  async getTopProducts(from: Date, to: Date): Promise<{ productId: string; productName: string; sku: string; totalQty: number; totalRevenue: string }[]> {
    const sales = await this.getSales(from, to);
    const productStats = new Map<string, { qty: number; revenue: number }>();
    
    for (const sale of sales) {
      const items = await this.getSaleItems(sale.id);
      for (const item of items) {
        const existing = productStats.get(item.productId) || { qty: 0, revenue: 0 };
        productStats.set(item.productId, {
          qty: existing.qty + item.qty,
          revenue: existing.revenue + parseFloat(item.lineTotal),
        });
      }
    }
    
    const result: { productId: string; productName: string; sku: string; totalQty: number; totalRevenue: string }[] = [];
    
    for (const [productId, stats] of Array.from(productStats.entries())) {
      const product = await this.getProduct(productId);
      if (product) {
        result.push({
          productId,
          productName: product.name,
          sku: product.sku,
          totalQty: stats.qty,
          totalRevenue: stats.revenue.toString(),
        });
      }
    }
    
    return result.sort((a, b) => parseFloat(b.totalRevenue) - parseFloat(a.totalRevenue));
  }

  async getRecentActivity(limit: number): Promise<any[]> {
    const recentSales = (await this.getSales()).slice(0, limit);
    const recentMovements = (await this.getStockMovements()).slice(0, limit);
    
    const activities = [
      ...recentSales.map(sale => ({
        type: 'sale',
        id: sale.id,
        description: `Sale #${sale.id.slice(-4)}`,
        amount: sale.total,
        createdAt: sale.createdAt,
      })),
      ...recentMovements.map(movement => ({
        type: 'stock_movement',
        id: movement.id,
        description: movement.note || `${movement.kind} - ${movement.quantity}`,
        amount: null,
        createdAt: movement.createdAt,
      }))
    ];
    
    return activities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

import { SqliteStorage } from "./sqlite-storage";

export const storage = new SqliteStorage();
