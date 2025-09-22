import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, User, Mail, Phone, CreditCard, Smartphone } from 'lucide-react';
import { Button } from '../../ui/forms/button';
import { Input } from '../../ui/forms/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/layout/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/navigation/tabs';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../database/supabase/client';
import { toast } from 'sonner';
import { UPIPaymentModal } from '../../ecommerce/UPIPaymentModal';

interface CheckoutPageProps {
  // Removed onBack prop since we're using React Router
}

export const CheckoutPage: React.FC<CheckoutPageProps> = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useCart();
  const { state: authState } = useAuth();
  
  const [formData, setFormData] = useState({
    email: authState.user?.email || '',
    firstName: authState.user?.firstName || '',
    lastName: authState.user?.lastName || '',
    flatNo: '',
    apartmentName: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    phone: authState.user?.mobileNumber || '',
  });

  const [showUPIModal, setShowUPIModal] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authState.isAuthenticated) {
      toast.error('Please sign in to complete your order');
      return;
    }

    // Validate required fields
    const requiredFields = ['email', 'firstName', 'lastName', 'streetAddress', 'city', 'state', 'zipCode'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Create order
      const orderData = {
        user_id: authState.user?.id,
        items: state.items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
        total_amount: state.total + (state.total * 0.1), // Including tax
        shipping_address: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          flatNo: formData.flatNo,
          apartmentName: formData.apartmentName,
          streetAddress: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        payment_method: 'upi',
        status: 'pending',
      };

      const { data: order, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      setOrderId(order.id);
      setShowUPIModal(true);
    } catch (error: any) {
      console.error('Order creation failed:', error);
      toast.error('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUPIPaymentSuccess = async (transactionId: string) => {
    if (!orderId) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_id: transactionId,
          payment_status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;

      // Clear cart
      dispatch({ type: 'CLEAR_CART' });
      
      toast.success('Order placed successfully!');
      navigateToHome();
    } catch (error: any) {
      console.error('Payment update failed:', error);
      toast.error('Failed to update payment status. Please contact support.');
    }
  };

  const shippingCost: number = 0;
  const tax = state.total * 0.1; // 10% tax
  const finalTotal = state.total + shippingCost + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cart
              </Button>
              <h1 className="text-xl font-semibold">Checkout</h1>
            </div>
            <div className="text-sm text-gray-500">
              Secure checkout powered by IoT Hub
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        placeholder="John"
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
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="flatNo">Flat/Door Number</Label>
                    <Input
                      id="flatNo"
                      name="flatNo"
                      value={formData.flatNo}
                      onChange={handleInputChange}
                      placeholder="Flat 101, Door No. 123"
                    />
                  </div>

                  <div>
                    <Label htmlFor="apartmentName">Apartment/Building Name</Label>
                    <Input
                      id="apartmentName"
                      name="apartmentName"
                      value={formData.apartmentName}
                      onChange={handleInputChange}
                      placeholder="ABC Apartments, XYZ Building (Leave blank for independent house)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="streetAddress">Street Address</Label>
                    <Input
                      id="streetAddress"
                      name="streetAddress"
                      value={formData.streetAddress}
                      onChange={handleInputChange}
                      required
                      placeholder="123 Main Street, Area Name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        placeholder="Bangalore"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        placeholder="Karnataka"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        placeholder="560001"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="upi" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upi" className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        UPI Payment
                      </TabsTrigger>
                      <TabsTrigger value="card" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Card Payment
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="upi" className="mt-4">
                      <div className="text-center py-8">
                        <Smartphone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">
                          UPI payment will be processed after order confirmation
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="card" className="mt-4">
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">
                          Card payment integration coming soon
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || !authState.isAuthenticated}
                  className="px-8"
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">₹{item.price.toFixed(2)}</p>
                  </div>
                ))}
                
                <div className="border-t pt-4 space-y-2">
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
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* UPI Payment Modal */}
      {showUPIModal && orderId && (
        <UPIPaymentModal
          isOpen={showUPIModal}
          onClose={() => setShowUPIModal(false)}
          orderData={{
            orderId,
            totalAmount: finalTotal,
            items: state.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          }}
          onPaymentSuccess={handleUPIPaymentSuccess}
        />
      )}
    </div>
  );
};
