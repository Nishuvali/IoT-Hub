import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/feedback/sonner';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { AppRouter } from './components/AppRouter';
import { Header } from './components/layouts/Header';
import { Footer } from './components/layouts/Footer';
import { ErrorBoundary } from './components/common/ui/ErrorBoundary';
import { MobileVerificationGuard } from './components/common/auth/MobileVerificationGuard';
import { CookieConsent } from './components/common/features/CookieConsent';
import { PWAInstallPrompt } from './components/common/features/PWAInstallPrompt';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <MobileVerificationGuard>
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <AppRouter />
                  <Footer />
                  <Toaster />
                  <CookieConsent />
                  <PWAInstallPrompt />
                </div>
              </MobileVerificationGuard>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}