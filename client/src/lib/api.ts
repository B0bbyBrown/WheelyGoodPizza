import { apiRequest } from "./queryClient";

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
  const res = await apiRequest("GET", "/api/ingredients");
  return res.json();
}

export async function createIngredient(data: any) {
  const res = await apiRequest("POST", "/api/ingredients", data);
  return res.json();
}

// Suppliers
export async function getSuppliers() {
  const res = await apiRequest("GET", "/api/suppliers");
  return res.json();
}

export async function createSupplier(data: any) {
  const res = await apiRequest("POST", "/api/suppliers", data);
  return res.json();
}

// Products
export async function getProducts() {
  const res = await apiRequest("GET", "/api/products");
  return res.json();
}

export async function createProduct(data: any) {
  const res = await apiRequest("POST", "/api/products", data);
  return res.json();
}

export async function getProductRecipe(productId: string) {
  const res = await apiRequest("GET", `/api/products/${productId}/recipe`);
  return res.json();
}

// Purchases
export async function getPurchases() {
  const res = await apiRequest("GET", "/api/purchases");
  return res.json();
}

export async function createPurchase(data: any) {
  const res = await apiRequest("POST", "/api/purchases", data);
  return res.json();
}

// Stock
export async function getCurrentStock() {
  const res = await apiRequest("GET", "/api/stock/current");
  return res.json();
}

export async function getLowStock() {
  const res = await apiRequest("GET", "/api/stock/low");
  return res.json();
}

export async function adjustStock(data: any) {
  const res = await apiRequest("POST", "/api/stock/adjust", data);
  return res.json();
}

export async function getStockMovements(ingredientId?: string) {
  const url = ingredientId ? `/api/stock/movements?ingredientId=${ingredientId}` : "/api/stock/movements";
  const res = await apiRequest("GET", url);
  return res.json();
}

// Sales
export async function getSales(from?: string, to?: string) {
  let url = "/api/sales";
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  if (params.toString()) url += `?${params.toString()}`;
  
  const res = await apiRequest("GET", url);
  return res.json();
}

export async function createSale(data: any) {
  const res = await apiRequest("POST", "/api/sales", data);
  return res.json();
}

export async function getSaleItems(saleId: string) {
  const res = await apiRequest("GET", `/api/sales/${saleId}/items`);
  return res.json();
}

// Cash Sessions
export async function getCashSessions() {
  const res = await apiRequest("GET", "/api/sessions");
  return res.json();
}

export async function getActiveCashSession() {
  const res = await apiRequest("GET", "/api/sessions/active");
  return res.json();
}

export async function openCashSession(data: any) {
  const res = await apiRequest("POST", "/api/sessions/open", data);
  return res.json();
}

export async function closeCashSession(sessionId: string, data: any) {
  const res = await apiRequest("POST", `/api/sessions/${sessionId}/close`, data);
  return res.json();
}

// Expenses
export async function getExpenses() {
  const res = await apiRequest("GET", "/api/expenses");
  return res.json();
}

export async function createExpense(data: any) {
  const res = await apiRequest("POST", "/api/expenses", data);
  return res.json();
}

// Reports
export async function getOverview() {
  const res = await apiRequest("GET", "/api/reports/overview");
  return res.json();
}

export async function getTopProducts(from?: string, to?: string) {
  let url = "/api/reports/top-products";
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  if (params.toString()) url += `?${params.toString()}`;
  
  const res = await apiRequest("GET", url);
  return res.json();
}

export async function getRecentActivity(limit: number = 10) {
  const res = await apiRequest("GET", `/api/reports/activity?limit=${limit}`);
  return res.json();
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
