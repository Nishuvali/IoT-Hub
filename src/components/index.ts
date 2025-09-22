// Common Components - Auth
export { AuthModal } from './common/auth/AuthModal';
export { EnhancedAuthModal } from './common/auth/EnhancedAuthModal';
export { EmailVerification } from './common/auth/EmailVerification';
export { MobileVerification } from './common/auth/MobileVerification';
export { MobileVerificationGuard } from './common/auth/MobileVerificationGuard';

// Common Components - UI
export { ProductCard } from './common/ui/ProductCard';
export { PageHeader } from './common/ui/PageHeader';
export { LoadingSpinner, LoadingOverlay } from './common/ui/LoadingSpinner';
export { AlertMessage, EmptyState } from './common/ui/AlertMessage';
export { StatsCard, InfoCard, SectionHeader } from './common/ui/StatsCard';
export { ErrorBoundary } from './common/ui/ErrorBoundary';

// Common Components - Features
export { ProductRecommendations } from './common/features/ProductRecommendations';
export { SmartSearch } from './common/features/SmartSearch';
export { SocialShare } from './common/features/SocialShare';
export { PWAInstallPrompt } from './common/features/PWAInstallPrompt';
export { CookieConsent } from './common/features/CookieConsent';

// Common Components - Communication
export { WhatsAppButton } from './common/communication/WhatsAppButton';
export { WhatsAppInquiry } from './common/communication/WhatsAppInquiry';
export { CustomerSupport } from './common/communication/CustomerSupport';
export { NotificationCenter } from './common/communication/NotificationCenter';

// Common Components - Utils
export { ConnectionTest } from './common/utils/ConnectionTest';
export { ProductTabs } from './common/utils/ProductTabs';

// Layout Components
export { PageLayout, DashboardLayout, AuthLayout, Container } from './layouts/PageLayout';
export { Header } from './layouts/Header';
export { Footer } from './layouts/Footer';

// Ecommerce Components
export { ProductGrid, ProductFilters } from './ecommerce/ProductGrid';
export { OrderSummary, OrderStatus } from './ecommerce/OrderSummary';
export { CheckoutForm } from './ecommerce/CheckoutForm';
export { Cart } from './ecommerce/Cart';
export { CheckoutModal } from './ecommerce/CheckoutModal';
export { OrderTracking } from './ecommerce/OrderTracking';
export { UPIPaymentModal } from './ecommerce/UPIPaymentModal';
export type { CheckoutFormData } from './ecommerce/CheckoutForm';

// Page Components - Admin
export { AdminDashboard } from './pages/admin/AdminDashboard';
export { AdminProductManager } from './pages/admin/AdminProductManager';
export { AdminVerification } from './pages/admin/AdminVerification';
export { AdvancedAnalytics } from './pages/admin/AdvancedAnalytics';
export { InventoryManagement } from './pages/admin/InventoryManagement';

// Page Components - User
export { Profile } from './pages/user/Profile';
export { MyOrders } from './pages/user/MyOrders';
export { Wishlist } from './pages/user/Wishlist';
export { ContactPage } from './pages/user/ContactPage';

// Page Components - Products
export { IoTComponentsPage } from './pages/products/IoTComponentsPage';
export { ReadyMadeProjectsPage } from './pages/products/ReadyMadeProjectsPage';
export { ProductDetailPage } from './pages/products/ProductDetailPage';

// Page Components - Ecommerce
export { CartPage } from './pages/ecommerce/CartPage';
export { CheckoutPage } from './pages/ecommerce/CheckoutPage';

// Core Components
export { AppRouter } from './AppRouter';
