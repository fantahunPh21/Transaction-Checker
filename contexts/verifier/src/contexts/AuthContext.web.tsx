"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => Promise<void>
  updateProfile: (userData: Partial<User>) => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Web-compatible storage functions
const getItemAsync = async (key: string): Promise<string | null> => {
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.error("Error getting item from localStorage:", error)
    return null
  }
}

const setItemAsync = async (key: string, value: string): Promise<void> => {
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    console.error("Error setting item in localStorage:", error)
  }
}

const deleteItemAsync = async (key: string): Promise<void> => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error("Error deleting item from localStorage:", error)
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const token = await getItemAsync("authToken")
      const userData = await AsyncStorage.getItem("userData")

      if (token && userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error("Auth check error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Simulate API call
      const response = await fetch("https://your-api.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()

        await setItemAsync("authToken", data.token)
        await AsyncStorage.setItem("userData", JSON.stringify(data.user))

        setUser(data.user)
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true)

      const response = await fetch("https://your-api.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        const data = await response.json()

        await setItemAsync("authToken", data.token)
        await AsyncStorage.setItem("userData", JSON.stringify(data.user))

        setUser(data.user)
        return true
      }

      return false
    } catch (error) {
      console.error("Register error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await deleteItemAsync("authToken")
      await AsyncStorage.removeItem("userData")
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      if (user) {
        const updatedUser = { ...user, ...userData }
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser))
        setUser(updatedUser)
      }
    } catch (error) {
      console.error("Update profile error:", error)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 