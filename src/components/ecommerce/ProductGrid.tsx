import React from 'react';
import { ProductCard } from '../common/ui/ProductCard';
import { LoadingSpinner } from '../common/ui/LoadingSpinner';
import { EmptyState } from '../common/ui/AlertMessage';
import { Product } from '../../contexts/CartContext';
import { Package, Search } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  viewMode?: 'grid' | 'list';
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  viewMode = 'grid',
  onAddToCart,
  onAddToWishlist,
  onViewDetails,
  emptyStateTitle = 'No products found',
  emptyStateDescription = 'Try adjusting your search or filter criteria.',
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`py-8 ${className}`}>
        <LoadingSpinner text="Loading products..." />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`py-8 ${className}`}>
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title={emptyStateTitle}
          description={emptyStateDescription}
        />
      </div>
    );
  }

  const gridClasses = viewMode === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
    : 'space-y-4';

  return (
    <div className={`${gridClasses} ${className}`}>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          viewMode={viewMode}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

interface ProductFiltersProps {
  filters: {
    category: string;
    priceRange: [number, number];
    brand: string[];
    rating: number;
    availability: string;
    searchQuery: string;
    sortBy: string;
  };
  onFilterChange: (key: string, value: any) => void;
  onBrandChange: (brand: string, checked: boolean) => void;
  onClearFilters: () => void;
  availableBrands: string[];
  availableCategories: string[];
  className?: string;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  onBrandChange,
  onClearFilters,
  availableBrands,
  availableCategories,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search */}
      <div>
        <label className="block text-sm font-medium mb-2">Search</label>
        <input
          type="text"
          placeholder="Search products..."
          value={filters.searchQuery}
          onChange={(e) => onFilterChange('searchQuery', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {availableCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
        </label>
        <input
          type="range"
          min="0"
          max="10000"
          step="100"
          value={filters.priceRange[1]}
          onChange={(e) => onFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
          className="w-full"
        />
      </div>

      {/* Brand Filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Brand</label>
        <div className="space-y-2">
          {availableBrands.map(brand => (
            <label key={brand} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.brand.includes(brand)}
                onChange={(e) => onBrandChange(brand, e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={onClearFilters}
        className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Clear Filters
      </button>
    </div>
  );
};
