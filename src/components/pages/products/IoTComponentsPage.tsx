import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../../layouts/PageLayout';
import { PageHeader } from '../../common/ui/PageHeader';
import { ProductGrid } from '../../ecommerce/ProductGrid';
import { ProductFilters } from '../../ecommerce/ProductGrid';
import { Container } from '../../layouts/PageLayout';
import { Button } from '../../ui/forms/button';
import { Grid, List, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../database/supabase/client';
import { Product } from '../../../contexts/CartContext';
import { useCart } from '../../../contexts/CartContext';
import { useWishlist } from '../../../contexts/WishlistContext';

const transformSupabaseProduct = (item: any): Product => ({
  id: item.id,
  name: item.name,
  price: item.price,
  image: item.image_url || '/placeholder-product.svg',
  description: item.description || 'High-quality IoT component for your projects.',
  category: item.subcategory || item.category,
  product_type: item.product_type || 'physical',
  stock: item.stock_quantity || 0,
  active: item.stock_quantity > 0,
  rating: item.rating || 0,
});

interface IoTComponentsPageProps {
  // Removed onBack prop since we're using React Router
}

export const IoTComponentsPage: React.FC<IoTComponentsPageProps> = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [0, 10000] as [number, number],
    brand: [] as string[],
    rating: 0,
    availability: 'all',
    searchQuery: '',
    sortBy: 'name-asc',
  });
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const { addItem } = useCart();
  const { addToWishlist } = useWishlist();
  const handleViewDetails = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    fetchProducts();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [filters]);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_type', 'physical');

    if (error) {
      toast.error('Failed to fetch products: ' + error.message);
      console.error('Error fetching products:', error);
      setProducts([]);
    } else {
        setProducts((data || []).map(transformSupabaseProduct));
    }
    setIsLoading(false);
  };

  const fetchFilterOptions = async () => {
    // Fetch unique brands
    const { data: brandData } = await supabase
      .from('products')
      .select('brand')
      .eq('product_type', 'physical');
    
    if (brandData) {
      const uniqueBrands = Array.from(new Set(brandData.map(item => item.brand).filter(Boolean)));
      setAvailableBrands(uniqueBrands);
    }

    // Fetch unique categories
    const { data: categoryData } = await supabase
      .from('products')
      .select('category')
      .eq('product_type', 'physical');
    
    if (categoryData) {
      const uniqueCategories = Array.from(new Set(categoryData.map(item => item.category).filter(Boolean)));
      setAvailableCategories(uniqueCategories);
    }
  };

  const applyFiltersAndSort = async () => {
    setIsLoading(true);
    let query = supabase
      .from('products')
      .select('*')
      .eq('product_type', 'physical');

    // Apply filters
    if (filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);

    if (filters.brand.length > 0) {
      query = query.in('brand', filters.brand);
    }

    if (filters.rating > 0) {
      query = query.gte('rating', filters.rating);
    }

    if (filters.availability === 'in-stock') {
      query = query.gt('stock_quantity', 0);
    } else if (filters.availability === 'out-of-stock') {
      query = query.eq('stock_quantity', 0);
    }

    if (filters.searchQuery) {
      query = query.ilike('name', `%${filters.searchQuery}%`);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'name-asc':
        query = query.order('name', { ascending: true });
        break;
      case 'name-desc':
        query = query.order('name', { ascending: false });
        break;
      case 'price-asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price-desc':
        query = query.order('price', { ascending: false });
        break;
      case 'rating-desc':
        query = query.order('rating', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query.order('name', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Failed to apply filters: ' + error.message);
      console.error('Error applying filters:', error);
      setProducts([]);
    } else {
        setProducts((data || []).map(transformSupabaseProduct));
    }
    setIsLoading(false);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    setFilters(prev => {
      const newBrands = checked
        ? [...prev.brand, brand]
        : prev.brand.filter(b => b !== brand);
      return { ...prev, brand: newBrands };
    });
  };

  const handleClearFilters = () => {
    setFilters({
      category: 'all',
      priceRange: [0, 10000],
      brand: [],
      rating: 0,
      availability: 'all',
      searchQuery: '',
      sortBy: 'name-asc',
    });
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleAddToWishlist = (product: Product) => {
    addToWishlist(product);
    toast.success(`${product.name} added to wishlist!`);
  };

  const handleProductViewDetails = (product: Product) => {
    handleViewDetails(product.id);
  };

  return (
    <PageLayout showHeader={false} showFooter={false}>
      <PageHeader
        title="IoT Components"
        showBackButton={true}
        onBack={() => navigate(-1)}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-accent' : ''}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-accent' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <Container>
        <div className="py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-5 w-5" />
                <h3 className="font-semibold">Filters</h3>
              </div>
              <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onBrandChange={handleBrandChange}
                onClearFilters={handleClearFilters}
                availableBrands={availableBrands}
                availableCategories={availableCategories}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <ProductGrid
              products={products}
              isLoading={isLoading}
              viewMode={viewMode}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              onViewDetails={handleProductViewDetails}
              emptyStateTitle="No IoT components found"
              emptyStateDescription="Try adjusting your search or filter criteria to find what you're looking for."
            />
          </div>
        </div>
      </Container>
    </PageLayout>
  );
};
