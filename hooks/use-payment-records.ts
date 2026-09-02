"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import type { PaymentRecord } from "@/lib/types"

export function usePaymentRecords(initialPage = 0, pageSize = 10) {
  const [records, setRecords] = useState<PaymentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 0,
    totalElements: 0,
    pageSize: pageSize,
  })
  const { toast } = useToast()

  // Update the fetchData function to directly use fetch with auth headers
  const fetchData = async (page = 0, size = pageSize) => {
    try {
      setIsLoading(true)

      // Get the auth token from localStorage
      const token = localStorage.getItem("authToken")

      if (!token) {
        throw new Error("Authentication token not found")
      }

      // Make a direct request to the backend with the auth token
      const response = await fetch(
        `http://localhost:8088/finance-payment-confirmation/api/v1/payment-records?pageNumber=${page}&pageSize=${size}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch payment records: ${response.status}`)
      }

      const result = await response.json()

      // Set the records from the content array
      setRecords(result.content ?? [])

      // Update pagination state with data from the API
      setPagination({
        currentPage: page,
        totalPages: result.pageable.totalPages,
        totalElements: result.pageable.totalElements,
        pageSize: size,
      })
    } catch (err) {
      console.error("Error fetching payment records:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch payment records")
      toast({
        title: "Error",
        description: "Failed to load payment records",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to change the page
  const goToPage = (page: number) => {
    if (page >= 0 && page < pagination.totalPages) {
      fetchData(page, pagination.pageSize)
    }
  }

  // Function to change the page size
  const changePageSize = (newSize: number) => {
    fetchData(0, newSize) // Reset to first page when changing page size
  }

  // Function to refresh the current page
  const refreshRecords = () => {
    fetchData(pagination.currentPage, pagination.pageSize)
  }

  useEffect(() => {
    // Initial data fetch
    fetchData(initialPage, pageSize)

    // Add event listener for refreshing data
    const handleRefresh = () => {
      toast({
        title: "Refreshing",
        description: "Updating payment records...",
      })
      refreshRecords()
    }

    window.addEventListener("refreshData", handleRefresh)

    // Clean up event listener
    return () => {
      window.removeEventListener("refreshData", handleRefresh)
    }
  }, [toast, initialPage, pageSize])

  return {
    records,
    isLoading,
    error,
    pagination,
    goToPage,
    changePageSize,
    refreshRecords,
  }
}
