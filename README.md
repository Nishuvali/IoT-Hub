
# 🚀 IoT Hub - E-commerce Platform

A comprehensive IoT components and digital projects e-commerce platform built with React, TypeScript, and Supabase.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Detailed Setup](#-detailed-setup)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Team Development](#-team-development)
- [Troubleshooting](#-troubleshooting)

## ✨ Features

### 🛒 E-commerce Features
- **Product Catalog**: IoT components and digital projects
- **Shopping Cart**: Add/remove items, quantity management
- **Checkout Process**: Full-page checkout with UPI payment integration
- **Order Management**: Order tracking and status updates
- **User Authentication**: Email/password, Google OAuth, mobile OTP

### 👨‍💼 Admin Features
- **Admin Dashboard**: Analytics, order management, user management
- **Product Management**: CRUD operations for both physical and digital products
- **Inventory Management**: Stock tracking, low stock alerts
- **Real-time Updates**: Live synchronization across all pages

### 🔧 Technical Features
- **Real-time Database**: Supabase integration with live updates
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Radix UI components with custom styling

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for components
- **Context API** for state management

### Backend & Database
- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security (RLS)
- **Real-time subscriptions** for live updates

### Additional Services
- **Twilio** for SMS/OTP services
- **SMTP/SendGrid** for email notifications
- **UPI Payment** integration

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

### One-Command Setup

#### macOS (Recommended for MacBook Air)
```bash
chmod +x setup-macos.sh
./setup-macos.sh
```

#### Windows (PowerShell)
```powershell
.\install-dependencies.ps1
```

#### Windows (Command Prompt)
```cmd
install-dependencies.bat
```

#### Linux/Other Unix
```bash
chmod +x install-dependencies.sh
./install-dependencies.sh
```

### Manual Installation
```bash
# Install dependencies
npm install

# Install global tools (optional)
npm install -g typescript vite

# Start development server
npm run dev
```

## 📖 Detailed Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Ecommerce Website (Copy)"
```

### 2. Install Dependencies
Choose one of the following methods:

#### Method A: Automated Script
```bash
# Windows PowerShell
.\install-dependencies.ps1

# Windows Command Prompt
install-dependencies.bat

# macOS/Linux
./install-dependencies.sh
```

#### Method B: Manual Installation
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# See Environment Configuration section below
```

### 4. Database Setup
1. Create a Supabase project
2. Run the database setup scripts in order:
   - `enhanced-schema.sql`
   - `admin-setup.sql`
   - `sample-products.sql`
3. Configure RLS policies
4. Set up authentication providers

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Twilio Configuration (for SMS/OTP)
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
VITE_TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email Configuration (SMTP/SendGrid)
VITE_SMTP_HOST=your_smtp_host
VITE_SMTP_PORT=your_smtp_port
VITE_SMTP_USER=your_smtp_username
VITE_SMTP_PASS=your_smtp_password
VITE_FROM_EMAIL=your_from_email

# Admin Configuration
VITE_ADMIN_EMAIL=iothub1324@gmail.com
VITE_ADMIN_PASSWORD=Sidnish@1101
```

## 🗄 Database Setup

### 1. Supabase Project Setup
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### 2. Database Schema
Run these SQL scripts in your Supabase SQL editor:

```sql
-- 1. Enhanced Schema
-- Run: enhanced-schema.sql

-- 2. Admin Setup
-- Run: admin-setup.sql

-- 3. Sample Data
-- Run: sample-products.sql

-- 4. Remove deprecated columns (if needed)
-- Run: remove-in-stock-column.sql
```

### 3. Authentication Setup
1. Enable email authentication in Supabase Auth settings
2. Configure Google OAuth (optional)
3. Set up SMS provider for mobile verification

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Type Checking
```bash
npm run type-check
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── AdminDashboard.tsx
│   ├── ProductTabs.tsx
│   └── ...
├── utils/               # Utility functions
│   └── supabase/        # Supabase client configuration
├── services/            # API services
├── config/              # Configuration files
├── styles/              # Global styles
└── main.tsx            # Application entry point

Database Scripts/
├── enhanced-schema.sql
├── admin-setup.sql
├── sample-products.sql
└── remove-in-stock-column.sql
```

## 👥 Team Development

### For New Team Members

1. **Clone the repository**
2. **Run the setup script**:
   ```bash
   # Windows
   .\install-dependencies.ps1
   
   # macOS/Linux
   ./install-dependencies.sh
   ```
3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```
4. **Set up database** (see Database Setup section)
5. **Start development**:
   ```bash
   npm run dev
   ```

### Development Workflow

1. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test**:
   ```bash
   npm run dev
   npm run type-check
   ```

3. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

### Code Standards

- **TypeScript**: Use strict typing
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS classes
- **State Management**: Context API for global state
- **Database**: Supabase with RLS policies

## 🔧 Troubleshooting

### Common Issues

#### 1. Dependencies Installation Failed
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. Supabase Connection Issues
- Verify your `.env` file has correct Supabase credentials
- Check if your Supabase project is active
- Ensure RLS policies are properly configured

#### 3. TypeScript Errors
```bash
# Install TypeScript globally
npm install -g typescript

# Check TypeScript version
tsc --version
```

#### 4. Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173

# Or use different port
npm run dev -- --port 3000
```

#### 5. Database Schema Issues
- Run database scripts in correct order
- Check for existing tables before running scripts
- Verify RLS policies are enabled

### Getting Help

1. **Check the logs**: Look at browser console and terminal output
2. **Verify environment**: Ensure all `.env` variables are set
3. **Database status**: Check Supabase dashboard for errors
4. **Dependencies**: Ensure all packages are installed correctly

## 📞 Support

For technical support or questions:
- **Email**: iothub1324@gmail.com
- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue in the repository

## 📄 License

This project is proprietary software. All rights reserved.

---

**Happy Coding! 🚀**
  