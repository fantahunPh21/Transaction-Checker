"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"

// Define user and token types to match the backend response
interface User {
  uuid: string
  username: string
  fullName: string
  role: string[]
  avatarUrl: string | null
  companyId: number
  testMode: boolean
  isAdmin: boolean
}

interface DecodedToken {
  r: string // role
  h: string // hash
  sub: string // subject (username)
  iat: number // issued at
  exp: number // expiration
}

// Define the auth context type
interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  checkTokenExpiration: () => boolean
  isAuthenticated: boolean
  hasRole: (roles: string | string[]) => boolean
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Auth provider component that manages authentication state
 * @param children - Child components that will have access to auth context
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user from token on initial render
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken")
    const storedUser = localStorage.getItem("authUser")

    if (storedToken && storedUser) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken)

        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("authToken")
          localStorage.removeItem("authUser")
          setToken(null)
          setUser(null)
        } else {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Invalid token:", error)
        localStorage.removeItem("authToken")
        localStorage.removeItem("authUser")
      }
    }
    setIsLoading(false)
  }, [])

  // Also add a function to check if the token is valid
  // Add this function:

  const isTokenValid = () => {
    const token = localStorage.getItem("authToken")
    if (!token) return false

    // You can add additional token validation here if needed
    // For example, check if the token is expired by decoding it

    return true
  }

  // Update the AuthProvider to check token validity on mount
  // Add this useEffect:
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      if (isTokenValid()) {
        // Try to fetch user data to verify the token is still valid with the server
        try {
          // Use the api client to make an authenticated request
          // const userData = await api.get('/users/me'); // Adjust endpoint as needed
          // setUser(userData);
          setIsAuthenticated(true)
        } catch (error) {
          // If the request fails, the token might be invalid or expired
          localStorage.removeItem("authToken")
          localStorage.removeItem("authUser")
          setUser(null)
          setIsAuthenticated(false)
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Update the login function to match the backend's response format
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Use the correct API endpoint and request format
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088/finance-payment-confirmation/api/v1/"}auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: email, password }),
        },
      )

      const data = await response.json()

      if (!response.ok || data.status !== 200) {
        console.error("Login failed:", data)
        setIsLoading(false)
        return false
      }

      // Extract data from the response based on the structure you provided
      const responseData = data.content

      // Get the token from the response
      const authToken = responseData.token

      // Store token in localStorage
      localStorage.setItem("authToken", authToken)
      // Also set in cookie for server components
      setAuthCookie(authToken)

      // Store user data exactly as received from the backend
      const userData = {
        uuid: responseData.uuid,
        username: responseData.username,
        fullName: responseData.fullName,
        role: responseData.role,
        avatarUrl: responseData.avatarUrl,
        companyId: responseData.companyId,
        testMode: responseData.testMode,
        isAdmin: responseData.isAdmin,
      }

      localStorage.setItem("authUser", JSON.stringify(userData))

      // Update state
      setToken(authToken)
      setUser(userData)
      setIsLoading(false)

      console.log("Login successful, token stored:", authToken.substring(0, 20) + "...")
      return true
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return false
    }
  }

  // Set auth token in cookie for server components
  const setAuthCookie = (token: string) => {
    // Set cookie with HttpOnly and Secure flags
    document.cookie = `authToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`
  }

  /**
   * Logout function that clears auth state
   */
  const logout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("authUser")
    // Clear the cookie
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    setToken(null)
    setUser(null)
    router.push("/sign-in")
  }

  // Update the checkTokenExpiration function to use the correct token key
  const checkTokenExpiration = () => {
    const storedToken = localStorage.getItem("authToken")
    if (!storedToken) return false

    try {
      const decoded = jwtDecode<DecodedToken>(storedToken)

      // If token is expired, logout and redirect
      if (decoded.exp * 1000 < Date.now()) {
        logout()
        return false
      }
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  /**
   * Check if user is authenticated
   * @returns Boolean indicating if user is authenticated
   */
  const isAuthenticatedFunc = () => {
    return !!user && checkTokenExpiration()
  }

  /**
   * @param roles - Single role string or array of role strings
   * @returns Boolean indicating if user has any of the specified roles
   */
  const hasRole = (roles: string | string[]) => {
    if (!user || !user.role) return false

    const rolesToCheck = Array.isArray(roles) ? roles : [roles]

    // Check if any of the user's roles match any of the required roles
    return user.role.some((userRole) => rolesToCheck.includes(userRole))
  }

  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading,
        checkTokenExpiration,
        isAuthenticated: isAuthenticated ? isAuthenticated : isAuthenticatedFunc(),
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to use the auth context
 * @returns Auth context with user, token, and auth functions
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
