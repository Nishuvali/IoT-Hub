import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, MessageSquare } from 'lucide-react';
import { Button } from '../../ui/forms/button';
import { Input } from '../../ui/forms/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/forms/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/layout/card';
import { toast } from 'sonner';

interface ContactPageProps {
  // Removed onBack prop since we're using React Router
}

export const ContactPage: React.FC<ContactPageProps> = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // In a real application, you would send this to your backend
      console.log('Contact form submission:', formData);
      toast.success('Thank you for your message! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleWhatsAppContact = () => {
    const phoneNumber = '+919876543210'; // Replace with your WhatsApp number
    const message = encodeURIComponent('Hi! I need help with IoT components and projects.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
                ← Back
              </Button>
              <h1 className="text-xl font-semibold">Contact Us</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
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
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What's this about?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      placeholder="Tell us how we can help you..."
                      rows={6}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Get in Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">support@iothub.com</p>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">+91 98765 43210</p>
                    <p className="text-sm text-gray-500">Mon-Fri 9AM-6PM IST</p>
                  </div>
                </div>

                {/* WhatsApp Contact Button */}
                <div className="pt-2">
                  <Button 
                    onClick={handleWhatsAppContact}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat on WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">How long does shipping take?</h4>
                  <p className="text-sm text-gray-600">
                    Standard shipping takes 3-5 business days. Express shipping is available for 1-2 days.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Do you offer technical support?</h4>
                  <p className="text-sm text-gray-600">
                    Yes! We provide technical support for all our IoT components and projects.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Can I return products?</h4>
                  <p className="text-sm text-gray-600">
                    We offer a 30-day return policy for unused products in original packaging.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Do you have bulk pricing?</h4>
                  <p className="text-sm text-gray-600">
                    Yes, we offer special pricing for bulk orders. Contact us for a quote.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
