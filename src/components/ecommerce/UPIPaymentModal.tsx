import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/overlay/dialog';
import { Button } from '../ui/forms/button';
import { Input } from '../ui/forms/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/layout/card';
import { Badge } from '../ui/feedback/badge';
import { Separator } from '../ui/layout/separator';
import { Alert, AlertDescription } from '../ui/feedback/alert';
import { Copy, CheckCircle, Clock, Smartphone, CreditCard } from 'lucide-react';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    totalAmount: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  };
  onPaymentSuccess: (transactionId: string) => void;
}

export const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({
  isOpen,
  onClose,
  orderData,
  onPaymentSuccess
}) => {
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'manual'>('qr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // UPI Payment Details (Replace with your actual UPI details)
  const upiDetails = {
    upiId: 'iotsolutions@paytm', // Replace with your UPI ID
    merchantName: 'IoT Solutions Hub',
    merchantCode: 'IOT123456'
  };

  // Generate UPI payment string
  const upiPaymentString = `upi://pay?pa=${upiDetails.upiId}&pn=${upiDetails.merchantName}&am=${orderData.totalAmount}&cu=INR&tn=Order ${orderData.orderId}&tr=${orderData.orderId}`;

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(upiDetails.upiId);
      setCopied(true);
      toast.success('UPI ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy UPI ID');
    }
  };

  const handlePaymentVerification = async () => {
    if (!transactionId.trim()) {
      toast.error('Please enter Transaction ID');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate payment verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically verify with your payment gateway
      // For now, we'll just simulate success
      toast.success('Payment verified successfully!');
      onPaymentSuccess(transactionId);
      onClose();
      
      // Reset form
      setTransactionId('');
      setPaymentMethod('qr');
    } catch (error) {
      toast.error('Payment verification failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            UPI Payment
          </DialogTitle>
          <DialogDescription>
            Complete your payment using UPI. Order ID: {orderData.orderId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p>{formatAmount(item.price * item.quantity)}</p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Amount</span>
                <span>{formatAmount(orderData.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Choose Payment Method</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={paymentMethod === 'qr' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('qr')}
                className="h-20 flex flex-col gap-2"
              >
                <Smartphone className="w-6 h-6" />
                <span>Scan QR Code</span>
              </Button>
              <Button
                variant={paymentMethod === 'manual' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('manual')}
                className="h-20 flex flex-col gap-2"
              >
                <CreditCard className="w-6 h-6" />
                <span>Manual UPI</span>
              </Button>
            </div>
          </div>

          {/* QR Code Payment */}
          {paymentMethod === 'qr' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Scan QR Code to Pay
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center p-4 bg-white rounded-lg border">
                  <QRCode
                    value={upiPaymentString}
                    size={200}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                </div>
                
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Instructions:</strong>
                    <ol className="mt-2 space-y-1 text-sm">
                      <li>1. Open your UPI app (PhonePe, Google Pay, Paytm, etc.)</li>
                      <li>2. Scan the QR code above</li>
                      <li>3. Verify the amount: <strong>{formatAmount(orderData.totalAmount)}</strong></li>
                      <li>4. Complete the payment</li>
                      <li>5. Enter the Transaction ID below</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID *</Label>
                  <Input
                    id="transactionId"
                    placeholder="Enter Transaction ID from your UPI app"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Transaction ID is usually 12-16 characters long
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manual UPI Payment */}
          {paymentMethod === 'manual' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Manual UPI Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label>UPI ID</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={upiDetails.upiId}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyUPI}
                        className="flex items-center gap-2"
                      >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Amount</Label>
                    <Input
                      value={formatAmount(orderData.totalAmount)}
                      readOnly
                      className="font-semibold"
                    />
                  </div>

                  <div>
                    <Label>Order Reference</Label>
                    <Input
                      value={`Order ${orderData.orderId}`}
                      readOnly
                      className="font-mono"
                    />
                  </div>
                </div>

                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Instructions:</strong>
                    <ol className="mt-2 space-y-1 text-sm">
                      <li>1. Open your UPI app</li>
                      <li>2. Click "Send Money" or "Pay"</li>
                      <li>3. Enter UPI ID: <strong>{upiDetails.upiId}</strong></li>
                      <li>4. Enter amount: <strong>{formatAmount(orderData.totalAmount)}</strong></li>
                      <li>5. Add note: <strong>Order {orderData.orderId}</strong></li>
                      <li>6. Complete the payment</li>
                      <li>7. Enter Transaction ID below</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="transactionIdManual">Transaction ID *</Label>
                  <Input
                    id="transactionIdManual"
                    placeholder="Enter Transaction ID from your UPI app"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Verification */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePaymentVerification}
              disabled={!transactionId.trim() || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Payment'
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notice:</strong> Never share your UPI PIN with anyone. 
              Our team will never ask for your UPI PIN or OTP.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
};
