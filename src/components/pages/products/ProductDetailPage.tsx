import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Plus, Minus, Heart, Share2, MessageCircle } from 'lucide-react';
import { Button } from '../../ui/forms/button';
import { Input } from '../../ui/forms/input';
import { Badge } from '../../ui/feedback/badge';
import { Card, CardContent } from '../../ui/layout/card';
import { Separator } from '../../ui/layout/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/navigation/tabs';
import { PageLayout } from '../../layouts/PageLayout';
import { PageHeader } from '../../common/ui/PageHeader';
import { ProductCard } from '../../common/ui/ProductCard';
import { ProductRecommendations } from '../../common/features/ProductRecommendations';
import { SocialShare } from '../../common/features/SocialShare';
import { WhatsAppInquiry } from '../../common/communication/WhatsAppInquiry';
import { Product, useCart } from '../../../contexts/CartContext';
import { useWishlist } from '../../../contexts/WishlistContext';
import { supabase } from '../../../database/supabase/client';
import { toast } from 'sonner';

interface ProductDetailPageProps {
  // Removed onBack prop since we're using React Router
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [showWhatsAppInquiry, setShowWhatsAppInquiry] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const transformSupabaseProduct = (item: any): Product => ({
    id: item.id,
    name: item.name,
    price: item.price,
    image: item.image_url || '/placeholder-product.svg',
    description: item.description || 'High-quality IoT component for your projects.',
    category: item.subcategory || item.category,
    product_type: item.product_type || 'physical',
    stock: item.stock_quantity || 0,
    active: item.stock_quantity > 0,
    rating: item.rating || 0,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) throw error;
        
        setProduct(transformSupabaseProduct(data));
        
        // Fetch related products
        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .neq('id', productId)
          .limit(4);
        
        setRelatedProducts(relatedData?.map(transformSupabaseProduct) || []);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  const handleWhatsAppInquiry = () => {
    if (!product) return;
    
    const message = `Hi! I'm interested in the ${product.name} project. 

Project Details:
- Name: ${product.name}
- Price: ₹${product.price.toFixed(2)}
- Category: ${product.category}
- Description: ${product.description}

I would like to discuss customization options and requirements. Please let me know the next steps.

Thank you!`;

    const whatsappNumber = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER || '919876543210';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <PageLayout showHeader={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg">Loading product details...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!product) {
    return (
      <PageLayout showHeader={false}>
        <PageHeader title="Product Not Found" showBackButton onBack={() => navigate(-1)} />
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
        </div>
      </PageLayout>
    );
  }

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

  return (
    <PageLayout showHeader={false}>
      <PageHeader
        title="Product Details"
        showBackButton
        onBack={() => navigate(-1)}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowWhatsAppInquiry(true)}>
              <Share2 className="h-4 w-4 mr-2" />
              Contact
            </Button>
            <SocialShare product={product} />
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg border">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">{product.category}</Badge>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                {renderStars(4.5)}
                <span className="text-sm text-muted-foreground">(4.5) • 24 reviews</span>
              </div>
            </div>

            <div className="text-3xl font-bold">₹{product.price.toFixed(2)}</div>

            <p className="text-muted-foreground">{product.description}</p>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                {product.product_type === 'digital_project' ? (
                  <Button onClick={handleWhatsAppInquiry} className="flex-1 bg-green-600 hover:bg-green-700 text-sm">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    WhatsApp
                  </Button>
                ) : (
                  <Button onClick={handleAddToCart} className="flex-1">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleWishlistToggle}
                  className={isInWishlist(product.id) ? 'bg-red-50 text-red-600' : ''}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Product Details */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <p>{product.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="specifications" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Category:</span>
                        <span>{product.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Stock:</span>
                        <span>{product.stock} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <span className={product.active ? 'text-green-600' : 'text-red-600'}>
                          {product.active ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Product Recommendations */}
        <div className="mt-12">
          <ProductRecommendations
            currentProductId={product.id}
            category={product.category}
            title="Related Products"
          />
        </div>
      </div>

      {/* WhatsApp Inquiry Modal */}
      {showWhatsAppInquiry && (
        <WhatsAppInquiry
          product={product}
          onClose={() => setShowWhatsAppInquiry(false)}
        />
      )}
    </PageLayout>
  );
};