"use client"

import { useState, useCallback } from "react"
import { type VerificationData, type VerificationResult, BANK_CONFIGS } from "@/lib/verification"
import { useToast } from "@/hooks/use-toast"

const VERIFY_ENDPOINT = "/api/v1/verification/verify"

export function useVerification() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const authHeaders = (): HeadersInit => {
    if (typeof window === "undefined") return { "Content-Type": "application/json" }
    const token = localStorage.getItem("authToken")
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  const verifyTransaction = useCallback(
    async (data: VerificationData): Promise<VerificationResult> => {
      setIsLoading(true)
      setError(null)
      setResult(null)

      try {
        const response = await fetch(VERIFY_ENDPOINT, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(data),
        })

        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.error || "Verification failed")
        }

        setResult(payload)

        if (payload.isValid) {
          toast({
            title: "Verification Successful",
            description: `Transaction ${payload.transactionDetails?.transactionId} verified successfully`,
          })
        } else {
          toast({
            title: "Verification Failed",
            description: payload.error || "Transaction could not be verified",
            variant: "destructive",
          })
        }

        return payload
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Verification failed"
        setError(errorMessage)
        toast({
          title: "Verification Error",
          description: errorMessage,
          variant: "destructive",
        })
        return {
          isValid: false,
          error: errorMessage,
        }
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  const validateInvoiceNumber = useCallback((bank: string, invoiceNumber: string) => {
    const config = BANK_CONFIGS[bank]
    if (!config) return false
    return config.pattern.test(invoiceNumber.toUpperCase())
  }, [])

  const getBankConfig = useCallback((bank: string) => {
    return BANK_CONFIGS[bank]
  }, [])

  const getAllBanks = useCallback(() => {
    return Object.values(BANK_CONFIGS)
  }, [])

  const getReceiptUrl = useCallback((bank: string, invoiceNumber: string) => {
    const config = BANK_CONFIGS[bank]
    if (!config) return ""
    const normalized = invoiceNumber.toUpperCase()
    const base = config.baseUrl.endsWith("/") ? config.baseUrl : `${config.baseUrl}/`
    return `${base}${normalized}`
  }, [])

  return {
    isLoading,
    result,
    error,
    verifyTransaction,
    clearResult,
    validateInvoiceNumber,
    getBankConfig,
    getAllBanks,
    getReceiptUrl,
  }
}
