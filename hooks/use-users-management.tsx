"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

export function useUsersManagement() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const fetchUsers = async (keyword = "") => {
    try {
      setIsLoading(true)
      const response = await api.get(`/api/v1/users?keyword=${keyword}`)

      if (response.status === 200 && response.data.content) {
        setUsers(response.data.content)
      } else {
        throw new Error("Failed to fetch users")
      }
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSearch = () => {
    fetchUsers(searchQuery)
  }

  const createUser = async (userData) => {
    try {
      const response = await api.post("/api/v1/users", userData)

      if (response.status === 200 || response.status === 201) {
        await fetchUsers(searchQuery) // Refresh the list
        return response.data
      } else {
        throw new Error("Failed to create user")
      }
    } catch (err) {
      console.error("Error creating user:", err)
      throw err
    }
  }

  const updateUser = async (userData) => {
    try {
      const response = await api.put("/api/v1/users", userData)

      if (response.status === 200) {
        await fetchUsers(searchQuery) // Refresh the list
        return response.data
      } else {
        throw new Error("Failed to update user")
      }
    } catch (err) {
      console.error("Error updating user:", err)
      throw err
    }
  }

  const deleteUser = async (userId) => {
    try {
      const response = await api.delete(`/api/v1/users/${userId}`)

      if (response.status === 200) {
        await fetchUsers(searchQuery) // Refresh the list
        return response.data
      } else {
        throw new Error("Failed to delete user")
      }
    } catch (err) {
      console.error("Error deleting user:", err)
      throw err
    }
  }

  const assignRole = async (userId, roleId) => {
    try {
      const response = await api.put(`/api/v1/users/${userId}/role/${roleId}`)

      if (response.status === 200) {
        await fetchUsers(searchQuery) // Refresh the list
        return response.data
      } else {
        throw new Error("Failed to assign role")
      }
    } catch (err) {
      console.error("Error assigning role:", err)
      throw err
    }
  }

  const removeRole = async (userId) => {
    try {
      const response = await api.delete(`/api/v1/users/${userId}/role`)

      if (response.status === 200) {
        await fetchUsers(searchQuery) // Refresh the list
        return response.data
      } else {
        throw new Error("Failed to remove role")
      }
    } catch (err) {
      console.error("Error removing role:", err)
      throw err
    }
  }

  const getUserById = async (userId) => {
    try {
      const response = await api.get(`/api/v1/users/${userId}`)

      if (response.status === 200) {
        return response.data.content
      } else {
        throw new Error("Failed to get user")
      }
    } catch (err) {
      console.error("Error getting user:", err)
      throw err
    }
  }

  return {
    users,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    handleSearch,
    createUser,
    updateUser,
    deleteUser,
    assignRole,
    removeRole,
    getUserById,
    refreshUsers: () => fetchUsers(searchQuery),
  }
}
