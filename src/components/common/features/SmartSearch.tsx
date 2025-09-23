import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, Zap } from 'lucide-react';
import { Input } from '../../ui/forms/input';
import { Button } from '../../ui/forms/button';
import { Card, CardContent } from '../../ui/layout/card';
import { Badge } from '../../ui/feedback/badge';
import { supabase } from '../../../database/supabase/client';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand' | 'recent' | 'trending';
  count?: number;
}

interface SmartSearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export const SmartSearch: React.FC<SmartSearchProps> = ({ 
  placeholder = "Search components & projects...", 
  className = "",
  onSearch 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleViewDetails = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Load trending searches (mock data for now)
  useEffect(() => {
    setTrendingSearches([
      { id: '1', text: 'Arduino Uno', type: 'trending', count: 150 },
      { id: '2', text: 'ESP32', type: 'trending', count: 120 },
      { id: '3', text: 'Raspberry Pi', type: 'trending', count: 100 },
      { id: '4', text: 'IoT Projects', type: 'trending', count: 80 },
      { id: '5', text: 'Sensors', type: 'trending', count: 90 },
    ]);
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Debounced search function
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      // Search products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, category, brand, type')
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`)
        .limit(5);

      if (productsError) throw productsError;

      // Search categories
      const { data: categories, error: categoriesError } = await supabase
        .from('products')
        .select('category')
        .ilike('category', `%${searchQuery}%`)
        .limit(3);

      if (categoriesError) throw categoriesError;

      // Search brands
      const { data: brands, error: brandsError } = await supabase
        .from('products')
        .select('brand')
        .ilike('brand', `%${searchQuery}%`)
        .limit(3);

      if (brandsError) throw brandsError;

      // Combine and format suggestions
      const allSuggestions: SearchSuggestion[] = [];

      // Add product suggestions
      products?.forEach(product => {
        allSuggestions.push({
          id: product.id,
          text: product.name,
          type: 'product'
        });
      });

      // Add category suggestions
      const uniqueCategories = [...new Set(categories?.map(c => c.category) || [])];
      uniqueCategories.forEach(category => {
        allSuggestions.push({
          id: `cat-${category}`,
          text: category,
          type: 'category'
        });
      });

      // Add brand suggestions
      const uniqueBrands = [...new Set(brands?.map(b => b.brand) || [])];
      uniqueBrands.forEach(brand => {
        allSuggestions.push({
          id: `brand-${brand}`,
          text: brand,
          type: 'brand'
        });
      });

      // Add fuzzy matching for typos
      const fuzzySuggestions = generateFuzzySuggestions(searchQuery);
      allSuggestions.push(...fuzzySuggestions);

      setSuggestions(allSuggestions.slice(0, 8));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFuzzySuggestions = (searchQuery: string): SearchSuggestion[] => {
    const commonTerms = [
      'arduino', 'esp32', 'raspberry', 'sensor', 'microcontroller', 'wifi', 'bluetooth',
      'iot', 'project', 'kit', 'board', 'module', 'shield', 'camera', 'display'
    ];

    const fuzzyMatches = commonTerms.filter(term => {
      const distance = levenshteinDistance(searchQuery.toLowerCase(), term);
      return distance <= 2 && distance > 0;
    });

    return fuzzyMatches.map(term => ({
      id: `fuzzy-${term}`,
      text: `Did you mean "${term}"?`,
      type: 'trending' as const
    }));
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product') {
      handleViewDetails(suggestion.id);
    } else {
      setQuery(suggestion.text);
      handleSearch(suggestion.text);
    }
    setIsOpen(false);
  };

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    // Save to recent searches
    const newRecent = [finalQuery, ...recentSearches.filter(s => s !== finalQuery)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recent_searches', JSON.stringify(newRecent));

    // Track search analytics
    trackSearchAnalytics(finalQuery);

    // Execute search
    if (onSearch) {
      onSearch(finalQuery);
    } else {
      // Default behavior - navigate to home with search
      window.location.href = `/?search=${encodeURIComponent(finalQuery)}`;
    }

    setIsOpen(false);
  };

  const trackSearchAnalytics = (searchQuery: string) => {
    // Track search analytics
    const searchData = {
      query: searchQuery,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    // Store in localStorage for now (in production, send to analytics service)
    const searches = JSON.parse(localStorage.getItem('search_analytics') || '[]');
    searches.push(searchData);
    localStorage.setItem('search_analytics', JSON.stringify(searches.slice(-100))); // Keep last 100 searches
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'product': return <Search className="h-4 w-4" />;
      case 'category': return <Zap className="h-4 w-4" />;
      case 'brand': return <TrendingUp className="h-4 w-4" />;
      case 'recent': return <Clock className="h-4 w-4" />;
      case 'trending': return <TrendingUp className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getSuggestionColor = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'product': return 'text-blue-600';
      case 'category': return 'text-green-600';
      case 'brand': return 'text-purple-600';
      case 'recent': return 'text-gray-600';
      case 'trending': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            } else if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 mb-2 px-2">Suggestions</div>
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 cursor-pointer rounded"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className={getSuggestionColor(suggestion.type)}>
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    <span className="flex-1 text-sm">{suggestion.text}</span>
                    {suggestion.count && (
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.count}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && suggestions.length === 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between mb-2 px-2">
                  <div className="text-xs font-medium text-gray-500">Recent Searches</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={clearRecentSearches}
                  >
                    Clear
                  </Button>
                </div>
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 cursor-pointer rounded"
                    onClick={() => handleSuggestionClick({ id: `recent-${index}`, text: search, type: 'recent' })}
                  >
                    <Clock className="h-4 w-4 text-gray-600" />
                    <span className="flex-1 text-sm">{search}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Trending Searches */}
            {suggestions.length === 0 && recentSearches.length === 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 mb-2 px-2">Trending Searches</div>
                {trendingSearches.map((trend) => (
                  <div
                    key={trend.id}
                    className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 cursor-pointer rounded"
                    onClick={() => handleSuggestionClick(trend)}
                  >
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <span className="flex-1 text-sm">{trend.text}</span>
                    {trend.count && (
                      <Badge variant="secondary" className="text-xs">
                        {trend.count}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                <p className="text-xs text-gray-500 mt-2">Searching...</p>
              </div>
            )}

            {/* No Results */}
            {!loading && suggestions.length === 0 && recentSearches.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">
                Start typing to search...
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
