// API configuration and service functions
import { API_CONFIG } from './config';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

export interface ApiError {
  error: string;
  details?: string[];
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: getAuthHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Handle network errors or server not running
    if (!response.ok) {
      // Try to parse error response
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      } catch (parseError) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    
    // If it's a network error (server not running), throw a specific error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Backend server is not running or not accessible');
    }
    
    throw error;
  }
}

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }
};

// Products API
export const productsApi = {
  async getProducts(params?: {
    category?: string;
    domain?: string;
    complexity?: string;
    type?: 'physical' | 'digital_project';
    sort?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.domain) searchParams.append('domain', params.domain);
    if (params?.complexity) searchParams.append('complexity', params.complexity);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const query = searchParams.toString();
    return apiRequest(`/products${query ? `?${query}` : ''}`);
  },

  async getProduct(id: string) {
    return apiRequest(`/products/${id}`);
  },

  async getCategories() {
    return apiRequest('/products/categories/list');
  },

  async getDomains() {
    return apiRequest('/products/domains/list');
  },

  async createProduct(productData: any) {
    return apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  async updateProduct(id: string, productData: any) {
    return apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  async deleteProduct(id: string) {
    return apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  }
};

// Orders API
export const ordersApi = {
  async createOrder(orderData: {
    items: Array<{ productId: string; quantity: number }>;
    shippingAddress: any;
    paymentMethod: any;
  }) {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async getMyOrders() {
    return apiRequest('/orders/my-orders');
  },

  async getOrder(id: string) {
    return apiRequest(`/orders/${id}`);
  },

  async getAllOrders(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const query = searchParams.toString();
    return apiRequest(`/orders${query ? `?${query}` : ''}`);
  },

  async updateOrderStatus(id: string, status: string) {
    return apiRequest(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
};

// Users API
export const usersApi = {
  async getProfile() {
    return apiRequest('/users/profile');
  },

  async updateProfile(userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }) {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return apiRequest('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async getAllUsers(params?: {
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const query = searchParams.toString();
    return apiRequest(`/users${query ? `?${query}` : ''}`);
  },

  async updateUserRole(id: string, role: string) {
    return apiRequest(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }
};

// Health check
export const healthApi = {
  async check() {
    return apiRequest('/health');
  }
};