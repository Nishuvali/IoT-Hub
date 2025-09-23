import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4 w-full',
    rectangular: 'w-full h-4',
    circular: 'rounded-full aspect-square'
  };
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
    none: ''
  };
  
  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };
  
  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-border p-4 space-y-4">
      <SkeletonLoader variant="rectangular" height={200} className="w-full" />
      <div className="space-y-2">
        <SkeletonLoader variant="text" width="80%" />
        <SkeletonLoader variant="text" width="60%" />
        <SkeletonLoader variant="text" width="40%" />
      </div>
      <div className="flex justify-between items-center">
        <SkeletonLoader variant="text" width="30%" />
        <SkeletonLoader variant="rectangular" width={100} height={32} />
      </div>
    </div>
  );
};

// Product Grid Skeleton
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Page Header Skeleton
export const PageHeaderSkeleton: React.FC = () => {
  return (
    <div className="bg-white border-b border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <SkeletonLoader variant="text" width="40%" height={32} />
          <SkeletonLoader variant="text" width="60%" height={20} />
        </div>
      </div>
    </div>
  );
};

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-surface px-6 py-3 border-b border-border">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, index) => (
            <SkeletonLoader key={index} variant="text" width="20%" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <SkeletonLoader key={colIndex} variant="text" width="20%" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Form Skeleton
export const FormSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-border p-6 space-y-6">
      <div className="space-y-4">
        <SkeletonLoader variant="text" width="25%" height={20} />
        <SkeletonLoader variant="rectangular" height={40} />
      </div>
      <div className="space-y-4">
        <SkeletonLoader variant="text" width="25%" height={20} />
        <SkeletonLoader variant="rectangular" height={40} />
      </div>
      <div className="space-y-4">
        <SkeletonLoader variant="text" width="25%" height={20} />
        <SkeletonLoader variant="rectangular" height={100} />
      </div>
      <div className="flex justify-end space-x-4">
        <SkeletonLoader variant="rectangular" width={100} height={36} />
        <SkeletonLoader variant="rectangular" width={100} height={36} />
      </div>
    </div>
  );
};
