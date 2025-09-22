import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../database/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/layout/card';
import { Button } from '../../ui/forms/button';
import { Input } from '../../ui/forms/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/feedback/badge';
import { Separator } from '../../ui/layout/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/forms/select';
import { User, Mail, Phone, MapPin, Package, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { MobileVerification } from '../../common/auth/MobileVerification';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface Address {
  id: string;
  user_id: string;
  type: 'home' | 'office' | 'other';
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_address: any;
  items: any[];
  created_at: string;
  updated_at: string;
}

export const Profile: React.FC = () => {
  const { state } = useAuth();
  const user = state.user;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showMobileVerification, setShowMobileVerification] = useState(false);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState('');
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    type: 'home',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    is_default: false,
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      // Parse existing phone number to extract country code and number
      if (profile.phone) {
        const phoneMatch = profile.phone.match(/^(\+\d{1,3})\s*(.+)$/);
        if (phoneMatch) {
          setCountryCode(phoneMatch[1]);
          setPhoneNumber(phoneMatch[2]);
        } else {
          setPhoneNumber(profile.phone);
        }
      }
    }
  }, [profile]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData || {
          id: user.id,
          first_name: user.firstName || '',
          last_name: user.lastName || '',
          email: user.email || '',
          phone: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      // Fetch addresses
      const { data: addressesData, error: addressesError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (addressesError) {
        console.error('Error fetching addresses:', addressesError);
      } else {
        setAddresses(addressesData || []);
      }

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
      } else {
        setOrders(ordersData || []);
      }

    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user || !profile) return;

    // Validate phone number
    if (phoneNumber && phoneNumber.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    // Check if phone number has changed
    const currentPhone = profile.phone ? profile.phone.replace(/^\+\d{1,3}\s*/, '') : '';
    const newPhone = phoneNumber;
    
    if (newPhone && newPhone !== currentPhone) {
      // Phone number has changed, require verification
      setPendingPhoneNumber(newPhone);
      setShowMobileVerification(true);
      return;
    }

    // No phone number change, proceed with normal update
    await performProfileUpdate();
  };

  const performProfileUpdate = async () => {
    if (!user || !profile) return;

    try {
      const fullPhoneNumber = phoneNumber ? `${countryCode} ${phoneNumber}` : '';
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: fullPhoneNumber,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
        return;
      }

      // Update local profile state
      setProfile({
        ...profile,
        phone: fullPhoneNumber,
      });

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleMobileVerified = async (verifiedPhone: string) => {
    // Update the phone number with the verified one
    const phoneWithoutCountryCode = verifiedPhone.replace(/^\+\d{1,3}\s*/, '');
    setPhoneNumber(phoneWithoutCountryCode);
    
    // Close verification modal
    setShowMobileVerification(false);
    setPendingPhoneNumber('');
    
    // Proceed with profile update
    await performProfileUpdate();
  };

  const handleMobileVerificationCancel = () => {
    setShowMobileVerification(false);
    setPendingPhoneNumber('');
    // Reset phone number to original value
    if (profile?.phone) {
      const phoneMatch = profile.phone.match(/^(\+\d{1,3})\s*(.+)$/);
      if (phoneMatch) {
        setCountryCode(phoneMatch[1]);
        setPhoneNumber(phoneMatch[2]);
      } else {
        setPhoneNumber(profile.phone);
      }
    } else {
      setPhoneNumber('');
    }
  };

  const addAddress = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          ...newAddress,
        });

      if (error) {
        console.error('Error adding address:', error);
        toast.error('Failed to add address');
        return;
      }

      toast.success('Address added successfully');
      setNewAddress({
        type: 'home',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        is_default: false,
      });
      fetchProfileData();
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) {
        console.error('Error deleting address:', error);
        toast.error('Failed to delete address');
        return;
      }

      toast.success('Address deleted successfully');
      fetchProfileData();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.first_name}
                      onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.last_name}
                      onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+91">🇮🇳 +91</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      value={phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                        if (value.length <= 10) {
                          setPhoneNumber(value);
                        }
                      }}
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Enter 10-digit phone number</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={updateProfile} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{profile.first_name} {profile.last_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{user?.email || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{profile?.phone || 'Not provided'}</span>
                  </div>
                </div>
                <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Saved Addresses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Saved Addresses
            </CardTitle>
            <CardDescription>
              Manage your delivery addresses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div key={address.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium capitalize">{address.type}</span>
                          {address.is_default && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {address.address_line_1}
                          {address.address_line_2 && `, ${address.address_line_2}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.state} - {address.postal_code}
                        </p>
                        <p className="text-sm text-gray-600">{address.country}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAddress(address.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No saved addresses</p>
            )}

            {/* Add New Address */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Add New Address</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="addressType">Address Type</Label>
                  <select
                    id="addressType"
                    value={newAddress.type}
                    onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value as any })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="home">Home</option>
                    <option value="office">Office</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="addressLine1">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    value={newAddress.address_line_1}
                    onChange={(e) => setNewAddress({ ...newAddress, address_line_1: e.target.value })}
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                  <Input
                    id="addressLine2"
                    value={newAddress.address_line_2}
                    onChange={(e) => setNewAddress({ ...newAddress, address_line_2: e.target.value })}
                    placeholder="Apartment, suite, etc."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      placeholder="State"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={newAddress.postal_code}
                      onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                      placeholder="123456"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                      placeholder="Country"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={newAddress.is_default}
                    onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isDefault">Set as default address</Label>
                </div>
                <Button onClick={addAddress} className="w-full">
                  Add Address
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Orders
          </CardTitle>
          <CardDescription>
            Your recent order history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">Order #{order.id.slice(-8)}</h4>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{order.total_amount}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Payment Status: <span className="capitalize">{order.payment_status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600">You haven't placed any orders yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Verification Modal */}
      {showMobileVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <MobileVerification
            phoneNumber={pendingPhoneNumber}
            onVerified={handleMobileVerified}
            onCancel={handleMobileVerificationCancel}
          />
        </div>
      )}
    </div>
  );
};
