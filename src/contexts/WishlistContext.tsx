import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  product_type: 'physical' | 'digital_project';
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
}

type WishlistAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_WISHLIST'; payload: WishlistItem[] }
  | { type: 'ADD_TO_WISHLIST'; payload: WishlistItem }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'CLEAR_WISHLIST' };

const initialState: WishlistState = {
  items: [],
  isLoading: false,
};

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_WISHLIST':
      return { ...state, items: action.payload, isLoading: false };
    case 'ADD_TO_WISHLIST':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        toast.info('Product is already in your wishlist');
        return state;
      }
      toast.success('Added to wishlist');
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_FROM_WISHLIST':
      toast.success('Removed from wishlist');
      return { ...state, items: state.items.filter(item => item.id !== action.payload) };
    case 'CLEAR_WISHLIST':
      return { ...state, items: [] };
    default:
      return state;
  }
};

interface WishlistContextType {
  wishlist: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (product: Omit<WishlistItem, 'addedAt'>) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { state: authState } = useAuth();

  // Get user-specific storage key
  const getStorageKey = () => {
    if (authState.isAuthenticated && authState.user) {
      return `wishlist_items_${authState.user.id}`;
    }
    return 'wishlist_items_anonymous';
  };

  // Load wishlist from localStorage on mount and when user changes
  useEffect(() => {
    const loadWishlist = () => {
      try {
        const storageKey = getStorageKey();
        const storedWishlist = localStorage.getItem(storageKey);
        if (storedWishlist) {
          const parsedWishlist = JSON.parse(storedWishlist);
          dispatch({ type: 'SET_WISHLIST', payload: parsedWishlist });
        } else {
          // Clear wishlist when switching users
          dispatch({ type: 'SET_WISHLIST', payload: [] });
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
      }
    };

    loadWishlist();
  }, [authState.isAuthenticated, authState.user?.id]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  }, [state.items, authState.isAuthenticated, authState.user?.id]);

  const addToWishlist = (product: Omit<WishlistItem, 'addedAt'>) => {
    const wishlistItem: WishlistItem = {
      ...product,
      addedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TO_WISHLIST', payload: wishlistItem });
  };

  const removeFromWishlist = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
    // Clear the user-specific storage key
    const storageKey = getStorageKey();
    localStorage.removeItem(storageKey);
  };

  const isInWishlist = (productId: string) => {
    return state.items.some(item => item.id === productId);
  };

  const getWishlistCount = () => {
    return state.items.length;
  };

  const value: WishlistContextType = {
    wishlist: state.items,
    isLoading: state.isLoading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
