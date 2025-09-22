import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProductTabs } from './common/utils/ProductTabs';
import { ProductDetailPage } from './pages/products/ProductDetailPage';
import { CartPage } from './pages/ecommerce/CartPage';
import { CheckoutPage } from './pages/ecommerce/CheckoutPage';
import { MyOrders } from './pages/user/MyOrders';
import { Profile } from './pages/user/Profile';
import { Wishlist } from './pages/user/Wishlist';
import { ContactPage } from './pages/user/ContactPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProductManager } from './pages/admin/AdminProductManager';
import { IoTComponentsPage } from './pages/products/IoTComponentsPage';
import { ReadyMadeProjectsPage } from './pages/products/ReadyMadeProjectsPage';
import { AdminVerification } from './pages/admin/AdminVerification';
import { ConnectionTest } from './common/utils/ConnectionTest';
import { useAuth } from '../contexts/AuthContext';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ 
  children, 
  requiredRole 
}) => {
  const { state: authState } = useAuth();
  
  if (!authState.isAuthenticated) {
    // For wishlist, show a login prompt instead of redirecting
    if (window.location.pathname === '/wishlist') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
              <p className="text-gray-600 mb-6">
                You need to sign in to access your wishlist. Create an account or sign in to save your favorite items.
              </p>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Go to Home
              </button>
              <p className="text-sm text-gray-500">
                Sign in from the header to access your wishlist
              </p>
            </div>
          </div>
        </div>
      );
    }
    return <Navigate to="/" replace />;
  }
  
  if (requiredRole && authState.user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <main className="flex-1">
      <Routes>
        {/* Home Route */}
        <Route path="/" element={<ProductTabs />} />
        <Route path="/home" element={<ProductTabs />} />
        
        {/* Product Routes */}
        <Route path="/product/:productId" element={<ProductDetailPage />} />
        <Route path="/iot-components" element={<IoTComponentsPage />} />
        <Route path="/ready-made-projects" element={<ReadyMadeProjectsPage />} />
        
        {/* E-commerce Routes */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        
        {/* User Routes */}
        <Route path="/orders" element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        } />
        <Route path="/contact" element={<ContactPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/products" element={
          <ProtectedRoute requiredRole="admin">
            <AdminProductManager />
          </ProtectedRoute>
        } />
        <Route path="/admin/verify" element={<AdminVerification />} />
        
        {/* Utility Routes */}
        <Route path="/connection-test" element={<ConnectionTest />} />
        
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
};