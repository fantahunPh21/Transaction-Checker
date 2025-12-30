"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { isAdmin, hasRole } from "@/lib/auth"

interface Role {
  roleId: number
  roleName: string
  description: string
  createdAt: string
  updatedAt: string
}

// Export both the hook and a compatible function with the old name for backward compatibility
export function useRolesRecord() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState(true)
  const { toast } = useToast()
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchData = async (currentPage: number, pageSize: number, keyword = "") => {
    try {
      setIsLoading(true)
      setError(null)

      // Check if user likely has permission to access roles
      const canAccessRoles = isAdmin() || hasRole("ADMIN") || hasRole("SUPER_ADMIN") || hasRole("ROLE_ADMIN")

      if (!canAccessRoles) {
        console.warn("User likely doesn't have permission to access roles")
        setHasPermission(false)
        setRoles([])
        setIsLoading(false)
        return
      }

      const response = await fetch(
        `http://localhost:8088/finance-payment-confirmation/api/v1/roles?keyword=${keyword}&pageNumber=${currentPage}&pageSize=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        },
      )

      // Handle 403 Forbidden specifically
      if (response.status === 403) {
        console.warn("Permission denied: User doesn't have access to roles")
        setHasPermission(false)
        setRoles([])
        setError("You don't have permission to access roles")
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch roles record: ${response.status}`)
      }

      const result = await response.json()
      setRoles(result.content || [])
      setTotalItems(result.totalElements || 0)
      setHasPermission(true)
      setError(null)
    } catch (err) {
      console.error("Error fetching roles record:", err)
      setError(err instanceof Error ? err.message : "Failed to load roles record")

      // Only show toast for non-permission errors
      if (hasPermission) {
        toast({
          title: "Error",
          description: "Failed to load roles record",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData(currentPage, pageSize, searchQuery)

    // Add event listener for refreshing data
    const handleRefresh = () => {
      toast({
        title: "Refreshing",
        description: "Updating roles records...",
      })
      fetchData(currentPage, pageSize, searchQuery)
    }

    window.addEventListener("refreshData", handleRefresh)

    // Clean up event listener
    return () => {
      window.removeEventListener("refreshData", handleRefresh)
    }
  }, [toast, currentPage, pageSize, searchQuery])

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    // Make sure the new page is within the valid range
    const maxPage = Math.ceil(totalItems / pageSize) - 1
    if (newPage < 0 || newPage > maxPage) {
      console.error("Invalid page number:", newPage)
      return
    }
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value))
    setCurrentPage(0) // Reset to the first page whenever page size changes
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(0) // Reset to first page when searching
  }

  return {
    roles,
    setRoles,
    totalItems,
    isLoading,
    error,
    hasPermission,
    handlePageChange,
    handlePageSizeChange,
    currentPage,
    pageSize,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    handleSearch,
    refreshData: () => fetchData(currentPage, pageSize, searchQuery),
  }
}

// For backward compatibility with existing components
export function rolesRecord() {
  const hook = useRolesRecord()
  return {
    roles: hook.roles,
    isLoading: hook.isLoading,
    error: hook.error,
  }
}
