# 🔧 **Import Update Script**

## **UI Component Import Updates**

### **Forms Components**
- `../ui/button` → `../ui/forms/button`
- `../ui/input` → `../ui/forms/input`
- `../ui/textarea` → `../ui/forms/textarea`
- `../ui/select` → `../ui/forms/select`
- `../ui/checkbox` → `../ui/forms/checkbox`
- `../ui/radio-group` → `../ui/forms/radio-group`
- `../ui/switch` → `../ui/forms/switch`
- `../ui/slider` → `../ui/forms/slider`
- `../ui/input-otp` → `../ui/forms/input-otp`
- `../ui/form` → `../ui/forms/form`

### **Layout Components**
- `../ui/card` → `../ui/layout/card`
- `../ui/separator` → `../ui/layout/separator`
- `../ui/aspect-ratio` → `../ui/layout/aspect-ratio`
- `../ui/resizable` → `../ui/layout/resizable`

### **Feedback Components**
- `../ui/alert` → `../ui/feedback/alert`
- `../ui/badge` → `../ui/feedback/badge`
- `../ui/progress` → `../ui/feedback/progress`
- `../ui/skeleton` → `../ui/feedback/skeleton`
- `../ui/sonner` → `../ui/feedback/sonner`

### **Navigation Components**
- `../ui/tabs` → `../ui/navigation/tabs`
- `../ui/breadcrumb` → `../ui/navigation/breadcrumb`
- `../ui/navigation-menu` → `../ui/navigation/navigation-menu`
- `../ui/pagination` → `../ui/navigation/pagination`
- `../ui/sidebar` → `../ui/navigation/sidebar`

### **Overlay Components**
- `../ui/dialog` → `../ui/overlay/dialog`
- `../ui/sheet` → `../ui/overlay/sheet`
- `../ui/popover` → `../ui/overlay/popover`
- `../ui/tooltip` → `../ui/overlay/tooltip`
- `../ui/hover-card` → `../ui/overlay/hover-card`
- `../ui/alert-dialog` → `../ui/overlay/alert-dialog`

### **Data Display Components**
- `../ui/table` → `../ui/data-display/table`
- `../ui/avatar` → `../ui/data-display/avatar`
- `../ui/chart` → `../ui/data-display/chart`
- `../ui/calendar` → `../ui/data-display/calendar`

### **Interactive Components**
- `../ui/dropdown-menu` → `../ui/interactive/dropdown-menu`
- `../ui/context-menu` → `../ui/interactive/context-menu`
- `../ui/command` → `../ui/interactive/command`
- `../ui/toggle` → `../ui/interactive/toggle`
- `../ui/toggle-group` → `../ui/interactive/toggle-group`
- `../ui/menubar` → `../ui/interactive/menubar`

### **Utility Components**
- `../ui/scroll-area` → `../ui/utility/scroll-area`
- `../ui/collapsible` → `../ui/utility/collapsible`
- `../ui/accordion` → `../ui/utility/accordion`
- `../ui/drawer` → `../ui/utility/drawer`
- `../ui/carousel` → `../ui/utility/carousel`
- `../ui/use-mobile` → `../ui/utility/use-mobile`

### **Primitives**
- `../ui/utils` → `../ui/primitives/utils`

## **Common Component Import Updates**

### **Auth Components**
- `../common/AuthModal` → `../common/auth/AuthModal`
- `../common/EnhancedAuthModal` → `../common/auth/EnhancedAuthModal`
- `../common/EmailVerification` → `../common/auth/EmailVerification`
- `../common/MobileVerification` → `../common/auth/MobileVerification`
- `../common/MobileVerificationGuard` → `../common/auth/MobileVerificationGuard`

### **UI Components**
- `../common/ProductCard` → `../common/ui/ProductCard`
- `../common/PageHeader` → `../common/ui/PageHeader`
- `../common/LoadingSpinner` → `../common/ui/LoadingSpinner`
- `../common/AlertMessage` → `../common/ui/AlertMessage`
- `../common/StatsCard` → `../common/ui/StatsCard`
- `../common/ErrorBoundary` → `../common/ui/ErrorBoundary`

### **Feature Components**
- `../common/SmartSearch` → `../common/features/SmartSearch`
- `../common/ProductRecommendations` → `../common/features/ProductRecommendations`
- `../common/SocialShare` → `../common/features/SocialShare`
- `../common/PWAInstallPrompt` → `../common/features/PWAInstallPrompt`
- `../common/CookieConsent` → `../common/features/CookieConsent`

### **Communication Components**
- `../common/WhatsAppButton` → `../common/communication/WhatsAppButton`
- `../common/WhatsAppInquiry` → `../common/communication/WhatsAppInquiry`
- `../common/CustomerSupport` → `../common/communication/CustomerSupport`
- `../common/NotificationCenter` → `../common/communication/NotificationCenter`

### **Utility Components**
- `../common/ConnectionTest` → `../common/utils/ConnectionTest`
- `../common/ProductTabs` → `../common/utils/ProductTabs`

## **Page Component Import Updates**

### **Admin Pages**
- `../pages/AdminDashboard` → `../pages/admin/AdminDashboard`
- `../pages/AdminProductManager` → `../pages/admin/AdminProductManager`
- `../pages/AdminVerification` → `../pages/admin/AdminVerification`
- `../pages/AdvancedAnalytics` → `../pages/admin/AdvancedAnalytics`
- `../pages/InventoryManagement` → `../pages/admin/InventoryManagement`

### **User Pages**
- `../pages/Profile` → `../pages/user/Profile`
- `../pages/MyOrders` → `../pages/user/MyOrders`
- `../pages/Wishlist` → `../pages/user/Wishlist`
- `../pages/ContactPage` → `../pages/user/ContactPage`

### **Product Pages**
- `../pages/IoTComponentsPage` → `../pages/products/IoTComponentsPage`
- `../pages/ReadyMadeProjectsPage` → `../pages/products/ReadyMadeProjectsPage`
- `../pages/ProductDetailPage` → `../pages/products/ProductDetailPage`

### **Ecommerce Pages**
- `../pages/CartPage` → `../pages/ecommerce/CartPage`
- `../pages/CheckoutPage` → `../pages/ecommerce/CheckoutPage`

## **Database Import Updates**

### **Supabase**
- `../utils/supabase/client` → `../database/supabase/client`
- `../utils/supabase/info` → `../database/supabase/info`
- `../services/api` → `../database/supabase/api`
- `../services/realtimeService` → `../database/supabase/realtimeService`
- `../config/api` → `../database/supabase/config`

### **Auth**
- `../utils/sessionManager` → `../database/auth/sessionManager`
- `../utils/emailValidation` → `../database/auth/emailValidation`
- `../api/send-otp` → `../database/auth/send-otp`
- `../api/verify-otp` → `../database/auth/verify-otp`

### **Notifications**
- `../services/smsService` → `../database/notifications/smsService`
- `../services/emailService` → `../database/notifications/emailService`
