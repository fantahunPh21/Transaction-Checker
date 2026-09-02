"use client"

import { useState, useCallback, useEffect } from "react"
import { verificationService, type VerificationData, type VerificationResult } from "@/lib/verification"
import { useToast } from "@/hooks/use-toast"

export function useVerification() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  // Prevent server-side execution
  useEffect(() => {
    setMounted(true)
  }, [])

  const verifyTransaction = useCallback(async (data: VerificationData) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const result = await verificationService.verifyTransaction(data)
      setResult(result)

      if (result.isValid) {
        toast({
          title: "Verification Successful",
          description: `Transaction ${result.transactionDetails?.transactionId} verified successfully`,
        })
      } else {
        toast({
          title: "Verification Failed",
          description: result.error || "Transaction could not be verified",
          variant: "destructive",
        })
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Verification failed"
      setError(errorMessage)
      toast({
        title: "Verification Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  const validateInvoiceNumber = useCallback((bank: string, invoiceNumber: string) => {
    return verificationService.validateInvoiceNumber(bank, invoiceNumber)
  }, [])

  const getBankConfig = useCallback((bank: string) => {
    return verificationService.getBankConfig(bank)
  }, [])

  const getAllBanks = useCallback(() => {
    return verificationService.getAllBanks()
  }, [])

  // Return safe values during SSR
  if (!mounted) {
    return {
      isLoading: false,
      result: null,
      error: null,
      verifyTransaction: async () => { throw new Error("Hook not mounted") },
      clearResult: () => {},
      validateInvoiceNumber: () => false,
      getBankConfig: () => undefined,
      getAllBanks: () => [],
    }
  }

  return {
    isLoading,
    result,
    error,
    verifyTransaction,
    clearResult,
    validateInvoiceNumber,
    getBankConfig,
    getAllBanks,
  }
}
