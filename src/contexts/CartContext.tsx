import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  product_type: 'physical' | 'digital_project';
  stock?: number;
  active?: boolean;
  rating?: number;
  // Digital project specific fields
  domain?: 'CSE' | 'AIML' | 'Cybersecurity' | 'IoT';
  technology_stack?: string;
  academic_level?: 'Diploma' | 'BTech' | 'MTech';
  customization_available?: boolean;
  base_price?: number;
  project_complexity?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return { items: updatedItems, total };
      } else {
        const newItems = [...state.items, { ...action.payload, quantity: 1 }];
        const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return { items: newItems, total };
      }
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { items: newItems, total };
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        const newItems = state.items.filter(item => item.id !== action.payload.id);
        const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return { items: newItems, total };
      }
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { items: updatedItems, total };
    }
    case 'CLEAR_CART':
      return { items: [], total: 0 };
    case 'LOAD_CART': {
      const total = action.payload.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { items: action.payload, total };
    }
    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });
  const { state: authState } = useAuth();

  // Get user-specific storage key
  const getStorageKey = () => {
    if (authState.isAuthenticated && authState.user) {
      return `cart_items_${authState.user.id}`;
    }
    return 'cart_items_anonymous';
  };

  // Load cart from localStorage on mount and when user changes
  useEffect(() => {
    const storageKey = getStorageKey();
    const savedCart = localStorage.getItem(storageKey);
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    } else {
      // Clear cart when switching users
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [authState.isAuthenticated, authState.user?.id]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(state.items));
  }, [state.items, authState.isAuthenticated, authState.user?.id]);

  const addItem = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    // Clear the user-specific storage key
    const storageKey = getStorageKey();
    localStorage.removeItem(storageKey);
  };

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};