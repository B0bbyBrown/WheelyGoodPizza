import { apiRequest } from "./queryClient";
import { supabase } from "./supabase";

function dollarsToCents(amount: string): number {
  const num = Number.parseFloat(amount);
  if (Number.isNaN(num)) return 0;
  return Math.round(num * 100);
}

function centsToDollars(cents: number | null | undefined): string {
  const n = typeof cents === "number" ? cents : 0;
  return (n / 100).toFixed(2);
}

// Auth
export async function login(email: string, password: string) {
  const res = await apiRequest("POST", "/api/auth/login", { email, password });
  return res.json();
}

export async function getMe() {
  const res = await apiRequest("GET", "/api/me");
  return res.json();
}

// Ingredients
export async function getIngredients() {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("id,name,unit,is_active")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || [])
    .filter((row: any) => row.is_active !== false)
    .map((row: any) => ({ id: row.id, name: row.name, unit: row.unit }));
}

export async function createIngredient(data: any) {
  const payload: any = {
    name: data.name,
    unit: data.unit,
    qty: 0,
    low_threshold: data.lowStockLevel ? Number.parseFloat(String(data.lowStockLevel)) : 0,
    is_active: true,
  };
  const { data: created, error } = await supabase
    .from("inventory_items")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return created;
}

// Suppliers
export async function getSuppliers() {
  // Supabase version: basic suppliers table
  const { data, error } = await supabase
    .from("suppliers")
    .select("id,name,phone,email")
    .order("name", { ascending: true });
  if (error) {
    // If table not present yet, return empty list gracefully
    return [] as any[];
  }
  return data || [];
}

export async function createSupplier(data: any) {
  const { data: created, error } = await supabase
    .from("suppliers")
    .insert({ name: data.name, phone: data.phone ?? null, email: data.email ?? null })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return created;
}

// Products
export async function getProducts() {
  const { data, error } = await supabase
    .from("menu_items")
    .select("id,name,price_cents,is_active")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    sku: (row.name || "").toUpperCase().replace(/\s+/g, "-") || String(row.id).slice(0, 8),
    price: centsToDollars(row.price_cents),
    active: !!row.is_active,
  }));
}

export async function createProduct(data: any) {
  const insertPayload: any = {
    name: data.name,
    price_cents: dollarsToCents(String(data.price)),
    menu_type: "food",
    is_active: Boolean(data.active),
    is_featured: false,
    prep_time_minutes: 0,
  };

  const { data: createdItem, error: insertErr } = await supabase
    .from("menu_items")
    .insert(insertPayload)
    .select("id")
    .single();
  if (insertErr) throw new Error(insertErr.message);

  const recipeItems = Array.isArray(data.recipe) ? data.recipe : [];
  if (recipeItems.length > 0 && createdItem?.id) {
    const ingredientIds = recipeItems.map((r: any) => r.ingredientId);
    const { data: invItems, error: invErr } = await supabase
      .from("inventory_items")
      .select("id,unit")
      .in("id", ingredientIds);
    if (invErr) throw new Error(invErr.message);
    const idToUnit = new Map<string, string>((invItems || []).map((i: any) => [i.id, i.unit]));

    const rows = recipeItems.map((r: any) => ({
      menu_item_id: createdItem.id,
      inventory_item_id: r.ingredientId,
      quantity_required: Number.parseFloat(String(r.quantity)) || 0,
      unit: idToUnit.get(r.ingredientId) || "unit",
    }));

    const { error: recipeErr } = await supabase
      .from("menu_item_ingredients")
      .insert(rows);
    if (recipeErr) throw new Error(recipeErr.message);
  }

  return { id: createdItem?.id };
}

export async function getProductRecipe(productId: string) {
  const { data, error } = await supabase
    .from("menu_item_ingredients")
    .select("inventory_item_id,quantity_required,unit")
    .eq("menu_item_id", productId);
  if (error) throw new Error(error.message);
  return (data || []).map((row: any) => ({
    ingredientId: row.inventory_item_id,
    quantity: String(row.quantity_required),
    unit: row.unit,
  }));
}

// Purchases
export async function getPurchases() {
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("id,supplier_id,notes,created_at")
    .order("created_at", { ascending: false });
  if (error) {
    // If table not present yet, return empty list gracefully
    return [] as any[];
  }
  return (data || []).map((row: any) => ({
    id: row.id,
    supplierId: row.supplier_id,
    notes: row.notes,
    createdAt: row.created_at,
  }));
}

