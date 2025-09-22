import React from 'react';
import { Alert, AlertDescription } from '../../ui/feedback/alert';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface AlertMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  className?: string;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({
  type,
  title,
  message,
  className = ''
}) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const Icon = icons[type];

  return (
    <Alert className={`${className}`} variant={type === 'error' ? 'destructive' : 'default'}>
      <Icon className="h-4 w-4" />
      <AlertDescription>
        {title && <div className="font-semibold">{title}</div>}
        <div>{message}</div>
      </AlertDescription>
    </Alert>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-center mb-4 max-w-md">
          {description}
        </p>
      )}
      {action && action}
    </div>
  );
};
