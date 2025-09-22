import React, { useState } from 'react';
import { CreditCard, MapPin, User, Mail, Phone, Smartphone } from 'lucide-react';
import { Button } from '../ui/forms/button';
import { Input } from '../ui/forms/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/overlay/dialog';
import { Separator } from '../ui/layout/separator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/layout/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/navigation/tabs';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../database/supabase/client';
import { toast } from 'sonner';
import { UPIPaymentModal } from './UPIPaymentModal';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { state, clearCart } = useCart();
  const { state: authState } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [formData, setFormData] = useState({
    email: authState.user?.email || '',
    firstName: authState.user?.firstName || '',
    lastName: authState.user?.lastName || '',
    address: '',
    city: '',
    postalCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authState.isAuthenticated) {
      toast.error('Please sign in to place an order');
      return;
    }

    if (state.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        user_id: authState.user?.id,
        total_amount: finalTotal,
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'upi',
        shipping_address: {
          name: `${formData.firstName} ${formData.lastName}`,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          email: formData.email
        },
        items: state.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        }))
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;
      
      setOrderId(data.id);
      setShowUPIModal(true);
      
    } catch (error: any) {
      console.error('Order creation failed:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUPIPaymentSuccess = async (transactionId: string) => {
    try {
      // Update order with payment details
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          payment_method: 'upi',
          payment_reference: transactionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Order placed successfully! You will receive a confirmation email shortly.');
      clearCart();
      onClose();
      setFormData({
        email: authState.user?.email || '',
        firstName: authState.user?.firstName || '',
        lastName: authState.user?.lastName || '',
        address: '',
        city: '',
        postalCode: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
      });
      setShowUPIModal(false);
      setOrderId('');
    } catch (error: any) {
      console.error('Payment update failed:', error);
      toast.error('Failed to update payment status. Please contact support.');
    }
  };

  const shippingCost: number = 0;
  const tax = state.total * 0.1; // 10% tax
  const finalTotal = state.total + shippingCost + tax;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>
            Complete your order by filling out the information below
          </DialogDescription>
        </DialogHeader>
        
        {!authState.isAuthenticated && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <p className="text-center text-muted-foreground">
              Please sign in to complete your order
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Checkout Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="upi" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upi" className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        UPI Payment
                      </TabsTrigger>
                      <TabsTrigger value="card" className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Card Payment
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upi" className="space-y-4">
                      <div className="text-center p-6 bg-muted rounded-lg">
                        <Smartphone className="w-12 h-12 mx-auto mb-4 text-primary" />
                        <h3 className="text-lg font-semibold mb-2">UPI Payment</h3>
                        <p className="text-muted-foreground mb-4">
                          Pay securely using UPI apps like PhonePe, Google Pay, Paytm
                        </p>
                        <div className="space-y-2 text-sm">
                          <p><strong>UPI ID:</strong> iotsolutions@paytm</p>
                          <p><strong>Amount:</strong> ₹{finalTotal.toFixed(2)}</p>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="card" className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            name="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={!authState.isAuthenticated || isProcessing || state.items.length === 0}
              >
                {isProcessing 
                  ? 'Processing...' 
                  : !authState.isAuthenticated 
                    ? 'Please sign in to place order'
                    : `Place Order - ₹${finalTotal.toFixed(2)}`
                }
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {state.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <p className="truncate">{item.name}</p>
                        <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{state.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>

      {/* UPI Payment Modal */}
      {orderId && (
        <UPIPaymentModal
          isOpen={showUPIModal}
          onClose={() => {
            setShowUPIModal(false);
            setOrderId('');
          }}
          orderData={{
            orderId,
            totalAmount: finalTotal,
            items: state.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price
            }))
          }}
          onPaymentSuccess={handleUPIPaymentSuccess}
        />
      )}
    </Dialog>
  );
};