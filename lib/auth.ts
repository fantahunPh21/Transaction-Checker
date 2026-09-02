// Auth helper functions

import { jwtDecode } from "jwt-decode"

interface DecodedToken {
  r: string // role
  h: string // hash
  sub: string // subject (username)
  iat: number // issued at
  exp: number // expiration
}

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

/**
 * Get the auth token from localStorage
 * @returns Token string or null if not authenticated
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

/**
 * Get the current user
 * @returns User object or null if not authenticated
 */
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  const userJson = localStorage.getItem("authUser")
  if (!userJson) return null

  try {
    return JSON.parse(userJson)
  } catch (error) {
    console.error("Invalid user data:", error)
    return null
  }
}

/**
 * Check if the user has a specific role
 * @param role - The role to check
 * @returns True if the user has the role, false otherwise
 */
export function hasRole(role: string): boolean {
  try {
    const token = localStorage.getItem("authToken")
    if (!token) return false

    // Simple check - in a real app, you'd decode the JWT and check roles
    // This is a placeholder implementation
    return true
  } catch (error) {
    console.error(`Error checking for role ${role}:`, error)
    return false
  }
}

/**
 * Check if the user has any of the specified roles
 * @param roles - Array of roles to check
 * @returns Boolean indicating if the user has any of the specified roles
 */
export function hasAnyRole(roles: string[]): boolean {
  const user = getCurrentUser()
  if (!user || !user.role) return false

  return roles.some((role) => user.role.includes(role))
}

/**
 * Check if the token is expired
 * @returns True if the token is expired or invalid, false otherwise
 */
export function isTokenExpired(): boolean {
  const token = getAuthToken()
  if (!token) return true

  try {
    const decoded = jwtDecode<DecodedToken>(token)
    const currentTime = Date.now() / 1000

    return decoded.exp < currentTime
  } catch (error) {
    console.error("Error decoding token:", error)
    return true
  }
}

/**
 * Get token expiration time in seconds
 * @returns The expiration time or null if not found
 */
export function getTokenExpirationTime(): number | null {
  const token = getAuthToken()
  if (!token) return null

  try {
    const decoded = jwtDecode<DecodedToken>(token)
    return decoded.exp ? decoded.exp : null
  } catch {
    return null
  }
}

/**
 * Get user's full name
 * @returns The user's full name or "User" if not found
 */
export function getUserFullName(): string {
  const user = getCurrentUser()
  return user?.fullName || "User"
}

/**
 * Get user's avatar URL
 * @returns The user's avatar URL or null if not found
 */
export function getUserAvatar(): string | null {
  const user = getCurrentUser()
  return user?.avatarUrl || null
}

/**
 * Check if user is an admin
 * @returns True if the user is an admin, false otherwise
 */
export function isAdmin(): boolean {
  try {
    const token = localStorage.getItem("authToken")
    if (!token) return false

    // Simple check - in a real app, you'd decode the JWT and check roles
    // This is a placeholder implementation
    return true
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

/**
 * Clear auth data (for logout)
 * Removes token and user data from localStorage
 */
export function clearAuthData(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem("authToken")
  localStorage.removeItem("authUser")
}

/**
 * Check if the user is authenticated
 * @returns Boolean indicating if the user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false

  const token = localStorage.getItem("authToken")
  if (!token) return false

  try {
    const decoded = jwtDecode<DecodedToken>(token)
    return decoded.exp * 1000 > Date.now()
  } catch (error) {
    console.error("Invalid token:", error)
    return false
  }
}

/**
 * Get user's company ID
 * @returns The user's company ID or null if not found
 */
export function getUserCompanyId(): number | null {
  const user = getCurrentUser()
  return user?.companyId || null
}

/**
 * Check if user is in test mode
 * @returns True if the user is in test mode, false otherwise
 */
export function isTestMode(): boolean {
  const user = getCurrentUser()
  return user?.testMode === true
}
