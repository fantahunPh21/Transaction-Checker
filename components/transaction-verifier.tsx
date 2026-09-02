"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { type VerificationResult } from "@/lib/verification"
import { useVerification } from "@/hooks/use-verification"

interface TransactionVerifierProps {
  onVerificationComplete?: (result: VerificationResult) => void
  className?: string
}

export function TransactionVerifier({ onVerificationComplete, className }: TransactionVerifierProps) {
  const [selectedBank, setSelectedBank] = useState("telebirr")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [recipientPhone, setRecipientPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [validationError, setValidationError] = useState("")
  const [mounted, setMounted] = useState(false)
  
  const { 
    isLoading, 
    result, 
    verifyTransaction, 
    clearResult, 
    validateInvoiceNumber, 
    getBankConfig, 
    getAllBanks 
  } = useVerification()

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const banks = getAllBanks()

  const validateForm = () => {
    setValidationError("")
    
    if (!invoiceNumber.trim()) {
      setValidationError("Please enter an invoice number")
      return false
    }

    const config = getBankConfig(selectedBank)
    if (!config) {
      setValidationError("Invalid bank selection")
      return false
    }

    if (!validateInvoiceNumber(selectedBank, invoiceNumber.toUpperCase())) {
      setValidationError(`Invalid invoice number format for ${config.name}`)
      return false
    }

    return true
  }

  const handleVerification = async () => {
    if (!validateForm()) return

    try {
      const verificationData = {
        bank: selectedBank,
        invoiceNumber: invoiceNumber.toUpperCase(),
        amount: amount || undefined,
        recipientPhone: recipientPhone || undefined,
        notes: notes || undefined,
      }

      const result = await verifyTransaction(verificationData)
      
      if (result.isValid && onVerificationComplete) {
        onVerificationComplete(result)
      }
    } catch (error) {
      console.error("Verification failed:", error)
    }
  }

  const resetForm = () => {
    setInvoiceNumber("")
    setAmount("")
    setRecipientPhone("")
    setNotes("")
    clearResult()
    setValidationError("")
  }

  const getBankColor = (bankKey: string) => {
    const config = getBankConfig(bankKey)
    return config?.color || "#6B7280"
  }

  // Show loading state during hydration to prevent mismatch
  if (!mounted) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Transaction Verifier
            </CardTitle>
            <CardDescription>
              Verify transactions by entering the transaction number and selecting the bank
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={className}>
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50 to-indigo-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10" />
        <CardHeader className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white pb-8">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              Transaction Verifier
            </CardTitle>
            <CardDescription className="text-blue-100 text-base mt-2">
              Verify transactions by entering the transaction number and selecting the bank
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bank Selection */}
          <div className="space-y-3">
            <Label htmlFor="bank" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              Select Bank
            </Label>
            <Select value={selectedBank} onValueChange={setSelectedBank}>
              <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors duration-200 bg-white shadow-sm">
                <SelectValue placeholder="Choose your bank" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-gray-200 shadow-xl">
                {banks.map((bank) => (
                  <SelectItem key={bank.name.toLowerCase().replace(/\s+/g, '-')} value={bank.name.toLowerCase().replace(/\s+/g, '-')}>
                    <div className="flex items-center gap-3 py-1">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm" 
                        style={{ backgroundColor: bank.color }}
                      />
                      <span className="font-medium">{bank.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Invoice Number */}
          <div className="space-y-3">
            <Label htmlFor="invoiceNumber" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Invoice/Transaction Number
            </Label>
            <Input
              id="invoiceNumber"
              placeholder="Enter your transaction number here"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="h-12 border-2 border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors duration-200 bg-white shadow-sm font-mono text-lg"
            />
          </div>

          {/* Amount */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              Amount (Optional)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter transaction amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-colors duration-200 bg-white shadow-sm"
            />
          </div>

          {/* Recipient Phone */}
          <div className="space-y-3">
            <Label htmlFor="recipientPhone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              Recipient Phone (Optional)
            </Label>
            <Input
              id="recipientPhone"
              placeholder="Enter recipient phone number"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              className="h-12 border-2 border-gray-200 hover:border-orange-300 focus:border-orange-500 transition-colors duration-200 bg-white shadow-sm"
            />
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full" />
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or comments"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="border-2 border-gray-200 hover:border-teal-300 focus:border-teal-500 transition-colors duration-200 bg-white shadow-sm resize-none"
            />
          </div>

          {/* Validation Error */}
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button 
              onClick={handleVerification} 
              disabled={isLoading}
              className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Verifying Transaction...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-3 h-5 w-5" />
                  Verify Transaction
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={resetForm}
              disabled={isLoading}
              className="h-14 px-8 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-semibold transition-all duration-200"
            >
              Reset Form
            </Button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="mt-8 p-6 border-2 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                {result.isValid ? (
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                ) : (
                  <div className="p-3 bg-red-100 rounded-full">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-800">
                  {result.isValid ? "Verification Successful! 🎉" : "Verification Failed ❌"}
                </h3>
              </div>

              {result.isValid && result.transactionDetails ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Transaction ID</span>
                      <p className="font-mono text-lg font-bold text-blue-900 mt-1">{result.transactionDetails.transactionId}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Amount</span>
                      <p className="text-lg font-bold text-green-900 mt-1">{result.transactionDetails.amount}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Date</span>
                      <p className="text-lg font-bold text-purple-900 mt-1">{result.transactionDetails.date}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Recipient</span>
                      <p className="text-lg font-bold text-orange-900 mt-1">{result.transactionDetails.recipient}</p>
                    </div>
                    <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
                      <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Status</span>
                      <Badge variant="secondary" className="mt-1 bg-teal-100 text-teal-800 border-teal-300">{result.transactionDetails.status}</Badge>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                      <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Bank</span>
                      <p className="text-lg font-bold text-indigo-900 mt-1">{result.transactionDetails.bank}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <p className="text-red-700 font-medium text-center">{result.error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
