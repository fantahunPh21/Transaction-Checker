"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Company } from "@/lib/types"

export function companiesRecord() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [totalItems, setTotalItems] = useState(0) // Total items for pagination
  const [currentPage, setCurrentPage] = useState(0) // Track current page
  const [pageSize, setPageSize] = useState(10) // Define the page size
  const [searchQuery, setSearchQuery] = useState("")

  const fetchData = async (currentPage: number, pageSize: number, keyword = "") => {
    try {
      setIsLoading(true)

      // Get the auth token from localStorage
      const token = localStorage.getItem("authToken")

      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(
        `http://localhost:8088/finance-payment-confirmation/api/v1/companies?keyword=${keyword}&pageNumber=${currentPage}&pageSize=${pageSize}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch companies record: ${response.status}`)
      }

      const result = await response.json()
      console.log(result.content)
      setCompanies(result.content) // store the array
      setTotalItems(result.pageable.totalElements)
    } catch (err) {
      console.error("Error fetching companies record:", err)
      //setError(err.message)
      toast({
        title: "Error",
        description: "Failed to load companies record",
        variant: "destructive",
      })
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
        description: "Updating companies records...",
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
    setCurrentPage(currentPage) // Reset to the first page whenever page size changes
  }

  return {
    companies,
    setCompanies,
    totalItems,
    isLoading,
    error,
    handlePageChange,
    handlePageSizeChange,
    currentPage,
    pageSize,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
  }
}
