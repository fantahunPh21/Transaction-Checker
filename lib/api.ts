/**
 * API client for making authenticated requests to the backend
 * Automatically includes JWT token in all requests
 * Handles token expiration and unauthorized responses
 */

/**
 * Gets the authentication token from localStorage
 * @returns The authentication token
 * @throws Error if token is not found
 */
export const getAuthToken = (): string => {
  const token = localStorage.getItem("authToken")
  if (!token) {
    throw new Error("Authentication token not found. Please log in again.")
  }
  return token
}

/**
 * Base API client function that handles authentication and common request options
 * @param endpoint - API endpoint path
 * @param options - Request options including method, body, etc.
 * @returns Promise with the API response
 */
async function apiClient(endpoint: string, options: RequestInit = {}) {
  // Get the JWT token from local storage
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null

  // Base URL from environment variable or default
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088/finance-payment-confirmation/api/v1/"

  // Prepare headers with content type and authorization if token exists
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }

  // Only add Authorization header if token exists
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
    console.log("Adding auth header:", `Bearer ${token.substring(0, 10)}...`)
  }

  try {
    // Log the request for debugging
    console.log(`Making API request to ${baseUrl}${endpoint}`, {
      method: options.method || "GET",
      hasToken: !!token,
    })

    // Make the API request
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    // Handle unauthorized responses (expired token)
    if (response.status === 401) {
      console.error("Unauthorized API request")
      // Clear token and redirect to sign-in page if unauthorized
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken")
        localStorage.removeItem("authUser")
        window.location.href = "/sign-in"
      }
      return { error: "Unauthorized" }
    }

    // Parse the response as JSON
    const data = await response.json()

    // Return the data or error based on response status
    return response.ok ? data : { error: data.message || "API error" }
  } catch (error) {
    console.error("API request failed:", error)
    return { error: "Failed to fetch data" }
  }
}

/**
 * Helper function for GET requests
 * @param endpoint - API endpoint path
 * @param options - Additional request options
 * @returns Promise with the API response
 */
// export function get(endpoint: string, options: RequestInit = {}) {
//   return apiClient(endpoint, { ...options, method: "GET" })
// }

const get = async (url: string, params?: Record<string, any>): Promise<any> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/finance-payment-confirmation/api/v1/"
  try {
    const token = getAuthToken()
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ""
    const response = await fetch(`${baseUrl}${url}${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Handle authentication errors
        localStorage.removeItem("token")
        window.location.href = "/sign-in"
        throw new Error("Authentication failed. Please log in again.")
      }
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching ${url}:`, error)
    throw error
  }
}

/**
 * Helper function for POST requests
 * @param endpoint - API endpoint path
 * @param data - Request body data
 * @param options - Additional request options
 * @returns Promise with the API response
 */
function post(endpoint: string, data: any, options: RequestInit = {}) {
  return apiClient(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * Helper function for PUT requests
 * @param endpoint - API endpoint path
 * @param data - Request body data
 * @param options - Additional request options
 * @returns Promise with the API response
 */
function put(endpoint: string, data: any, options: RequestInit = {}) {
  return apiClient(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(data),
  })
}

/**
 * Helper function for DELETE requests
 * @param endpoint - API endpoint path
 * @param options - Additional request options
 * @returns Promise with the API response
 */
function del(endpoint: string, options: RequestInit = {}) {
  return apiClient(endpoint, { ...options, method: "DELETE" })
}

/**
 * Helper function to make authenticated API requests directly to the backend
 * @param url - The full API endpoint URL
 * @param options - Fetch options
 * @returns Promise with the fetch response
 */
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Get the auth token from localStorage
  const token = localStorage.getItem("authToken")

  if (!token) {
    throw new Error("Authentication token not found")
  }

  // Set up headers with authentication
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }

  // Make the request with the auth header
  return fetch(url, {
    ...options,
    headers,
  })
}

// Add this at the end of the file to ensure the api object is properly exported
const api = {
  get,
  post,
  put,
  del,
  getUrl: (path: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/finance-payment-confirmation/api/v1"
    return `${baseUrl}${path}`
  },
  getImageUrl: (path: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/finance-payment-confirmation/api/v1"
    const token = localStorage.getItem("token") || localStorage.getItem("authToken")

    // Create a full URL
    const url = `${baseUrl}${path}`

    // Return an object with the URL and headers for fetch
    return {
      url,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  },
}

export { api }

export default api
