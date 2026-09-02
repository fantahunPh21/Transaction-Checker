"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"

export function usePendingRecords() {
  const [pendingRecords, setPendingRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Use the centralized API client
        const result = await api.get("payment-records/pending")

        // Set the records from the content array
        setPendingRecords(result.content)
      } catch (err) {
        console.error("Error fetching pending payment records:", err)
        setError(err.message)
        toast({
          title: "Error",
          description: "Failed to load pending payment records",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Add event listener for refreshing data
    const handleRefresh = () => {
      toast({
        title: "Refreshing",
        description: "Updating pending payment records...",
      })
      fetchData()
    }

    window.addEventListener("refreshData", handleRefresh)

    // Clean up event listener
    return () => {
      window.removeEventListener("refreshData", handleRefresh)
    }
  }, [toast])

  return { pendingRecords, isLoading, error }
}
