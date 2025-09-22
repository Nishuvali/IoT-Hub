import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../../layouts/PageLayout';
import { PageHeader } from '../../common/ui/PageHeader';
import { ProductGrid } from '../../ecommerce/ProductGrid';
import { ProductFilters } from '../../ecommerce/ProductGrid';
import { Container } from '../../layouts/PageLayout';
import { Button } from '../../ui/forms/button';
import { Grid, List, Code } from 'lucide-react';
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

interface ReadyMadeProjectsPageProps {
  // Removed onBack prop since we're using React Router
}

export const ReadyMadeProjectsPage: React.FC<ReadyMadeProjectsPageProps> = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [0, 50000] as [number, number],
    brand: [] as string[],
    rating: 0,
    availability: 'all',
    searchQuery: '',
    sortBy: 'name-asc',
  });
  const [availableTechnologies, setAvailableTechnologies] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const { addItem } = useCart();
  const { addToWishlist } = useWishlist();
  const handleViewDetails = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    fetchProjects();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [filters]);

  const fetchProjects = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_type', 'digital_project');

    if (error) {
      toast.error('Failed to fetch projects: ' + error.message);
      console.error('Error fetching projects:', error);
      setProjects([]);
    } else {
        setProjects((data || []).map(transformSupabaseProduct));
    }
    setIsLoading(false);
  };

  const fetchFilterOptions = async () => {
    // Mock technologies for digital projects
    setAvailableTechnologies(['Arduino', 'Raspberry Pi', 'ESP32', 'AI/ML', 'Web Development', 'Mobile App']);

    // Fetch unique categories
    const { data: categoryData } = await supabase
      .from('products')
      .select('category')
      .eq('product_type', 'digital_project');
    
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
      .eq('product_type', 'digital_project');

    // Apply filters
    if (filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);

    if (filters.brand.length > 0) {
      // Simplified brand filter - in real app, you'd have a proper relationship
      query = query.filter('features', 'cs', JSON.stringify(filters.brand));
    }

    // Difficulty filter removed as it's not in the products table schema

    if (filters.rating > 0) {
      query = query.gte('rating', filters.rating);
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
      setProjects([]);
    } else {
        setProjects((data || []).map(transformSupabaseProduct));
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
      priceRange: [0, 50000],
      brand: [],
      rating: 0,
      availability: 'all',
      searchQuery: '',
      sortBy: 'name-asc',
    });
  };

  const handleAddToCart = (project: Product) => {
    addItem(project, 1);
    toast.success(`${project.name} added to cart!`);
  };

  const handleAddToWishlist = (project: Product) => {
    addToWishlist(project);
    toast.success(`${project.name} added to wishlist!`);
  };

  const handleProjectViewDetails = (project: Product) => {
    handleViewDetails(project.id);
  };

  return (
    <PageLayout showHeader={false} showFooter={false}>
      <PageHeader
        title="Ready-Made Projects"
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
                <Code className="h-5 w-5" />
                <h3 className="font-semibold">Filters</h3>
              </div>
              <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onBrandChange={handleBrandChange}
                onClearFilters={handleClearFilters}
                availableBrands={availableTechnologies}
                availableCategories={availableCategories}
              />
            </div>
          </div>

          {/* Projects Grid */}
          <div className="lg:col-span-3">
            <ProductGrid
              products={projects}
              isLoading={isLoading}
              viewMode={viewMode}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              onViewDetails={handleProjectViewDetails}
              emptyStateTitle="No projects found"
              emptyStateDescription="Try adjusting your search or filter criteria to find what you're looking for."
            />
          </div>
        </div>
      </Container>
    </PageLayout>
  );
};
