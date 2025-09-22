import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/navigation/tabs';
import { ProductGrid } from '../../ecommerce/ProductGrid';
import { ProductRecommendations } from '../features/ProductRecommendations';
import { Cpu, Smartphone } from 'lucide-react';
import { supabase } from '../../../database/supabase/client';
import { Product } from '../../../contexts/CartContext';
import { useCart } from '../../../contexts/CartContext';
import { useWishlist } from '../../../contexts/WishlistContext';
import { toast } from 'sonner';

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

interface ProductGridWithTypeProps {
  productType: 'physical' | 'digital_project';
  title: string;
  description: string;
}

const ProductGridWithType: React.FC<ProductGridWithTypeProps> = ({ productType, title, description }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();
  const { addToWishlist } = useWishlist();

  const handleViewDetails = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    fetchProducts();
  }, [productType]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('product_type', productType)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } else {
        setProducts((data || []).map(transformSupabaseProduct));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
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
    <ProductGrid
      products={products}
      isLoading={isLoading}
      onAddToCart={handleAddToCart}
      onAddToWishlist={handleAddToWishlist}
      onViewDetails={handleProductViewDetails}
      emptyStateTitle={`No ${title} found`}
      emptyStateDescription={description}
    />
  );
};

export const ProductTabs: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl mb-4">IoT Components & Ready-Made Projects</h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Get everything you need for your IoT projects - from individual components to complete ready-made solutions for students and professionals.
        </p>
      </div>

      <Tabs defaultValue="physical" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="physical" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            IoT Components
          </TabsTrigger>
          <TabsTrigger value="digital_project" className="flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Ready-Made Projects
          </TabsTrigger>
        </TabsList>
        
               <TabsContent value="physical" className="space-y-4">
                 <div className="text-center mb-6">
                   <h2 className="text-2xl mb-2">IoT Components Store</h2>
                   <p className="text-muted-foreground">
                     Premium IoT components with fast shipping and technical support. Shop Arduino, Raspberry Pi, sensors, and more.
                   </p>
                 </div>
                 <ProductGridWithType
                   productType="physical"
                   title="IoT Components"
                   description="High-quality components for your IoT projects"
                 />
               </TabsContent>

               <TabsContent value="digital_project" className="space-y-4">
                 <div className="text-center mb-6">
                   <h2 className="text-2xl mb-2">Ready-Made Projects</h2>
                   <p className="text-muted-foreground">
                     Complete project solutions for CSE, AI/ML, Cybersecurity, and IoT. Customizable for your specific requirements.
                   </p>
                 </div>
                 <ProductGridWithType
                   productType="digital_project"
                   title="Ready-Made Projects"
                   description="Complete projects ready for implementation"
                 />
               </TabsContent>
      </Tabs>

      {/* Featured Recommendations */}
      <div className="mt-16">
        <ProductRecommendations 
          limit={8}
          title="Featured Products"
        />
      </div>
    </div>
  );
};