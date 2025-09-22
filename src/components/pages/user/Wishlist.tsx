import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../../contexts/WishlistContext';
import { useCart } from '../../../contexts/CartContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/layout/card';
import { Button } from '../../ui/forms/button';
import { Badge } from '../../ui/feedback/badge';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';

export const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleViewDetails = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = async (item: any) => {
    setIsLoading(item.id);
    try {
      await addToCart(item);
      toast.success('Added to cart successfully');
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(null);
    }
  };

  const handleRemoveFromWishlist = (itemId: string) => {
    removeFromWishlist(itemId);
  };

  const handleClearWishlist = () => {
    clearWishlist();
  };

  const handleViewProduct = (item: any) => {
    handleViewDetails(item.id);
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
      month: 'short',
      day: 'numeric',
    });
  };

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h1>
          <p className="text-gray-600 mb-6">
            Save items you love by clicking the heart icon on any product.
          </p>
          <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
            <p className="text-gray-600">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          {wishlist.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearWishlist}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <Card key={item.id} className="group hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="p-0">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white/90 text-red-500 hover:text-red-600"
                  onClick={() => handleRemoveFromWishlist(item.id)}
                >
                  <Heart className="h-4 w-4 fill-current" />
                </Button>
                <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                  {item.product_type === 'digital_project' ? 'Digital' : 'Physical'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">
                {item.name}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mb-3 line-clamp-2">
                {item.description}
              </CardDescription>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(item.price)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
                
                <div className="text-xs text-gray-500">
                  Added on {formatDate(item.addedAt)}
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleViewProduct(item)}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleAddToCart(item)}
                    disabled={isLoading === item.id}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isLoading === item.id ? 'Adding...' : 'Add to Cart'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      {wishlist.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => {
                wishlist.forEach(item => handleAddToCart(item));
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add All to Cart
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
