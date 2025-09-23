import React from 'react';
import { Button } from '../../ui/forms/button';
import { ArrowLeft, Menu, Search, ShoppingCart, User, Heart } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import { useWishlist } from '../../../contexts/WishlistContext';
import { Breadcrumb } from '../navigation/Breadcrumb';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  showNavigation?: boolean;
  showBreadcrumb?: boolean;
  breadcrumbItems?: Array<{ label: string; href?: string; current?: boolean }>;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showBackButton = false,
  onBack,
  actions,
  showNavigation = false,
  showBreadcrumb = true,
  breadcrumbItems,
  className = ''
}) => {
  const { state } = useAuth();
  const { state: cartState } = useCart();
  const { wishlist, getWishlistCount } = useWishlist();

  const cartItemCount = (cartState.items || []).reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = getWishlistCount();

  return (
    <div className={`bg-white border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showBreadcrumb && (
          <div className="py-3 border-b border-gray-100">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        )}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {showBackButton && (
              <Button variant="ghost" onClick={onBack} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
          
          {showNavigation && (
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <Heart className="h-4 w-4" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
