import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/forms/button';
import { Input } from '../ui/forms/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/overlay/sheet';
import { Separator } from '../ui/layout/separator';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useCart } from '../../contexts/CartContext';
import { CheckoutModal } from './CheckoutModal';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { state, removeItem, updateQuantity } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity >= 0) {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  if ((state.items || []).length === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Shopping Cart</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">
              Add some products to get started!
            </p>
            <Button onClick={onClose}>Continue Shopping</Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle>Shopping Cart ({(state.items || []).length} items)</SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-4">
              {(state.items || []).map(item => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate mb-1">{item.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      ₹{item.price.toFixed(2)} each
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                          className="w-16 h-8 text-center"
                          min="0"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span>Subtotal:</span>
              <span>₹{state.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span>Total:</span>
              <span className="text-lg">₹{state.total.toFixed(2)}</span>
            </div>
            
            <div className="space-y-2">
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
              <Button variant="outline" className="w-full" onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </>
  );
};