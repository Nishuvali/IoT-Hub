import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../database/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/layout/card';
import { Button } from '../../ui/forms/button';
import { Badge } from '../../ui/feedback/badge';
import { Separator } from '../../ui/layout/separator';
import { Package, Truck, CheckCircle, Clock, XCircle, Eye, Download, ExternalLink, MapPin, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

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
  tracking_number?: string;
  tracking_url?: string;
  carrier?: string;
  estimated_delivery?: string;
  notes?: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  product_type: 'physical' | 'digital_project';
}

export const MyOrders: React.FC = () => {
  const { state } = useAuth();
  const user = state.user;
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) {
        console.error('Error fetching order items:', error);
        return;
      }

      setOrderItems(data || []);
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'processing':
        return <Package className="h-5 w-5 text-yellow-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTrackShipment = (order: Order) => {
    if (order.tracking_url) {
      window.open(order.tracking_url, '_blank');
    } else if (order.tracking_number) {
      // Generate tracking URL based on carrier
      const trackingUrl = generateTrackingUrl(order.tracking_number, order.carrier);
      window.open(trackingUrl, '_blank');
    } else {
      toast.error('Tracking information not available yet');
    }
  };

  const generateTrackingUrl = (trackingNumber: string, carrier?: string) => {
    const carriers = {
      'bluedart': `https://www.bluedart.com/tracking/${trackingNumber}`,
      'dtdc': `https://www.dtdc.com/tracking/${trackingNumber}`,
      'delhivery': `https://www.delhivery.com/track/package/${trackingNumber}`,
      'indiapost': `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consignno=${trackingNumber}`,
      'fedex': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
      'ups': `https://www.ups.com/track?trackingNumber=${trackingNumber}`,
      'default': `https://www.google.com/search?q=track+${trackingNumber}`
    };

    return carriers[carrier?.toLowerCase() as keyof typeof carriers] || carriers.default;
  };

  const downloadInvoice = async (order: Order) => {
    try {
      // Generate invoice data
      const invoiceData = {
        orderId: order.id,
        orderDate: formatDate(order.created_at),
        items: orderItems.filter(item => item.product_type === 'physical'),
        totalAmount: order.total_amount,
        shippingAddress: order.shipping_address,
        status: order.status,
        paymentStatus: order.payment_status
      };

      // Create and download invoice
      const invoiceContent = generateInvoiceHTML(invoiceData);
      const blob = new Blob([invoiceContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const generateInvoiceHTML = (data: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${data.orderId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin-bottom: 20px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .items-table th { background-color: #f2f2f2; }
          .total { text-align: right; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>IoT Hub</h1>
          <h2>Invoice</h2>
        </div>
        <div class="invoice-details">
          <p><strong>Order ID:</strong> ${data.orderId}</p>
          <p><strong>Order Date:</strong> ${data.orderDate}</p>
          <p><strong>Status:</strong> ${data.status}</p>
          <p><strong>Payment Status:</strong> ${data.paymentStatus}</p>
        </div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map((item: any) => `
              <tr>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price}</td>
                <td>₹${item.price * item.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          <p>Total Amount: ₹${data.totalAmount}</p>
        </div>
      </body>
      </html>
    `;
  };

  const handleViewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    await fetchOrderItems(order.id);
  };

  const handleDownloadInvoice = (order: Order) => {
    // This would typically generate and download a PDF invoice
    toast.info('Invoice download feature coming soon');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h1>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Button onClick={() => window.location.href = '/'} className="bg-blue-600 hover:bg-blue-700">
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">
          Track and manage your orders
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    Order #{order.id.slice(-8)}
                  </CardTitle>
                  <CardDescription>
                    Placed on {formatDate(order.created_at)}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600 mb-2">
                    {formatPrice(order.total_amount)}
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <Badge className={getPaymentStatusColor(order.payment_status)}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Progress */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${order.status === 'pending' ? 'bg-gray-400' : 'bg-green-500'}`}></div>
                    <span className="text-sm">Order Placed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm">Processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${['shipped', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm">Shipped</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm">Delivered</span>
                  </div>
                </div>

                <Separator />

                {/* Order Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewOrderDetails(order)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {order.status === 'delivered' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(order)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </Button>
                  )}
                  {order.tracking_number && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTrackShipment(order)}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Track Package
                    </Button>
                  )}
                  {(order.status === 'shipped' || order.status === 'delivered') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadInvoice(order)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Order Details - #{selectedOrder.id.slice(-8)}</CardTitle>
                  <CardDescription>
                    Placed on {formatDate(selectedOrder.created_at)}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Status */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Order Status</h3>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold">Payment Status</h3>
                  <Badge className={getPaymentStatusColor(selectedOrder.payment_status)}>
                    {selectedOrder.payment_status.charAt(0).toUpperCase() + selectedOrder.payment_status.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × {formatPrice(item.price)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {item.product_type === 'digital_project' ? 'Digital' : 'Physical'}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Information */}
              {(selectedOrder.tracking_number || selectedOrder.carrier || selectedOrder.estimated_delivery) && (
                <div>
                  <h3 className="font-semibold mb-3">Tracking Information</h3>
                  <div className="p-3 border rounded-lg bg-blue-50">
                    {selectedOrder.tracking_number && (
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Tracking Number:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-white px-2 py-1 rounded border">
                            {selectedOrder.tracking_number}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTrackShipment(selectedOrder)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Track
                          </Button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.carrier && (
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">
                          <span className="font-medium">Carrier:</span> {selectedOrder.carrier}
                        </span>
                      </div>
                    )}
                    {selectedOrder.estimated_delivery && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">
                          <span className="font-medium">Estimated Delivery:</span> {formatDate(selectedOrder.estimated_delivery)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div>
                  <h3 className="font-semibold mb-3">Shipping Address</h3>
                  <div className="p-3 border rounded-lg bg-gray-50">
                    <p>{selectedOrder.shipping_address.address_line_1}</p>
                    {selectedOrder.shipping_address.address_line_2 && (
                      <p>{selectedOrder.shipping_address.address_line_2}</p>
                    )}
                    <p>
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.postal_code}
                    </p>
                    <p>{selectedOrder.shipping_address.country}</p>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Amount</span>
                  <span className="text-green-600">{formatPrice(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
