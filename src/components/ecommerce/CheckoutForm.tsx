import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/layout/card';
import { Button } from '../ui/forms/button';
import { Input } from '../ui/forms/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/forms/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/forms/select';
import { Separator } from '../ui/layout/separator';
import { CreditCard, MapPin, User, Phone, Mail } from 'lucide-react';

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void;
  isLoading?: boolean;
  className?: string;
}

export interface CheckoutFormData {
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  email: string;
  notes?: string;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onSubmit,
  isLoading = false,
  className = ''
}) => {
  const [formData, setFormData] = React.useState<CheckoutFormData>({
    shippingAddress: {
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      phone: ''
    },
    billingAddress: {
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    },
    paymentMethod: '',
    email: '',
    notes: ''
  });

  const [useSameAddress, setUseSameAddress] = React.useState(true);

  const handleInputChange = (section: keyof CheckoutFormData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  React.useEffect(() => {
    if (useSameAddress) {
      setFormData(prev => ({
        ...prev,
        billingAddress: prev.shippingAddress
      }));
    }
  }, [useSameAddress, formData.shippingAddress]);

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
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
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shippingFirstName">First Name</Label>
              <Input
                id="shippingFirstName"
                value={formData.shippingAddress.firstName}
                onChange={(e) => handleInputChange('shippingAddress', 'firstName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="shippingLastName">Last Name</Label>
              <Input
                id="shippingLastName"
                value={formData.shippingAddress.lastName}
                onChange={(e) => handleInputChange('shippingAddress', 'lastName', e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="shippingStreet">Street Address</Label>
              <Input
                id="shippingStreet"
                value={formData.shippingAddress.street}
                onChange={(e) => handleInputChange('shippingAddress', 'street', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="shippingCity">City</Label>
              <Input
                id="shippingCity"
                value={formData.shippingAddress.city}
                onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="shippingState">State</Label>
              <Input
                id="shippingState"
                value={formData.shippingAddress.state}
                onChange={(e) => handleInputChange('shippingAddress', 'state', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="shippingPostalCode">Postal Code</Label>
              <Input
                id="shippingPostalCode"
                value={formData.shippingAddress.postalCode}
                onChange={(e) => handleInputChange('shippingAddress', 'postalCode', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="shippingPhone">Phone Number</Label>
              <Input
                id="shippingPhone"
                type="tel"
                value={formData.shippingAddress.phone}
                onChange={(e) => handleInputChange('shippingAddress', 'phone', e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useSameAddress}
                onChange={(e) => setUseSameAddress(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Same as shipping address</span>
            </label>
          </div>
          
          {!useSameAddress && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="billingFirstName">First Name</Label>
                <Input
                  id="billingFirstName"
                  value={formData.billingAddress.firstName}
                  onChange={(e) => handleInputChange('billingAddress', 'firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="billingLastName">Last Name</Label>
                <Input
                  id="billingLastName"
                  value={formData.billingAddress.lastName}
                  onChange={(e) => handleInputChange('billingAddress', 'lastName', e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="billingStreet">Street Address</Label>
                <Input
                  id="billingStreet"
                  value={formData.billingAddress.street}
                  onChange={(e) => handleInputChange('billingAddress', 'street', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="billingCity">City</Label>
                <Input
                  id="billingCity"
                  value={formData.billingAddress.city}
                  onChange={(e) => handleInputChange('billingAddress', 'city', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="billingState">State</Label>
                <Input
                  id="billingState"
                  value={formData.billingAddress.state}
                  onChange={(e) => handleInputChange('billingAddress', 'state', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="billingPostalCode">Postal Code</Label>
                <Input
                  id="billingPostalCode"
                  value={formData.billingAddress.postalCode}
                  onChange={(e) => handleInputChange('billingAddress', 'postalCode', e.target.value)}
                  required
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="net_banking">Net Banking</SelectItem>
                  <SelectItem value="cod">Cash on Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special instructions for your order..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto"
        >
          {isLoading ? 'Processing...' : 'Complete Order'}
        </Button>
      </div>
    </form>
  );
};
