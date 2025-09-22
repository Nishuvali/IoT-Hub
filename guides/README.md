# 📚 **IoT Hub - Complete Project Guide**

## 🎯 **Project Overview**

IoT Hub is a comprehensive ecommerce platform specializing in IoT components and ready-made projects. Built with React, TypeScript, and Supabase, it features a modern component architecture and enterprise-grade organization.

---

## 🚀 **Quick Start Guide**

### **Prerequisites**
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Supabase Account**

### **Setup Steps**

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd "Ecommerce Website (Copy)"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Database Setup**
   ```bash
   # Run SQL scripts in order:
   # 1. sql-scripts/schema/products-table-schema.sql
   # 2. sql-scripts/sample-data/sample-products.sql
   # 3. sql-scripts/migrations/mobile-otp-verification-table.sql
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

---

## 🏗️ **Project Architecture**

### **Component Structure**
```
src/components/
├── 📁 common/              # Reusable components
│   ├── auth/               # Authentication components
│   ├── ui/                 # Generic UI components
│   ├── features/           # Feature-specific components
│   ├── communication/      # Communication components
│   └── utils/              # Utility components
│
├── 📁 ui/                  # Design system components
│   ├── forms/              # Form components
│   ├── layout/             # Layout components
│   ├── feedback/           # Feedback components
│   ├── navigation/         # Navigation components
│   ├── overlay/            # Overlay components
│   ├── data-display/       # Data display components
│   ├── interactive/        # Interactive components
│   ├── utility/            # Utility components
│   └── primitives/         # Base primitives
│
├── 📁 pages/               # Page components
│   ├── admin/              # Admin pages
│   ├── user/               # User pages
│   ├── products/           # Product pages
│   └── ecommerce/          # Ecommerce pages
│
├── 📁 ecommerce/           # Ecommerce-specific components
├── 📁 layouts/             # Layout components
└── 📁 figma/               # Design components
```

### **SQL Scripts Structure**
```
sql-scripts/
├── 📁 schema/              # Database schemas
├── 📁 sample-data/         # Sample data
├── 📁 migrations/          # Database migrations
├── 📁 admin/               # Admin setup
└── 📁 fixes/               # Database fixes
```

---

## 🗄️ **Database Setup**

### **Required Tables**
1. **profiles** - User profiles and authentication
2. **products** - Product catalog
3. **addresses** - User addresses
4. **orders** - Order management
5. **order_items** - Order line items
6. **mobile_otp_verification** - Mobile verification

### **Setup Order**
1. Run `sql-scripts/schema/products-table-schema.sql`
2. Run `sql-scripts/sample-data/sample-products.sql`
3. Run `sql-scripts/migrations/mobile-otp-verification-table.sql`
4. Run `sql-scripts/admin/create-admin-user.sql` (optional)

### **Environment Variables**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TWILIO_ACCOUNT_SID=your_twilio_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_token
VITE_TWILIO_PHONE_NUMBER=your_twilio_number
```

---

## 🔧 **Development Guidelines**

### **Component Organization**
- **Common Components**: Reusable across multiple pages
- **UI Components**: Design system primitives
- **Page Components**: Complete page implementations
- **Ecommerce Components**: Domain-specific functionality

### **Import Patterns**
```typescript
// UI Components
import { Button } from '../ui/forms/button';
import { Card } from '../ui/layout/card';

// Common Components
import { ProductCard } from '../common/ui/ProductCard';
import { AuthModal } from '../common/auth/AuthModal';

// Page Components
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { Profile } from '../pages/user/Profile';

// Database
import { supabase } from '../database/supabase/client';
```

### **Code Standards**
- Use TypeScript for all components
- Follow React best practices
- Use shadcn/ui components
- Implement proper error handling
- Write clean, maintainable code

---

## 🚀 **Features**

### **Authentication**
- Email/password authentication
- Social authentication (Google)
- Mobile number verification
- Session management

### **Ecommerce**
- Product catalog (IoT components & projects)
- Shopping cart
- Wishlist
- Order management
- Payment integration

### **Admin Features**
- Product management
- Order tracking
- User management
- Analytics dashboard

### **User Features**
- Profile management
- Order history
- Address management
- Mobile verification

---

## 📱 **PWA Features**

- **Offline Support**: Service worker for offline functionality
- **Install Prompt**: Native app-like installation
- **Push Notifications**: Order updates and promotions
- **Responsive Design**: Mobile-first approach

---

## 🔍 **Search & Recommendations**

- **Smart Search**: Auto-complete and typo tolerance
- **Product Recommendations**: AI-powered suggestions
- **Advanced Filters**: Price, brand, ratings, specifications
- **Search Analytics**: Track popular searches

---

## 📞 **Communication**

- **WhatsApp Integration**: Direct customer support
- **SMS Notifications**: OTP and order updates
- **Email Notifications**: Order confirmations
- **Customer Support**: Integrated support system

---

## 🛠️ **Development Commands**

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Database
npm run db:setup     # Setup database (custom script)
npm run db:seed      # Seed sample data (custom script)

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

---

## 🚀 **Deployment**

### **Production Build**
```bash
npm run build
```

### **Environment Setup**
- Configure production Supabase instance
- Set up Twilio for SMS
- Configure domain and SSL
- Set up monitoring and analytics

---

## 📋 **Troubleshooting**

### **Common Issues**
1. **Database Connection**: Check Supabase credentials
2. **SMS Not Working**: Verify Twilio configuration
3. **Build Errors**: Check TypeScript errors
4. **Import Errors**: Verify component paths

### **Support**
- Check `guides/database/` for database issues
- Check `guides/architecture/` for component issues
- Review error logs in browser console

---

## 📚 **Additional Resources**

- **Component Architecture**: `guides/architecture/COMPONENT-ARCHITECTURE.md`
- **Database Setup**: `guides/database-setup/DATABASE-SETUP-GUIDE.md`
- **SMS Setup**: `guides/database-setup/SMS-SETUP-GUIDE.md`
- **Import Guide**: `guides/architecture/IMPORT-UPDATE-GUIDE.md`

---

## 🎯 **Project Status**

- ✅ **Component Architecture**: Enterprise-grade organization
- ✅ **Database**: Fully configured with sample data
- ✅ **Authentication**: Complete with mobile verification
- ✅ **Ecommerce**: Full shopping experience
- ✅ **Admin Panel**: Complete management system
- ✅ **PWA**: Offline support and native features
- ✅ **Mobile-First**: Responsive design
- ✅ **Production Ready**: Optimized for deployment

**IoT Hub is a production-ready ecommerce platform with modern architecture and comprehensive features!** 🚀
