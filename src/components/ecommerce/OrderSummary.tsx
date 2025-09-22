import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/layout/card';
import { Button } from '../ui/forms/button';
import { Badge } from '../ui/feedback/badge';
import { Separator } from '../ui/layout/separator';
import { Order, OrderItem } from '../../contexts/CartContext';
import { Package, Truck, CreditCard, MapPin } from 'lucide-react';

interface OrderSummaryProps {
  order: Order;
  showActions?: boolean;
  onTrackOrder?: (orderId: string) => void;
  onReorder?: (orderId: string) => void;
  className?: string;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  order,
  showActions = true,
  onTrackOrder,
  onReorder,
  className = ''
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order #{order.id}
          </CardTitle>
          <Badge className={getStatusColor(order.status)}>
            {order.status}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          Placed on {new Date(order.created_at).toLocaleDateString()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Order Items */}
        <div>
          <h4 className="font-medium mb-2">Items</h4>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <img
                    src={item.product.image || '/placeholder-product.svg'}
                    alt={item.product.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                  <span>{item.product.name}</span>
                </div>
                <div className="text-right">
                  <div>Qty: {item.quantity}</div>
                  <div className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Order Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{order.total_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>₹{order.shipping_cost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>₹{order.tax_amount.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-medium">
            <span>Total:</span>
            <span>₹{(order.total_amount + order.shipping_cost + order.tax_amount).toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shipping_address && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Shipping Address
            </h4>
            <div className="text-sm text-muted-foreground">
              <div>{order.shipping_address.street}</div>
              <div>{order.shipping_address.city}, {order.shipping_address.state}</div>
              <div>{order.shipping_address.postal_code}</div>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-4">
            {onTrackOrder && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTrackOrder(order.id)}
                className="flex-1"
              >
                <Truck className="h-4 w-4 mr-2" />
                Track Order
              </Button>
            )}
            {onReorder && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReorder(order.id)}
                className="flex-1"
              >
                <Package className="h-4 w-4 mr-2" />
                Reorder
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface OrderStatusProps {
  status: string;
  className?: string;
}

export const OrderStatus: React.FC<OrderStatusProps> = ({
  status,
  className = ''
}) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    processing: { color: 'bg-blue-100 text-blue-800', icon: '🔄' },
    shipped: { color: 'bg-purple-100 text-purple-800', icon: '🚚' },
    delivered: { color: 'bg-green-100 text-green-800', icon: '✅' },
    cancelled: { color: 'bg-red-100 text-red-800', icon: '❌' }
  };

  const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || 
    statusConfig.pending;

  return (
    <Badge className={`${config.color} ${className}`}>
      <span className="mr-1">{config.icon}</span>
      {status}
    </Badge>
  );
};
