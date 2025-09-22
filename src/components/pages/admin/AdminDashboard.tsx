import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/layout/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/navigation/tabs';
import { Badge } from '../../ui/feedback/badge';
import { Button } from '../../ui/forms/button';
import { Input } from '../../ui/forms/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/forms/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/data-display/table';
import { AdminProductManager } from './AdminProductManager';
import { supabase } from '../../../database/supabase/client';
import { toast } from 'sonner';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Search,
  Filter,
  Eye,
  Edit,
  Truck,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  user_email: string;
  total_amount: number;
  status: string;
  shipping_status: string;
  shipping_address: any;
  payment_status: string;
  created_at: string;
  items: any[];
  tracking_number?: string;
  courier_name?: string;
}

interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: number;
  pendingOrders: number;
}

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders with simplified query first
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Orders data:', ordersData);
      console.log('Orders error:', ordersError);

      if (ordersError) {
        console.error('Orders fetch error:', ordersError);
        setOrders([]);
      } else {
        // Transform orders data
        const transformedOrders: Order[] = (ordersData || []).map(order => ({
          ...order,
          user_email: order.user_email || 'Unknown User',
          items: order.items || []
        }));

        setOrders(transformedOrders);
      }

      // Calculate analytics with fetched orders
      const currentOrders = ordersData || [];
      const totalRevenue = currentOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const pendingOrders = currentOrders.filter(order => order.status === 'pending').length;
      const recentOrders = currentOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate > weekAgo;
      }).length;

      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact' });

      // Fetch users count  
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      setAnalytics({
        totalOrders: currentOrders.length,
        totalRevenue,
        totalProducts: productsCount || 0,
        totalUsers: usersCount || 0,
        recentOrders,
        pendingOrders
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Order status updated successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const updateShippingInfo = async (orderId: string, trackingNumber: string, courierName: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          tracking_number: trackingNumber,
          courier_name: courierName,
          shipping_status: 'shipped'
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Shipping information updated successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating shipping info:', error);
      toast.error('Failed to update shipping information');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'shipped': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getShippingStatusIcon = (status: string) => {
    switch (status) {
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={fetchDashboardData}>Refresh Data</Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.pendingOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.recentOrders} orders this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Order Management</TabsTrigger>
          <TabsTrigger value="products">Product Management</TabsTrigger>
          <TabsTrigger value="shipping">Shipping & Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {/* Orders Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Shipping</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{order.user_email}</TableCell>
                      <TableCell>₹{order.total_amount}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getShippingStatusIcon(order.shipping_status)}
                          <span className="text-sm">{order.shipping_status || 'pending'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select 
                            value={order.status} 
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <AdminProductManager />
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orders
                .filter(order => order.status === 'processing' || order.status === 'shipped')
                .map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">{order.user_email}</p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        placeholder="Tracking Number"
                        defaultValue={order.tracking_number || ''}
                        onChange={(e) => {
                          const updatedOrders = orders.map(o => 
                            o.id === order.id 
                              ? { ...o, tracking_number: e.target.value }
                              : o
                          );
                          setOrders(updatedOrders);
                        }}
                      />
                      <Input
                        placeholder="Courier Name"
                        defaultValue={order.courier_name || ''}
                        onChange={(e) => {
                          const updatedOrders = orders.map(o => 
                            o.id === order.id 
                              ? { ...o, courier_name: e.target.value }
                              : o
                          );
                          setOrders(updatedOrders);
                        }}
                      />
                      <Button 
                        onClick={() => updateShippingInfo(
                          order.id, 
                          order.tracking_number || '', 
                          order.courier_name || ''
                        )}
                      >
                        Update Shipping
                      </Button>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};