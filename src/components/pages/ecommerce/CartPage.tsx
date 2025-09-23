import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, X, ShoppingBag, Truck, Shield } from 'lucide-react';
import { Button } from '../../ui/forms/button';
import { Input } from '../../ui/forms/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/layout/card';
import { Separator } from '../../ui/layout/separator';
import { Badge } from '../../ui/feedback/badge';
import { Checkbox } from '../../ui/forms/checkbox';
import { PageLayout } from '../../layouts/PageLayout';
import { PageHeader } from '../../common/ui/PageHeader';
import { EmptyState } from '../../common/ui/AlertMessage';
import { useCart } from '../../../contexts/CartContext';
import { CheckoutPage } from './CheckoutPage';

interface CartPageProps {
  // Removed onBack prop since we're using React Router
}

export const CartPage: React.FC<CartPageProps> = () => {
  const navigate = useNavigate();
  const { state, removeItem, updateQuantity } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set((state.items || []).map(item => item.id))
  );

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity >= 0) {
      updateQuantity(id, newQuantity);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set((state.items || []).map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const selectedItemsData = (state.items || []).filter(item => selectedItems.has(item.id));
  const selectedSubtotal = selectedItemsData.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingCost = selectedSubtotal > 500 ? 0 : 50;
  const tax = selectedSubtotal * 0.18; // 18% GST
  const total = selectedSubtotal + shippingCost + tax;

  if (showCheckout) {
    return <CheckoutPage onBack={() => setShowCheckout(false)} />;
  }

  if ((state.items || []).length === 0) {
    return (
      <PageLayout showHeader={false}>
        <PageHeader title="Shopping Cart" showBackButton showBreadcrumb={false} onBack={() => navigate(-1)} />
        <EmptyState
          icon={<ShoppingBag className="h-12 w-12" />}
          title="Your cart is empty"
          description="Add some products to get started!"
          action={<Button onClick={() => navigate('/')}>Continue Shopping</Button>}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout showHeader={false}>
      <PageHeader title="Shopping Cart" showBackButton showBreadcrumb={false} onBack={() => navigate(-1)} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Cart Items ({(state.items || []).length})</h2>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedItems.size === (state.items || []).length}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm">Select All</label>
              </div>
            </div>

            {(state.items || []).map(item => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                    />
                    
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                      <div className="text-lg font-semibold">₹{item.price.toFixed(2)}</div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                        min="0"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({selectedItemsData.length} items)</span>
                    <span>₹{selectedSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                      {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (GST)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowCheckout(true)}
                  className="w-full"
                  disabled={selectedItemsData.length === 0}
                >
                  Proceed to Checkout
                </Button>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>Free shipping on orders over ₹500</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Secure payment processing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};