export async function createPurchase(data: any) {
  const items = (data.items || []).map((it: any) => ({
    ingredientId: it.ingredientId,
    quantity: Number.parseFloat(String(it.quantity)) || 0,
    totalCostCents: Math.round((Number.parseFloat(String(it.totalCost)) || 0) * 100),
  }));

  const { data: result, error } = await supabase.rpc("create_purchase_order", {
    p_supplier_id: data.supplierId || null,
    p_notes: data.notes || null,
    p_items: items,
  });
  if (error) throw new Error(error.message);
  const row = Array.isArray(result) ? result[0] : result;
  return { id: row.id };
}

// Stock
export async function getCurrentStock() {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("id,name,qty,unit,low_threshold")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map((row: any) => ({
    ingredientId: row.id,
    ingredientName: row.name,
    totalQuantity: String(row.qty ?? 0),
    unit: row.unit,
    lowStockLevel: row.low_threshold !== null && row.low_threshold !== undefined ? String(row.low_threshold) : null,
  }));
}

export async function getLowStock() {
  const stock = await getCurrentStock();
  return stock.filter((item: any) => {
    if (item.lowStockLevel === null) return false;
    return Number.parseFloat(item.totalQuantity) < Number.parseFloat(item.lowStockLevel);
  });
}

export async function adjustStock(data: any) {
  const quantityNum = Number.parseFloat(String(data.quantity));
  if (Number.isNaN(quantityNum)) throw new Error("Invalid quantity");

  const { error } = await supabase.rpc("increment_inventory_qty", {
    p_item_id: data.ingredientId,
    p_delta: quantityNum,
  });

  // Fallback: direct update if RPC not available
  if (error) {
    const { data: item, error: fetchErr } = await supabase
      .from("inventory_items")
      .select("qty")
      .eq("id", data.ingredientId)
      .single();
    if (fetchErr) throw new Error(fetchErr.message);
    const newQty = (item?.qty ?? 0) + quantityNum;
    const { error: upErr } = await supabase
      .from("inventory_items")
      .update({ qty: newQty })
      .eq("id", data.ingredientId);
    if (upErr) throw new Error(upErr.message);
  }

  return { success: true } as const;
}

export async function getStockMovements(ingredientId?: string) {
  // Not implemented against Supabase yet
  return [] as any[];
}

// Sales
export async function getSales(from?: string, to?: string) {
  let query = supabase
    .from("orders")
    .select("id,total_cents,payment_method,created_at")
    .order("created_at", { ascending: false });
  if (from && to) {
    query = query
      .gte("created_at", new Date(from).toISOString())
      .lte("created_at", new Date(to).toISOString());
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []).map((row: any) => ({
    id: row.id,
    total: centsToDollars(row.total_cents),
    cogs: "0.00",
    paymentType: (row.payment_method || "OTHER").toUpperCase(),
    sessionId: null,
    createdAt: row.created_at,
  }));
}

export async function createSale(data: any) {
  const items = Array.isArray(data.items) ? data.items.map((i: any) => ({
    productId: i.productId,
    qty: i.qty,
  })) : [];

  const { data: result, error } = await supabase.rpc("create_pos_order", {
    p_items: items,
    p_payment_method: data.paymentType || "CASH",
  });
  if (error) throw new Error(error.message);
  const row = Array.isArray(result) ? result[0] : result;
  return {
    id: row.id,
    total: centsToDollars(row.total_cents),
    cogs: centsToDollars(row.cogs_cents || 0),
    paymentType: data.paymentType || "CASH",
    sessionId: data.sessionId || null,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export async function getSaleItems(saleId: string) {
  const { data, error } = await supabase
    .from("order_items")
    .select("menu_item_id,quantity,line_total_cents")
    .eq("order_id", saleId);
  if (error) throw new Error(error.message);
  return (data || []).map((row: any) => ({
    productId: row.menu_item_id,
    qty: row.quantity,
    unitPrice: centsToDollars((row.line_total_cents || 0) / Math.max(1, row.quantity)),
    lineTotal: centsToDollars(row.line_total_cents || 0),
  }));
}

// Cash Sessions
export async function getCashSessions() {
  const { data, error } = await supabase
    .from("cash_sessions")
    .select("id,opened_at,opening_float_cents,closed_at,closing_float_cents,notes")
    .order("opened_at", { ascending: false });
  if (error) {
    return [] as any[];
  }
  return (data || []).map((row: any) => ({
    id: row.id,
    openedAt: row.opened_at,
    openingFloat: (row.opening_float_cents ?? 0) / 100,
    closedAt: row.closed_at,
    closingFloat: row.closing_float_cents ? (row.closing_float_cents / 100) : null,
    notes: row.notes || null,
  }));
}

export async function getActiveCashSession() {
  const { data, error } = await supabase
    .from("cash_sessions")
    .select("id,opened_at,opening_float_cents,closed_at,closing_float_cents")
    .is("closed_at", null)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null as any;
  return {
    id: data.id,
    openedAt: data.opened_at,
    openingFloat: (data.opening_float_cents ?? 0) / 100,
    closedAt: data.closed_at,
    closingFloat: data.closing_float_cents ? (data.closing_float_cents / 100) : null,
  };
}

export async function openCashSession(data: any) {
  const openingCents = Math.round((Number.parseFloat(String(data.openingFloat)) || 0) * 100);
  const { data: result, error } = await supabase.rpc("open_cash_session", {
    p_opening_float_cents: openingCents,
    p_notes: data.notes || null,
  });
  if (error) throw new Error(error.message);
  const row = Array.isArray(result) ? result[0] : result;
  return {
    id: row.id,
    openedAt: row.opened_at,
    openingFloat: (row.opening_float_cents ?? 0) / 100,
  };
}

export async function closeCashSession(sessionId: string, data: any) {
  const closingCents = Math.round((Number.parseFloat(String(data.closingFloat)) || 0) * 100);
  const { data: result, error } = await supabase.rpc("close_cash_session", {
    p_session_id: sessionId,
    p_closing_float_cents: closingCents,
    p_notes: data.notes || null,
  });
  if (error) throw new Error(error.message);
  const row = Array.isArray(result) ? result[0] : result;
  return {
    id: row.id,
    closedAt: row.closed_at,
    closingFloat: (row.closing_float_cents ?? 0) / 100,
  };
}

// Expenses
export async function getExpenses() {
  return [] as any[];
}

export async function createExpense(data: any) {
  throw new Error("Expenses are not configured in Supabase yet.");
}

// Reports
export async function getOverview() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("orders")
    .select("total_cents")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());
  if (error) throw new Error(error.message);
  const revenueCents = (data || []).reduce((sum: number, r: any) => sum + (r.total_cents || 0), 0);
  const cogsCents = 0;
  return {
    revenue: centsToDollars(revenueCents),
    cogs: centsToDollars(cogsCents),
    grossMargin: centsToDollars(revenueCents - cogsCents),
    orderCount: (data || []).length,
  };
}

