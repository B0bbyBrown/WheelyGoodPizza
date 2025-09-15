import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  Percent, 
  ShoppingBag, 
  PizzaIcon,
  PillBottle,
  AlertTriangle,
  ScanBarcode,
  Package,
  ArrowRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { 
  getOverview, 
  getTopProducts, 
  getLowStock, 
  getRecentActivity 
} from "@/lib/api";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["/api/reports/overview"],
    queryFn: () => getOverview(),
  });

  const { data: topProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/reports/top-products"],
    queryFn: () => getTopProducts(),
  });

  const { data: lowStockItems = [], isLoading: stockLoading } = useQuery({
    queryKey: ["/api/stock/low"],
    queryFn: () => getLowStock(),
  });

  const { data: recentActivity = [], isLoading: activityLoading } = useQuery({
    queryKey: ["/api/reports/activity"],
    queryFn: () => getRecentActivity(5),
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const formatPercentage = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toFixed(1)}%`;
  };

  return (
    <Layout 
      title="Dashboard" 
      description="Overview of your pizza truck operations"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="kpi-cards">
        <Card data-testid="revenue-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold text-foreground" data-testid="today-revenue">
                  {overviewLoading ? "..." : formatCurrency(overview?.revenue || 0)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +12% vs yesterday
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="cogs-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">COGS</p>
                <p className="text-2xl font-bold text-foreground" data-testid="today-cogs">
                  {overviewLoading ? "..." : formatCurrency(overview?.cogs || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {overview && overview.revenue > 0 
                    ? `${((parseFloat(overview.cogs) / parseFloat(overview.revenue)) * 100).toFixed(0)}% of revenue`
                    : "0% of revenue"
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="margin-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gross Margin</p>
                <p className="text-2xl font-bold text-foreground" data-testid="gross-margin">
                  {overviewLoading ? "..." : formatPercentage(overview?.grossMargin || 0)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +2.3% vs yesterday
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Percent className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="orders-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Orders Today</p>
                <p className="text-2xl font-bold text-foreground" data-testid="today-orders">
                  {overviewLoading ? "..." : overview?.orderCount || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {overview && overview.orderCount > 0 
                    ? formatCurrency(parseFloat(overview.revenue) / overview.orderCount)
                    : "$0.00"
                  } per order
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="dashboard-grid">
        {/* Top Products */}
        <Card className="lg:col-span-2" data-testid="top-products-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Top Products Today</CardTitle>
              <Link href="/reports">
                <Button variant="ghost" size="sm" data-testid="view-all-products">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4" data-testid="products-list">
              {productsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : topProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sales today yet
                </div>
              ) : (
                topProducts.slice(0, 3).map((product: any) => (
                  <div 
                    key={product.productId} 
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    data-testid={`product-${product.sku.toLowerCase()}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        {product.sku.includes('PIZ') ? (
                          <PizzaIcon className="h-5 w-5 text-primary" />
                        ) : (
                          <PillBottle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground" data-testid={`product-name-${product.sku.toLowerCase()}`}>
                          {product.productName}
                        </p>
                        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground" data-testid={`product-qty-${product.sku.toLowerCase()}`}>
                        {product.totalQty} sold
                      </p>
                      <p className="text-sm text-green-600" data-testid={`product-revenue-${product.sku.toLowerCase()}`}>
                        {formatCurrency(product.totalRevenue)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card data-testid="low-stock-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Low Stock Alert</CardTitle>
              {lowStockItems.length > 0 && (
                <Badge variant="destructive" data-testid="low-stock-count">
                  {lowStockItems.length} items
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" data-testid="low-stock-list">
              {stockLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : lowStockItems.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  All ingredients well stocked!
                </div>
              ) : (
                lowStockItems.slice(0, 3).map((item: any) => {
                  const isCritical = parseFloat(item.totalQuantity) < parseFloat(item.lowStockLevel) / 2;
                  return (
                    <div 
                      key={item.ingredientId}
                      className={`flex items-center justify-between p-3 border rounded-lg low-stock ${
                        isCritical ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                      }`}
                      data-testid={`low-stock-${item.ingredientName.toLowerCase().replace(/ /g, '-')}`}
                    >
                      <div>
                        <p className={`font-medium ${isCritical ? 'text-red-800' : 'text-yellow-800'}`}>
                          {item.ingredientName}
                        </p>
                        <p className={`text-sm ${isCritical ? 'text-red-600' : 'text-yellow-600'}`}>
                          {parseFloat(item.totalQuantity).toFixed(1)}{item.unit} remaining
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={isCritical ? "destructive" : "secondary"} className="text-xs">
                          {isCritical ? "CRITICAL" : "LOW"}
                        </Badge>
                        <p className={`text-xs mt-1 ${isCritical ? 'text-red-500' : 'text-yellow-500'}`}>
                          Min: {parseFloat(item.lowStockLevel).toFixed(1)}{item.unit}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {lowStockItems.length > 0 && (
              <div className="mt-4">
                <Link href="/purchases">
                  <Button className="w-full" data-testid="create-purchase-order">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Create Purchase Order
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card data-testid="recent-activity-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Sales
              </Button>
              <Button variant="secondary" size="sm">
                All Activity
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4" data-testid="activity-list">
            {activityLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity
              </div>
            ) : (
              recentActivity.map((activity: any, index: number) => (
                <div 
                  key={activity.id || index}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors"
                  data-testid={`activity-${activity.type}-${index}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.type === 'sale' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {activity.type === 'sale' ? (
                        <ScanBarcode className="h-5 w-5 text-green-600" />
                      ) : (
                        <Package className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.type === 'sale' ? 'Cash Sale' : 'Stock Movement'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.amount && (
                      <p className="font-semibold text-green-600">
                        +{formatCurrency(activity.amount)}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          {recentActivity.length > 0 && (
            <div className="mt-6 text-center">
              <Link href="/reports">
                <Button variant="ghost" data-testid="view-full-activity">
                  View Full Activity Log <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales Chart Placeholder */}
      <Card data-testid="sales-chart-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Revenue</span>
              <div className="w-3 h-3 bg-primary rounded-full"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center" data-testid="chart-placeholder">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
              <p className="text-muted-foreground">Chart visualization will be implemented here</p>
              <p className="text-sm text-muted-foreground mt-2">
                Integration with Chart.js or similar charting library
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
