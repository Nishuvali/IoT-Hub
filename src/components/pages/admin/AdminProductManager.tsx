import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/forms/button';
import { Input } from '../../ui/forms/input';
import { Textarea } from '../../ui/forms/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/forms/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/layout/card';
import { Badge } from '../../ui/feedback/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/navigation/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/overlay/dialog';
import { Label } from '../../ui/label';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../../database/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  image_url: string;
  stock_quantity: number;
  features?: string[];
  specifications?: Record<string, string>;
  created_at: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  subcategory: string;
  image_url: string;
  stock_quantity: string;
  features: string[];
  specifications: Record<string, string>;
}

const categories = [
  'iot_components',
  'digital_projects'
];

const subcategories = {
  'iot_components': [
    'microcontrollers',
    'sensors', 
    'motors',
    'communication',
    'power',
    'displays',
    'kits',
    'components',
    'actuators'
  ],
  'digital_projects': [
    'home_automation',
    'monitoring',
    'security',
    'cse-projects',
    'ai-ml-projects',
    'cybersecurity-projects'
  ]
};

export function AdminProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    image_url: '',
    stock_quantity: '',
    features: [],
    specifications: {}
  });

  // Fetch products from Supabase
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('products_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        (payload) => {
          console.log('Real-time product change:', payload);
          fetchProducts(); // Refresh products when any change occurs
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Form handlers
  const handleInputChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper functions for features and specifications
  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, '': '' }
    }));
  };

  const updateSpecification = (key: string, value: string, oldKey?: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      if (oldKey && oldKey !== key) {
        delete newSpecs[oldKey];
      }
      if (key && value) {
        newSpecs[key] = value;
      }
      return { ...prev, specifications: newSpecs };
    });
  };

  const removeSpecification = (key: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      subcategory: '',
      image_url: '',
      stock_quantity: '',
      features: [],
      specifications: {}
    });
    setEditingProduct(null);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      subcategory: product.subcategory || '',
      image_url: product.image_url,
      stock_quantity: product.stock_quantity.toString(),
      features: product.features || [],
      specifications: product.specifications || {}
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      subcategory: formData.subcategory,
      image_url: formData.image_url,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      features: formData.features,
      specifications: formData.specifications
    };

    try {
      let result;
      
      if (editingProduct) {
        // Update existing product
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
      } else {
        // Create new product
        result = await supabase
          .from('products')
          .insert(productData);
      }

      if (result.error) {
        throw result.error;
      }

      toast.success(editingProduct ? 'Product updated successfully' : 'Product created successfully');
      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error saving product');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

  const toggleProductStatus = async (id: string, stockQuantity: number) => {
    try {
      console.log(`🔄 Toggling product ${id} visibility based on stock: ${stockQuantity}`);

      // If stock is 0, set to 1 to make it visible
      // If stock > 0, set to 0 to hide it
      const newStock = stockQuantity === 0 ? 1 : 0;

      const { error } = await supabase
        .from('products')
        .update({
          stock_quantity: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log(`✅ Product ${id} stock updated to ${newStock}`);
      toast.success(`Product ${newStock > 0 ? 'made visible' : 'hidden'} successfully`);

      // Refresh products to show updated status
      await fetchProducts();
    } catch (error: any) {
      console.error('Error updating product status:', error);
      toast.error(`Error updating product status: ${error.message || 'Unknown error'}`);
    }
  };

  if (loading) {
    return <div className="p-6">Loading products...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
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
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />
              </div>

              {/* Features Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Features</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Feature
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {formData.features.length === 0 && (
                    <p className="text-sm text-muted-foreground">No features added yet.</p>
                  )}
                </div>
              </div>

              {/* Specifications Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Specifications</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSpecification}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Specification
                  </Button>
                </div>
                <div className="space-y-2">
                  {Object.entries(formData.specifications).map(([key, value], index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={key}
                        onChange={(e) => updateSpecification(e.target.value, value, key)}
                        placeholder="Specification name"
                        className="w-1/3"
                      />
                      <Input
                        value={value}
                        onChange={(e) => updateSpecification(key, e.target.value)}
                        placeholder="Specification value"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSpecification(key)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {Object.keys(formData.specifications).length === 0 && (
                    <p className="text-sm text-muted-foreground">No specifications added yet.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Products ({products.length})</TabsTrigger>
          <TabsTrigger value="physical">Physical Products</TabsTrigger>
          <TabsTrigger value="digital">Digital Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleProductStatus(product.id, product.stock_quantity)}
                      >
                        {product.stock_quantity > 0 ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Badge variant={product.stock_quantity > 0 ? "default" : "secondary"}>
                        {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                      </Badge>
                      <span className="font-semibold">₹{product.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Category: {product.category.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Stock: {product.stock_quantity}
                    </p>
                    {product.description && (
                      <p className="text-sm line-clamp-2">{product.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="physical" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.filter(p => !p.category.includes('projects')).map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Badge variant={product.stock_quantity > 0 ? "default" : "secondary"}>
                        {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                      </Badge>
                      <span className="font-semibold">₹{product.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Stock: {product.stock_quantity}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="digital" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.filter(p => p.category.includes('projects')).map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Badge variant={product.active ? "default" : "secondary"}>
                        {product.active ? "Active" : "Inactive"}
                      </Badge>
                      <span className="font-semibold">₹{product.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Category: {product.category.replace('-', ' ')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}