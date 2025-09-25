import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import AuthForm from "@/components/auth-form";
import { DebugInfo } from "@/components/debug-info";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Products from "@/pages/products";
import Purchases from "@/pages/purchases";
import Sales from "@/pages/sales";
import Sessions from "@/pages/sessions";
import Expenses from "@/pages/expenses";
import Reports from "@/pages/reports";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/products" component={Products} />
      <Route path="/purchases" component={Purchases} />
      <Route path="/sales" component={Sales} />
      <Route path="/sessions" component={Sessions} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  // Check for missing environment variables
  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Configuration Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Missing Supabase environment variables. Please check your
              configuration.
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Create a{" "}
                <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">
                  .env
                </code>{" "}
                file in your project root with:
              </p>
              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                {`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return <Router />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
          {/* Temporary debug component for troubleshooting Apple device issues */}
          <DebugInfo />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
