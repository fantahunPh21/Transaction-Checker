// API Configuration
export const API_CONFIG = {
  // Base URL for your backend API
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/finance-payment-confirmation/api/v1",
  
  // Timeout for API requests (in milliseconds)
  TIMEOUT: 10000,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Endpoints
  ENDPOINTS: {
    PAYMENT_RECORDS: "/payment-records",
    PENDING_RECORDS: "/payment-records/pending",
    COMPANIES: "/companies",
    SHOPS: "/shops",
    SALESMEN: "/salesmen",
    ROLES: "/roles",
    VERIFICATION: "/verification/verify",
  }
}

// Helper function to get full API URL
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function to check if API is accessible
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.ok
  } catch (error) {
    console.error('API health check failed:', error)
    return false
  }
}