export async function getTopProducts(from?: string, to?: string) {
  let ordersQuery = supabase
    .from("orders")
    .select("id,created_at")
    .order("created_at", { ascending: false });
  if (from && to) {
    ordersQuery = ordersQuery
      .gte("created_at", new Date(from).toISOString())
      .lte("created_at", new Date(to).toISOString());
  }
  const { data: orders, error: ordersErr } = await ordersQuery;
  if (ordersErr) throw new Error(ordersErr.message);
  const orderIds = (orders || []).map((o: any) => o.id);
  if (orderIds.length === 0) return [] as any[];

  const { data: items, error: itemsErr } = await supabase
    .from("order_items")
    .select("order_id,menu_item_id,quantity,line_total_cents")
    .in("order_id", orderIds);
  if (itemsErr) throw new Error(itemsErr.message);

  const stats = new Map<string, { qty: number; revenueCents: number }>();
  for (const it of items || []) {
    const key = (it as any).menu_item_id as string;
    const entry = stats.get(key) || { qty: 0, revenueCents: 0 };
    entry.qty += (it as any).quantity || 0;
    entry.revenueCents += (it as any).line_total_cents || 0;
    stats.set(key, entry);
  }

  const ids = Array.from(stats.keys());
  if (ids.length === 0) return [] as any[];

  const { data: products, error: prodErr } = await supabase
    .from("menu_items")
    .select("id,name")
    .in("id", ids);
  if (prodErr) throw new Error(prodErr.message);
  const idToName = new Map<string, string>((products || []).map((p: any) => [p.id, p.name]));

  return ids.map((id) => {
    const s = stats.get(id)!;
    const name = idToName.get(id) || id;
    const sku = name.toUpperCase().replace(/\s+/g, "-");
    return {
      productId: id,
      productName: name,
      sku,
      totalQty: s.qty,
      totalRevenue: centsToDollars(s.revenueCents),
    };
  });
}

export async function getRecentActivity(limit: number = 10) {
  const { data, error } = await supabase
    .from("orders")
    .select("id,total_cents,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data || []).map((row: any) => ({
    type: "sale",
    id: row.id,
    description: `Sale of $${centsToDollars(row.total_cents)}`,
    amount: centsToDollars(row.total_cents),
    createdAt: row.created_at,
  }));
}

// User management for demo
let currentUserId: string | null = null;

export function setCurrentUser(userId: string) {
  currentUserId = userId;
  // Override the apiRequest to include user ID header
  const originalApiRequest = apiRequest;
  (window as any).apiRequest = async (method: string, url: string, data?: any) => {
    const res = await fetch(url, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        ...(currentUserId ? { "x-user-id": currentUserId } : {}),
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (!res.ok) {
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }
    return res;
  };
}

export function getCurrentUserId() {
  return currentUserId;
}
