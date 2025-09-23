import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../ui/layout/card';
import { Button } from '../../ui/forms/button';
import { Badge } from '../../ui/feedback/badge';
import { Star, ShoppingCart, Heart, Share2, MessageCircle } from 'lucide-react';
import { Product } from '../../../contexts/CartContext';
import { SocialShare } from '../features/SocialShare';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode = 'grid',
  onAddToCart,
  onAddToWishlist,
  onViewDetails,
  className = ''
}) => {
  const handleAddToCart = () => {
    onAddToCart?.(product);
  };

  const handleAddToWishlist = () => {
    onAddToWishlist?.(product);
  };

  const handleViewDetails = () => {
    onViewDetails?.(product);
  };

  const handleWhatsAppInquiry = () => {
    const message = `Hi! I'm interested in the ${product.name} project. 

Project Details:
- Name: ${product.name}
- Price: ₹${product.price.toFixed(2)}
- Category: ${product.category}
- Description: ${product.description}

I would like to discuss customization options and requirements. Please let me know the next steps.

Thank you!`;

    const whatsappNumber = (import.meta as any).env?.VITE_WHATSAPP_PHONE_NUMBER || '919876543210';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (viewMode === 'list') {
    return (
      <Card className={`flex flex-row ${className}`}>
        <div className="w-48 h-48 p-4">
          <img
            src={product.image || '/placeholder-product.svg'}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="flex-1 p-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <Badge variant="secondary">{product.category}</Badge>
            </div>
            <div className="flex items-center gap-2">
              {renderStars(product.rating || 0)}
              <span className="text-sm text-muted-foreground">
                ({product.rating || 0})
              </span>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center justify-between mt-4">
              <div className="text-2xl font-bold">₹{product.price.toFixed(2)}</div>
              <div className="flex gap-2">
                {product.product_type === 'digital_project' ? (
                  <Button size="sm" onClick={handleWhatsAppInquiry} className="bg-green-600 hover:bg-green-700 text-xs">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    WhatsApp
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleAddToCart}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={handleAddToWishlist}>
                  <Heart className="h-4 w-4" />
                </Button>
                <SocialShare product={product} />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

        return (
          <Card className={`hover:shadow-lg hover:shadow-primary transition-all duration-300 hover:-translate-y-1 ${className}`}>
      <CardHeader className="pb-2">
        <div className="relative cursor-pointer" onClick={handleViewDetails}>
          <img
            src={product.image || '/placeholder-product.svg'}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
          />
                <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground" variant="secondary">
                  {product.category}
                </Badge>
        </div>
        <CardTitle className="text-lg line-clamp-2 cursor-pointer hover:text-primary transition-colors" onClick={handleViewDetails}>
          {product.name}
        </CardTitle>
        <div className="flex items-center gap-2">
          {renderStars(product.rating || 0)}
          <span className="text-sm text-muted-foreground">
            ({product.rating || 0})
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <div className="text-2xl font-bold mt-2 text-primary">₹{product.price.toFixed(2)}</div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {product.product_type === 'digital_project' ? (
          <Button onClick={handleWhatsAppInquiry} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground text-sm transition-all duration-200">
            <MessageCircle className="h-3 w-3 mr-1" />
            WhatsApp
          </Button>
        ) : (
          <Button onClick={handleAddToCart} className="w-full bg-black hover:bg-gray-800 text-white transition-all duration-200">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAddToWishlist} className="flex-1">
            <Heart className="h-4 w-4 mr-2" />
            Wishlist
          </Button>
          <SocialShare product={product} className="flex-1" />
        </div>
      </CardFooter>
    </Card>
  );
};
