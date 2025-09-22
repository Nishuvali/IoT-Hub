import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Download,
  Upload,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  unit_cost: number;
  selling_price: number;
  supplier: string;
  last_restocked: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  sku: string;
  location: string;
  created_at: string;
  updated_at: string;
}

interface StockMovement {
  id: string;
  product_id: string;
  product_name: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference: string;
  user_id: string;
  created_at: string;
}

interface InventoryAnalytics {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  averageStockLevel: number;
  topMovingItems: Array<{
    name: string;
    movements: number;
  }>;
  stockAlerts: Array<{
    product: string;
    currentStock: number;
    minLevel: number;
    status: 'low' | 'out';
  }>;
}

export const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    current_stock: '',
    min_stock_level: '',
    max_stock_level: '',
    unit_cost: '',
    selling_price: '',
    supplier: '',
    sku: '',
    location: ''
  });

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      
      // Load inventory items
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (inventoryError) throw inventoryError;

      // Transform data to inventory format
      const inventoryItems: InventoryItem[] = (inventoryData || []).map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        current_stock: item.stock_quantity || 0,
        min_stock_level: item.min_stock_level || 5,
        max_stock_level: item.max_stock_level || 100,
        unit_cost: item.unit_cost || 0,
        selling_price: item.price,
        supplier: item.supplier || 'Unknown',
        last_restocked: item.last_restocked || new Date().toISOString(),
        status: getStockStatus(item.stock_quantity || 0, item.min_stock_level || 5),
        sku: item.sku || `SKU-${item.id.slice(0, 8)}`,
        location: item.location || 'Warehouse A',
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setInventory(inventoryItems);

      // Load stock movements (mock data for now)
      const mockMovements: StockMovement[] = [
        {
          id: '1',
          product_id: inventoryItems[0]?.id || '',
          product_name: inventoryItems[0]?.name || '',
          movement_type: 'in',
          quantity: 50,
          reason: 'Purchase Order #PO-001',
          reference: 'PO-001',
          user_id: 'admin',
          created_at: new Date().toISOString()
        }
      ];
      setStockMovements(mockMovements);

      // Calculate analytics
      const analyticsData = calculateAnalytics(inventoryItems);
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Failed to load inventory:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (currentStock: number, minLevel: number): 'in_stock' | 'low_stock' | 'out_of_stock' => {
    if (currentStock === 0) return 'out_of_stock';
    if (currentStock <= minLevel) return 'low_stock';
    return 'in_stock';
  };

  const calculateAnalytics = (items: InventoryItem[]): InventoryAnalytics => {
    const totalProducts = items.length;
    const lowStockItems = items.filter(item => item.status === 'low_stock').length;
    const outOfStockItems = items.filter(item => item.status === 'out_of_stock').length;
    const totalValue = items.reduce((sum, item) => sum + (item.current_stock * item.unit_cost), 0);
    const averageStockLevel = items.reduce((sum, item) => sum + item.current_stock, 0) / totalProducts;

    const stockAlerts = items
      .filter(item => item.status !== 'in_stock')
      .map(item => ({
        product: item.name,
        currentStock: item.current_stock,
        minLevel: item.min_stock_level,
        status: item.status === 'out_of_stock' ? 'out' as const : 'low' as const
      }));

    const topMovingItems = items
      .sort((a, b) => b.current_stock - a.current_stock)
      .slice(0, 5)
      .map(item => ({
        name: item.name,
        movements: Math.floor(Math.random() * 100) // Mock data
      }));

    return {
      totalProducts,
      lowStockItems,
      outOfStockItems,
      totalValue,
      averageStockLevel,
      topMovingItems,
      stockAlerts
    };
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const inventoryData = {
        name: formData.name,
        category: formData.category,
        stock_quantity: parseInt(formData.current_stock),
        min_stock_level: parseInt(formData.min_stock_level),
        max_stock_level: parseInt(formData.max_stock_level),
        unit_cost: parseFloat(formData.unit_cost),
        price: parseFloat(formData.selling_price),
        supplier: formData.supplier,
        sku: formData.sku,
        location: formData.location,
        updated_at: new Date().toISOString()
      };

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('products')
          .update(inventoryData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Inventory item updated successfully');
      } else {
        // Create new item
        const { error } = await supabase
          .from('products')
          .insert(inventoryData);

        if (error) throw error;
        toast.success('Inventory item created successfully');
      }

      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
      loadInventoryData();
    } catch (error) {
      console.error('Failed to save inventory item:', error);
      toast.error('Failed to save inventory item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      current_stock: '',
      min_stock_level: '',
      max_stock_level: '',
      unit_cost: '',
      selling_price: '',
      supplier: '',
      sku: '',
      location: ''
    });
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      current_stock: item.current_stock.toString(),
      min_stock_level: item.min_stock_level.toString(),
      max_stock_level: item.max_stock_level.toString(),
      unit_cost: item.unit_cost.toString(),
      selling_price: item.selling_price.toString(),
      supplier: item.supplier,
      sku: item.sku,
      location: item.location
    });
    setIsDialogOpen(true);
  };

  const handleStockAdjustment = async (itemId: string, adjustment: number, reason: string) => {
    try {
      const item = inventory.find(i => i.id === itemId);
      if (!item) return;

      const newStock = item.current_stock + adjustment;
      
      const { error } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      // Add stock movement record
      const movement: StockMovement = {
        id: Date.now().toString(),
        product_id: itemId,
        product_name: item.name,
        movement_type: adjustment > 0 ? 'in' : 'out',
        quantity: Math.abs(adjustment),
        reason: reason,
        reference: `ADJ-${Date.now()}`,
        user_id: 'admin',
        created_at: new Date().toISOString()
      };

      setStockMovements(prev => [movement, ...prev]);
      toast.success('Stock adjusted successfully');
      loadInventoryData();
    } catch (error) {
      console.error('Failed to adjust stock:', error);
      toast.error('Failed to adjust stock');
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge variant="default" className="bg-green-500">In Stock</Badge>;
      case 'low_stock':
        return <Badge variant="secondary" className="bg-yellow-500">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadInventoryData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="microcontrollers">Microcontrollers</SelectItem>
                        <SelectItem value="sensors">Sensors</SelectItem>
                        <SelectItem value="motors">Motors</SelectItem>
                        <SelectItem value="communication">Communication</SelectItem>
                        <SelectItem value="power">Power</SelectItem>
                        <SelectItem value="displays">Displays</SelectItem>
                        <SelectItem value="kits">Kits</SelectItem>
                        <SelectItem value="components">Components</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="current_stock">Current Stock *</Label>
                    <Input
                      id="current_stock"
                      type="number"
                      value={formData.current_stock}
                      onChange={(e) => handleInputChange('current_stock', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="min_stock_level">Min Stock Level *</Label>
                    <Input
                      id="min_stock_level"
                      type="number"
                      value={formData.min_stock_level}
                      onChange={(e) => handleInputChange('min_stock_level', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_stock_level">Max Stock Level *</Label>
                    <Input
                      id="max_stock_level"
                      type="number"
                      value={formData.max_stock_level}
                      onChange={(e) => handleInputChange('max_stock_level', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit_cost">Unit Cost *</Label>
                    <Input
                      id="unit_cost"
                      type="number"
                      step="0.01"
                      value={formData.unit_cost}
                      onChange={(e) => handleInputChange('unit_cost', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="selling_price">Selling Price *</Label>
                    <Input
                      id="selling_price"
                      type="number"
                      step="0.01"
                      value={formData.selling_price}
                      onChange={(e) => handleInputChange('selling_price', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => handleInputChange('supplier', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingItem ? 'Update Item' : 'Create Item'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Active inventory items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{analytics.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Need restocking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{analytics.outOfStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Urgent restock needed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{analytics.totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Inventory value
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stock Alerts */}
      {analytics && analytics.stockAlerts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Stock Alerts:</strong> {analytics.stockAlerts.length} items need attention.
            {analytics.stockAlerts.slice(0, 3).map(alert => (
              <div key={alert.product} className="mt-1">
                • {alert.product}: {alert.currentStock} units (min: {alert.minLevel})
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inventory Items</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="microcontrollers">Microcontrollers</SelectItem>
                  <SelectItem value="sensors">Sensors</SelectItem>
                  <SelectItem value="motors">Motors</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="power">Power</SelectItem>
                  <SelectItem value="displays">Displays</SelectItem>
                  <SelectItem value="kits">Kits</SelectItem>
                  <SelectItem value="components">Components</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="font-semibold">{item.current_stock}</TableCell>
                  <TableCell>{item.min_stock_level}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>₹{item.unit_cost.toFixed(2)}</TableCell>
                  <TableCell>₹{item.selling_price.toFixed(2)}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStockAdjustment(item.id, 10, 'Manual adjustment')}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
