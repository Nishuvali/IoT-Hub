// API Configuration
// Change this URL to match your backend server
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 2
};

// Helper to check if backend is available
export const isBackendAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      timeout: 3000
    } as RequestInit);
    return response.ok;
  } catch (error) {
    return false;
  }
};