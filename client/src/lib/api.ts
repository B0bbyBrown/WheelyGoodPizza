import { apiRequest } from "./queryClient";
import {
  NewPurchase,
  NewSale,
  StockAdjustment,
  OpenSessionRequest,
  CloseSessionRequest,
} from "@shared/schema";

// Ingredients
export const getIngredients = () =>
  apiRequest("GET", "/api/ingredients").then((r) => r.json());
export const createIngredient = (data: any) =>
  apiRequest("POST", "/api/ingredients", data);

// Suppliers
export const getSuppliers = () =>
  apiRequest("GET", "/api/suppliers").then((r) => r.json());
export const createSupplier = (data: any) =>
  apiRequest("POST", "/api/suppliers", data);

// Products
export const getProducts = () =>
  apiRequest("GET", "/api/products").then((r) => r.json());
export const createProduct = (data: any) =>
  apiRequest("POST", "/api/products", data);
export const getProductRecipe = (productId: string) =>
  apiRequest("GET", `/api/products/${productId}/recipe`).then((r) => r.json());

// Purchases
export const getPurchases = () =>
  apiRequest("GET", "/api/purchases").then((r) => r.json());
export const createPurchase = (data: NewPurchase) =>
  apiRequest("POST", "/api/purchases", data);

// Stock
export const getCurrentStock = () =>
  apiRequest("GET", "/api/stock/current").then((r) => r.json());
export const getLowStock = () =>
  apiRequest("GET", "/api/stock/low").then((r) => r.json());
export const adjustStock = (data: StockAdjustment) =>
  apiRequest("POST", "/api/stock/adjust", data);
export const getStockMovements = (ingredientId?: string) =>
  apiRequest(
    "GET",
    `/api/stock/movements${ingredientId ? `?ingredientId=${ingredientId}` : ""}`
  ).then((r) => r.json());

// Sales
export const getSales = (from?: string, to?: string) => {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return apiRequest("GET", `/api/sales?${params.toString()}`).then((r) =>
    r.json()
  );
};
export const createSale = (data: NewSale) =>
  apiRequest("POST", "/api/sales", data);
export const getSaleItems = (saleId: string) =>
  apiRequest("GET", `/api/sales/${saleId}/items`).then((r) => r.json());

// Cash Sessions
export const getCashSessions = () =>
  apiRequest("GET", "/api/sessions").then((r) => r.json());
export const getActiveCashSession = () =>
  apiRequest("GET", "/api/sessions/active").then((r) => r.json());
export const openCashSession = (data: OpenSessionRequest) => {
  console.log("Opening session with data:", JSON.stringify(data, null, 2));
  return apiRequest("POST", "/api/sessions/open", data).then((r) => r.json());
};
export const closeCashSession = (
  sessionId: string,
  data: CloseSessionRequest
) =>
  apiRequest("POST", `/api/sessions/${sessionId}/close`, data).then((r) =>
    r.json()
  );

// Expenses
export const getExpenses = () =>
  apiRequest("GET", "/api/expenses").then((r) => r.json());
export const createExpense = (data: any) =>
  apiRequest("POST", "/api/expenses", data);

// Reports
export const getOverview = () =>
  apiRequest("GET", "/api/reports/overview").then((r) => r.json());
export const getTopProducts = (from?: string, to?: string) => {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return apiRequest(
    "GET",
    `/api/reports/top-products?${params.toString()}`
  ).then((r) => r.json());
};
export const getRecentActivity = (limit: number = 10) =>
  apiRequest("GET", `/api/reports/activity?limit=${limit}`).then((r) =>
    r.json()
  );
