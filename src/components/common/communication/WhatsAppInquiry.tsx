import React, { useState } from 'react';
import { Button } from '../../ui/forms/button';
import { Input } from '../../ui/forms/input';
import { Textarea } from '../../ui/forms/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/layout/card';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/feedback/badge';
import { MessageCircle, Phone, User } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppInquiryProps {
  product: {
    id: string;
    name: string;
    price: number;
    category: string;
    type?: string;
    whatsapp_required?: boolean;
  };
  onClose: () => void;
}

export const WhatsAppInquiry: React.FC<WhatsAppInquiryProps> = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customizations: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerPhone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!/^\+?[\d\s-()]+$/.test(formData.customerPhone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await whatsappApi.submitInquiry({
        productId: product.id,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customizations: formData.customizations
      });

      toast.success('Inquiry submitted successfully! You will be contacted via WhatsApp within 24 hours.');
      onClose();
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            WhatsApp Inquiry
          </CardTitle>
          <p className="text-sm text-gray-600">
            Submit your inquiry for <span className="font-semibold">{product.name}</span>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name *
              </Label>
              <Input
                id="customerName"
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                WhatsApp Number *
              </Label>
              <Input
                id="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="+91 98765 43210"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customizations">
                Project Customizations & Requirements
              </Label>
              <Textarea
                id="customizations"
                value={formData.customizations}
                onChange={(e) => setFormData(prev => ({ ...prev, customizations: e.target.value }))}
                placeholder="Describe any specific requirements, customizations, or modifications you need for this project..."
                rows={4}
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Base Price:</strong> ₹{product.price.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Final price may vary based on customizations
              </p>
            </div>

            <div className="flex items-center gap-2 text-green-600">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <MessageCircle className="w-3 h-3 mr-1" />
                WhatsApp Consultation
              </Badge>
              <span className="text-xs">Free project discussion</span>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};