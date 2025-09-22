import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CookieConsent } from '../common/features/CookieConsent';
import { PWAInstallPrompt } from '../common/features/PWAInstallPrompt';

interface PageLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showCookieConsent?: boolean;
  showPWAInstall?: boolean;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
  showCookieConsent = true,
  showPWAInstall = true,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {showHeader && <Header />}
      
      <main className="flex-1">
        {children}
      </main>
      
      {showFooter && <Footer />}
      
      {showCookieConsent && <CookieConsent />}
      {showPWAInstall && <PWAInstallPrompt />}
    </div>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebar,
  header,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {header && (
        <div className="bg-white border-b">
          {header}
        </div>
      )}
      
      <div className="flex">
        {sidebar && (
          <aside className="w-64 bg-white border-r min-h-screen">
            {sidebar}
          </aside>
        )}
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {title && (
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl';
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = '7xl',
  className = ''
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl'
  };

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthClasses[maxWidth]} ${className}`}>
      {children}
    </div>
  );
};
