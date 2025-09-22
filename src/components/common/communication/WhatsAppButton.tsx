import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Product } from './CartContext';

interface WhatsAppButtonProps {
  product: Product;
  className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ 
  product, 
  className = "" 
}) => {
  const generateWhatsAppMessage = () => {
    const message = `Hi! I'm interested in:

📱 Project: ${product.name}
🏫 Domain: ${product.domain || 'Not specified'}
💻 Tech Stack: ${product.technology_stack || 'To be discussed'}
🎯 Complexity: ${product.project_complexity || 'To be discussed'}
💰 Base Price: ₹${product.price.toFixed(2)}
📝 Custom Requirements: [Please specify your requirements]

Please share detailed pricing and timeline information.`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = "+919876543210"; // Replace with your actual WhatsApp business number
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${message}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      className={`w-full bg-green-600 hover:bg-green-700 text-white ${className}`}
      onClick={handleWhatsAppClick}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Get Quote on WhatsApp
    </Button>
  );
};