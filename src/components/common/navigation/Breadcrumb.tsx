import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  items, 
  className = '' 
}) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from current path if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Convert segment to readable label
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        current: isLast
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbItems = items || generateBreadcrumbs();
  
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
            )}
            
            {item.href && !item.current ? (
              <Link
                to={item.href}
                className="flex items-center text-muted-foreground hover:text-primary transition-colors"
              >
                {index === 0 && <Home className="h-4 w-4 mr-1" />}
                {item.label}
              </Link>
            ) : (
              <span className={`flex items-center ${
                item.current 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground'
              }`}>
                {index === 0 && <Home className="h-4 w-4 mr-1" />}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Page-specific breadcrumb components
export const ProductBreadcrumb: React.FC<{ 
  productName?: string; 
  category?: string; 
  className?: string; 
}> = ({ productName, category, className }) => {
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/iot-components' },
  ];
  
  if (category) {
    items.push({ label: category, href: `/iot-components?category=${category}` });
  }
  
  if (productName) {
    items.push({ label: productName, current: true });
  }
  
  return <Breadcrumb items={items} className={className} />;
};

export const ProjectBreadcrumb: React.FC<{ 
  projectName?: string; 
  className?: string; 
}> = ({ projectName, className }) => {
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Ready-Made Projects', href: '/ready-made-projects' },
  ];
  
  if (projectName) {
    items.push({ label: projectName, current: true });
  }
  
  return <Breadcrumb items={items} className={className} />;
};

export const AdminBreadcrumb: React.FC<{ 
  section?: string; 
  className?: string; 
}> = ({ section, className }) => {
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Admin', href: '/admin' },
  ];
  
  if (section) {
    items.push({ label: section, current: true });
  }
  
  return <Breadcrumb items={items} className={className} />;
};
