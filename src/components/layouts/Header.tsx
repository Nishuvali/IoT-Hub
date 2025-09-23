import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, LogOut, Heart } from 'lucide-react';
import { Button } from '../ui/forms/button';
import { Input } from '../ui/forms/input';
import { Badge } from '../ui/feedback/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/interactive/dropdown-menu';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { Cart } from '../ecommerce/Cart';
import { EnhancedAuthModal } from '../common/auth/EnhancedAuthModal';
import { SmartSearch } from '../common/features/SmartSearch';

export const Header: React.FC = () => {
  const { state } = useCart();
  const { state: authState, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { getWishlistCount } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = getWishlistCount();

  // Debug logging
  console.log('Header - Auth State:', authState);
  console.log('Header - User Role:', authState.user?.role);
  console.log('Header - Is Authenticated:', authState.isAuthenticated);

  const handleLogout = async () => {
    try {
      console.log('Logging out user...');
      await logout();
      setIsCartOpen(false);
      navigate('/'); // Navigate to home after logout
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
    navigate('/profile');
  };

  const handleOrdersClick = () => {
    console.log('My Orders clicked');
    navigate('/orders');
  };

  const handleWishlistClick = () => {
    console.log('Wishlist clicked');
    navigate('/wishlist');
  };

  const handleCartClick = () => {
    if (location.pathname === '/cart') {
      // If already on cart page, show cart sidebar instead
      setIsCartOpen(true);
    } else {
      // Navigate to full cart page
      navigate('/cart');
    }
  };

  const handleContactClick = () => {
    console.log('Contact clicked');
    navigate('/contact');
  };

  const handleAdminClick = () => {
    console.log('Admin clicked');
    navigate('/admin');
  };

  const handleAdminVerifyClick = () => {
    console.log('Admin Verify clicked');
    navigate('/admin/verify');
  };

  const handleConnectionTestClick = () => {
    console.log('Connection Test clicked');
    navigate('/connection-test');
  };

  const handleIoTComponentsClick = () => {
    console.log('IoT Components clicked');
    navigate('/iot-components');
  };

  const handleReadyMadeProjectsClick = () => {
    console.log('Ready-Made Projects clicked');
    navigate('/ready-made-projects');
  };

  const handleHomeClick = () => {
    console.log('Home clicked');
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={handleHomeClick}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <h1 className="text-xl font-semibold text-black">IoT Hub</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`hover:text-white hover:bg-gray-800 transition-all duration-200 px-3 py-2 rounded-lg ${location.pathname === '/' ? 'text-white font-bold bg-black border border-gray-800 shadow-sm' : 'text-gray-600'}`}
            >
              Home
            </Link>
            <Link 
              to="/iot-components" 
              className={`hover:text-white hover:bg-gray-800 transition-all duration-200 px-3 py-2 rounded-lg ${location.pathname === '/iot-components' ? 'text-white font-bold bg-black border border-gray-800 shadow-sm' : 'text-gray-600'}`}
            >
              IoT Components
            </Link>
            <Link 
              to="/ready-made-projects" 
              className={`hover:text-white hover:bg-gray-800 transition-all duration-200 px-3 py-2 rounded-lg ${location.pathname === '/ready-made-projects' ? 'text-white font-bold bg-black border border-gray-800 shadow-sm' : 'text-gray-600'}`}
            >
              Ready-Made Projects
            </Link>
            <Link 
              to="/contact" 
              className={`hover:text-white hover:bg-gray-800 transition-all duration-200 px-3 py-2 rounded-lg ${location.pathname === '/contact' ? 'text-white font-bold bg-black border border-gray-800 shadow-sm' : 'text-gray-600'}`}
            >
              Contact
            </Link>
            <Link 
              to="/connection-test" 
              className={`hover:text-white hover:bg-gray-800 transition-all duration-200 px-3 py-2 rounded-lg ${location.pathname === '/connection-test' ? 'text-white font-bold bg-black border border-gray-800 shadow-sm' : 'text-gray-600'}`}
            >
              Test Connections
            </Link>
          </nav>

          {/* Right Side - Search, Auth, Cart */}
          <div className="flex items-center space-x-3">
            {/* Smart Search Bar - Hidden on mobile */}
            <div className="hidden lg:flex items-center">
              <SmartSearch 
                placeholder="Search components & projects..."
                className="w-64"
              />
            </div>

            {/* Auth / User Menu */}
            {authState.isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    type="button"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <User className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem disabled className="font-medium">
                    {authState.user?.firstName} {authState.user?.lastName}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOrdersClick} className="cursor-pointer">
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleWishlistClick} className="cursor-pointer">
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAdminVerifyClick} className="cursor-pointer">
                    Debug Admin Status
                  </DropdownMenuItem>
                  {authState.user?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleAdminClick} className="cursor-pointer">
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setIsAuthModalOpen(true)}
                className="h-9"
              >
                Sign In
              </Button>
            )}

            {/* Wishlist Button */}
            <Button
              variant="outline"
              size="icon"
              className="relative h-9 w-9"
              onClick={handleWishlistClick}
            >
              <Heart className="h-4 w-4" />
              {wishlistCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                >
                  {wishlistCount}
                </Badge>
              )}
            </Button>

            {/* Cart Button */}
            <Button
              variant="outline"
              size="icon"
              className="relative h-9 w-9"
              onClick={handleCartClick}
            >
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  </Button>
                </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background shadow-lg">
            <nav className="container mx-auto py-4 px-6">
              <div className="flex flex-col space-y-4">
                {/* Mobile Smart Search */}
                <SmartSearch 
                  placeholder="Search components & projects..."
                  className="w-full"
                />
                
                {/* Navigation Links */}
                <div className="flex flex-col space-y-2">
                  <Link 
                    to="/" 
                    className={`py-2 hover:text-white hover:bg-gray-800 transition-all duration-200 px-3 py-2 rounded-lg ${location.pathname === '/' ? 'text-white font-bold bg-black border border-gray-800 shadow-sm' : 'text-gray-600'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/iot-components" 
                    className={`py-2 hover:text-white hover:bg-gray-800 transition-all duration-200 px-3 py-2 rounded-lg ${location.pathname === '/iot-components' ? 'text-white font-bold bg-black border border-gray-800 shadow-sm' : 'text-gray-600'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    IoT Components
                  </Link>
                  <Link 
                    to="/ready-made-projects" 
                    className={`py-2 hover:text-white hover:bg-gray-800 transition-all duration-200 px-3 py-2 rounded-lg ${location.pathname === '/ready-made-projects' ? 'text-white font-bold bg-black border border-gray-800 shadow-sm' : 'text-gray-600'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Ready-Made Projects
                  </Link>
                  <Link 
                    to="/contact" 
                    className={`py-2 hover:text-white hover:bg-gray-800 transition-all duration-200 px-3 py-2 rounded-lg ${location.pathname === '/contact' ? 'text-white font-bold bg-black border border-gray-800 shadow-sm' : 'text-gray-600'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  <Link 
                    to="/connection-test" 
                    className={`py-2 hover:text-white hover:bg-gray-800 transition-all duration-200 px-3 py-2 rounded-lg ${location.pathname === '/connection-test' ? 'text-white font-bold bg-black border border-gray-800 shadow-sm' : 'text-gray-600'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Test Connections
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Cart Sidebar */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      {/* Enhanced Auth Modal */}
      <EnhancedAuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};