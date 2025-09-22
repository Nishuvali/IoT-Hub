import { projectId, publicAnonKey } from './supabase/info'
import { supabase } from './supabase/client'

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/api`

// Get auth token from Supabase session
const getAuthToken = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  } catch (error) {
    console.log('Error getting auth token:', error)
    return null
  }
}

// Generic API call function
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const authToken = await getAuthToken()
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken || publicAnonKey}`,
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error)
    throw error
  }
}

// Product API calls
export const productsApi = {
  getAll: async (params?: { category?: string; search?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.append('category', params.category)
    if (params?.search) searchParams.append('search', params.search)
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())
    
    const query = searchParams.toString()
    return apiCall(`/products${query ? `?${query}` : ''}`)
  },

  getById: async (id: string) => {
    return apiCall(`/products/${id}`)
  },

  getCategories: async () => {
    return apiCall('/categories')
  },

  getDomains: async () => {
    return apiCall('/domains')
  },

  updateInventory: async (productId: string, stock: number) => {
    return apiCall('/inventory/update', {
      method: 'POST',
      body: JSON.stringify({ productId, stock })
    })
  }
}

// Order API calls
export const ordersApi = {
  create: async (orderData: any) => {
    return apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    })
  },

  getMyOrders: async () => {
    return apiCall('/orders/my-orders')
  },

  getTracking: async (orderId: string) => {
    return apiCall(`/orders/${orderId}/tracking`)
  },

  updateStatus: async (orderId: string, status: string) => {
    return apiCall(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  },

  getAllOrders: async () => {
    return apiCall('/admin/orders')
  }
}

// WhatsApp API calls
export const whatsappApi = {
  submitInquiry: async (inquiryData: any) => {
    return apiCall('/whatsapp/inquiry', {
      method: 'POST',
      body: JSON.stringify(inquiryData)
    })
  },

  getInquiries: async () => {
    return apiCall('/admin/inquiries')
  }
}

// Auth API calls
export const authApi = {
  signup: async (userData: any) => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }
}

// Health check
export const healthCheck = async () => {
  return apiCall('/health')
}