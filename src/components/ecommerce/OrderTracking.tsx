import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/layout/card';
import { Badge } from '../ui/feedback/badge';
import { Button } from '../ui/forms/button';
import { Input } from '../ui/forms/input';
import { Label } from '../ui/label';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { ordersApi } from '../../database/supabase/api';
import { toast } from 'sonner';

interface TrackingInfo {
  orderId: string;
  status: string;
  trackingNumber: string;
  estimatedDelivery: string;
  timeline: Array<{
    status: string;
    timestamp: string;
    description: string;
  }>;
}

interface OrderTrackingProps {
  orderId?: string;
  onClose?: () => void;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId: initialOrderId, onClose }) => {
  const [orderId, setOrderId] = useState(initialOrderId || '');
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTrackingInfo = async (id: string) => {
    if (!id.trim()) {
      setError('Please enter an order ID');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const data = await ordersApi.getTracking(id);
      setTrackingInfo(data);
    } catch (error) {
      console.error('Error fetching tracking info:', error);
      setError('Order not found or tracking information unavailable');
      setTrackingInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrackingInfo(orderId);
  };

  useEffect(() => {
    if (initialOrderId) {
      fetchTrackingInfo(initialOrderId);
    }
  }, [initialOrderId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-orange-600" />;
      case 'delivered':
        return <MapPin className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (onClose) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Order Tracking</CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </CardHeader>
          <CardContent>
            <OrderTrackingContent
              orderId={orderId}
              setOrderId={setOrderId}
              trackingInfo={trackingInfo}
              isLoading={isLoading}
              error={error}
              handleSubmit={handleSubmit}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Track Your Order</h1>
      <OrderTrackingContent
        orderId={orderId}
        setOrderId={setOrderId}
        trackingInfo={trackingInfo}
        isLoading={isLoading}
        error={error}
        handleSubmit={handleSubmit}
        getStatusIcon={getStatusIcon}
        getStatusColor={getStatusColor}
        formatDate={formatDate}
      />
    </div>
  );
};

const OrderTrackingContent: React.FC<{
  orderId: string;
  setOrderId: (id: string) => void;
  trackingInfo: TrackingInfo | null;
  isLoading: boolean;
  error: string;
  handleSubmit: (e: React.FormEvent) => void;
  getStatusIcon: (status: string) => JSX.Element;
  getStatusColor: (status: string) => string;
  formatDate: (timestamp: string) => string;
}> = ({
  orderId,
  setOrderId,
  trackingInfo,
  isLoading,
  error,
  handleSubmit,
  getStatusIcon,
  getStatusColor,
  formatDate
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enter Order ID</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="orderId" className="sr-only">Order ID</Label>
              <Input
                id="orderId"
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter your order ID (e.g., ORD_123456)"
                className="w-full"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Tracking...' : 'Track Order'}
            </Button>
          </form>
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </CardContent>
      </Card>

      {trackingInfo && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order Details</span>
                <Badge className={getStatusColor(trackingInfo.status)}>
                  {trackingInfo.status.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">{trackingInfo.orderId}</p>
                </div>
                {trackingInfo.trackingNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-semibold">{trackingInfo.trackingNumber}</p>
                  </div>
                )}
                {trackingInfo.estimatedDelivery && (
                  <div>
                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                    <p className="font-semibold">{formatDate(trackingInfo.estimatedDelivery)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tracking Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trackingInfo.timeline.map((event, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(event.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold capitalize">{event.status}</h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};