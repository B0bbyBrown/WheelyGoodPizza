import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Products from "@/pages/products";
import Purchases from "@/pages/purchases";
import Sales from "@/pages/sales";
import Sessions from "@/pages/sessions";
import Expenses from "@/pages/expenses";
import Reports from "@/pages/reports";
import { setCurrentUser } from "@/lib/api";
import { useEffect } from "react";

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

function App() {
  useEffect(() => {
    // For demo purposes, get the admin user ID from the server
    // In production, this would be handled by proper authentication
    fetch("/api/auth/demo-admin")
      .then(res => res.json())
      .then(data => {
        if (data.adminId) {
          setCurrentUser(data.adminId);
          console.log("Set current user to admin:", data.adminId);
        } else {
          console.error("No admin user found");
        }
      })
      .catch(error => {
        console.error("Failed to get admin user:", error);
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
