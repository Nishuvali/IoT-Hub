import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/layout/card';
import { Button } from '../../ui/forms/button';
import { Badge } from '../../ui/feedback/badge';
import { useCart } from '../../../contexts/CartContext';
import { useWishlist } from '../../../contexts/WishlistContext';
import { supabase } from '../../../database/supabase/client';
import { toast } from 'sonner';
import { Product } from '../../../contexts/CartContext';

interface ProductRecommendationsProps {
  currentProductId?: string;
  userId?: string;
  category?: string;
  limit?: number;
  title?: string;
  showTitle?: boolean;
}

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

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  currentProductId,
  userId,
  category,
  limit = 4,
  title = "You Might Also Like",
  showTitle = true
}) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendationType, setRecommendationType] = useState<string>('');
  
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const handleViewDetails = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    fetchRecommendations();
  }, [currentProductId, userId, category]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      let recommendedProducts: Product[] = [];

      // Strategy 1: Collaborative Filtering (Users who bought this also bought)
      if (currentProductId) {
        const collaborativeRecs = await getCollaborativeRecommendations(currentProductId);
        if (collaborativeRecs.length > 0) {
          recommendedProducts = [...recommendedProducts, ...collaborativeRecs];
          setRecommendationType('Customers who bought this also bought');
        }
      }

      // Strategy 2: Category-based recommendations
      if (category && recommendedProducts.length < limit) {
        const categoryRecs = await getCategoryRecommendations(category, currentProductId);
        recommendedProducts = [...recommendedProducts, ...categoryRecs];
        if (!recommendationType) setRecommendationType('Similar Products');
      }

      // Strategy 3: User-based recommendations (if user is logged in)
      if (userId && recommendedProducts.length < limit) {
        const userRecs = await getUserRecommendations(userId, currentProductId);
        recommendedProducts = [...recommendedProducts, ...userRecs];
        if (!recommendationType) setRecommendationType('Recommended for You');
      }

      // Strategy 4: Trending/Popular products
      if (recommendedProducts.length < limit) {
        const trendingRecs = await getTrendingRecommendations(currentProductId);
        recommendedProducts = [...recommendedProducts, ...trendingRecs];
        if (!recommendationType) setRecommendationType('Trending Now');
      }

      // Remove duplicates and limit results
      const uniqueProducts = recommendedProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      ).slice(0, limit);

      setRecommendations(uniqueProducts);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCollaborativeRecommendations = async (productId: string): Promise<Product[]> => {
    try {
      // Simplified collaborative filtering - get products from same category
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .neq('id', productId)
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(transformSupabaseProduct);
    } catch (error) {
      console.error('Collaborative filtering error:', error);
      return [];
    }
  };

  const getCategoryRecommendations = async (productCategory: string, excludeId?: string): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', productCategory)
        .neq('id', excludeId || '')
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(transformSupabaseProduct);
    } catch (error) {
      console.error('Category recommendations error:', error);
      return [];
    }
  };

  const getUserRecommendations = async (userId: string, excludeId?: string): Promise<Product[]> => {
    try {
      // Simplified user recommendations - get trending products
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .neq('id', excludeId || '')
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(transformSupabaseProduct);
    } catch (error) {
      console.error('User recommendations error:', error);
      return [];
    }
  };

  const getTrendingRecommendations = async (excludeId?: string): Promise<Product[]> => {
    try {
      // Get products with high ratings and recent orders
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          order_items(count)
        `)
        .neq('id', excludeId || '')
        .gte('rating', 4.0)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(transformSupabaseProduct);
    } catch (error) {
      console.error('Trending recommendations error:', error);
      return [];
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  const handleProductClick = (productId: string) => {
    handleViewDetails(productId);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="p-0">
                <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{title}</h3>
            {recommendationType && (
              <Badge variant="secondary" className="text-xs">
                {recommendationType}
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="p-0" onClick={() => handleProductClick(product.id)}>
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <Badge className="absolute top-2 right-2 bg-primary">
                  {product.category}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWishlistToggle(product);
                  }}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <h4 
                className="font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-primary"
                onClick={() => handleProductClick(product.id)}
              >
                {product.name}
              </h4>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-primary">₹{product.price}</span>
                {product.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{product.rating}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${product.stock && product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock && product.stock > 0 ? `In Stock` : 'Out of Stock'}
                </span>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  disabled={!product.stock || product.stock === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
