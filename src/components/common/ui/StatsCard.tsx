import React from 'react';
import { Button } from '../../ui/forms/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/layout/card';
import { Badge } from '../../ui/feedback/badge';
import { Separator } from '../../ui/layout/separator';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  trend,
  icon,
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <Badge variant={trend.isPositive ? 'default' : 'destructive'}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Badge>
            <span className="text-xs text-muted-foreground ml-2">
              from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  children,
  actions,
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {actions && (
            <div className="flex gap-2">
              {actions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  actions,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};
