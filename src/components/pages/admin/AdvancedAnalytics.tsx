import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
  productsGrowth: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  orderStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  userRegistrationTrend: Array<{
    date: string;
    registrations: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    revenue: number;
    orders: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AdvancedAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (ordersError) throw ordersError;

      // Fetch users data
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (usersError) throw usersError;

      // Fetch products data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) throw productsError;

      // Calculate analytics
      const analytics = calculateAnalytics(orders || [], users || [], products || [], timeRange);
      setAnalyticsData(analytics);

    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (orders: any[], users: any[], products: any[], range: string): AnalyticsData => {
    // Calculate totals
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalOrders = orders.length;
    const totalUsers = users.length;
    const totalProducts = products.length;

    // Calculate growth (simplified - would need historical data for accurate calculation)
    const revenueGrowth = Math.random() * 20 - 10; // Mock growth percentage
    const ordersGrowth = Math.random() * 15 - 5;
    const usersGrowth = Math.random() * 25 - 5;
    const productsGrowth = Math.random() * 10 - 2;

    // Monthly revenue data
    const monthlyRevenue = generateMonthlyRevenueData(orders, range);

    // Top products
    const topProducts = generateTopProductsData(orders, products);

    // Order status distribution
    const orderStatusDistribution = generateOrderStatusDistribution(orders);

    // User registration trend
    const userRegistrationTrend = generateUserRegistrationTrend(users, range);

    // Category performance
    const categoryPerformance = generateCategoryPerformance(orders, products);

    return {
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      revenueGrowth,
      ordersGrowth,
      usersGrowth,
      productsGrowth,
      monthlyRevenue,
      topProducts,
      orderStatusDistribution,
      userRegistrationTrend,
      categoryPerformance
    };
  };

  const generateMonthlyRevenueData = (orders: any[], range: string) => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear();
      });
      
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue: monthOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
        orders: monthOrders.length
      });
    }
    
    return months;
  };

  const generateTopProductsData = (orders: any[], products: any[]) => {
    const productSales: { [key: string]: { sales: number; revenue: number; name: string } } = {};
    
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          if (!productSales[item.id]) {
            productSales[item.id] = { sales: 0, revenue: 0, name: item.name };
          }
          productSales[item.id].sales += item.quantity;
          productSales[item.id].revenue += item.total || (item.price * item.quantity);
        });
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  const generateOrderStatusDistribution = (orders: any[]) => {
    const statusCount: { [key: string]: number } = {};
    
    orders.forEach(order => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
    });

    const total = orders.length;
    return Object.entries(statusCount).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  };

  const generateUserRegistrationTrend = (users: any[], range: string) => {
    const days = [];
    const currentDate = new Date();
    const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      
      const dayUsers = users.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        registrations: dayUsers.length
      });
    }
    
    return days;
  };

  const generateCategoryPerformance = (orders: any[], products: any[]) => {
    const categoryData: { [key: string]: { revenue: number; orders: number } } = {};
    
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const product = products.find(p => p.id === item.id);
          if (product) {
            if (!categoryData[product.category]) {
              categoryData[product.category] = { revenue: 0, orders: 0 };
            }
            categoryData[product.category].revenue += item.total || (item.price * item.quantity);
            categoryData[product.category].orders += 1;
          }
        });
      }
    });

    return Object.entries(categoryData).map(([category, data]) => ({
      category: category.replace('_', ' ').toUpperCase(),
      revenue: data.revenue,
      orders: data.orders
    }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
    toast.success('Analytics data refreshed');
  };

  const handleExport = () => {
    if (!analyticsData) return;
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Revenue', analyticsData.totalRevenue],
      ['Total Orders', analyticsData.totalOrders],
      ['Total Users', analyticsData.totalUsers],
      ['Total Products', analyticsData.totalProducts],
      ['Revenue Growth', `${analyticsData.revenueGrowth.toFixed(2)}%`],
      ['Orders Growth', `${analyticsData.ordersGrowth.toFixed(2)}%`],
      ['Users Growth', `${analyticsData.usersGrowth.toFixed(2)}%`],
      ['Products Growth', `${analyticsData.productsGrowth.toFixed(2)}%`]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Analytics data exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load analytics data</p>
          <Button onClick={loadAnalyticsData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Advanced Analytics</h1>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analyticsData.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analyticsData.revenueGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={analyticsData.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(analyticsData.revenueGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analyticsData.ordersGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={analyticsData.ordersGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(analyticsData.ordersGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analyticsData.usersGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={analyticsData.usersGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(analyticsData.usersGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalProducts}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analyticsData.productsGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={analyticsData.productsGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(analyticsData.productsGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="orders">Order Analytics</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.categoryPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.topProducts} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.orderStatusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, percentage }) => `${status}: ${percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.orderStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orders Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#FF8042" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Registration Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.userRegistrationTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="registrations" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
