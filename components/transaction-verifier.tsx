"use client"

import { useState } from "react"
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
  
  const { 
    isLoading, 
    result, 
    verifyTransaction, 
    clearResult, 
    validateInvoiceNumber, 
    getBankConfig, 
    getAllBanks,
    getReceiptUrl 
  } = useVerification()

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

  return (
    <div className={className}>
      <Card className="border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl shadow-blue-900/30">
        <CardHeader className="border-b border-white/15 pb-6 pt-7">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-white shadow-sm backdrop-blur-md ring-1 ring-white/25">
              <CheckCircle className="h-5 w-5" />
            </div>
            Transaction Verifier
          </CardTitle>
          <CardDescription className="text-sm text-slate-300">
            Verify transactions by entering the transaction number and selecting the bank
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-7">
          {/* Bank Selection */}
          <div className="space-y-2">
            <Label htmlFor="bank" className="text-sm font-medium text-slate-200">
              Select Bank
            </Label>
            <Select value={selectedBank} onValueChange={setSelectedBank}>
              <SelectTrigger className="h-11 border border-white/25 bg-white/10 backdrop-blur-md shadow-sm hover:border-white/40 hover:bg-white/15 focus:border-blue-300 focus:ring-2 focus:ring-blue-400/40 text-white">
                <SelectValue placeholder="Choose your bank" />
              </SelectTrigger>
              <SelectContent className="border border-white/20 bg-slate-900/90 backdrop-blur-xl shadow-2xl">
                {banks.map((bank) => {
                  const value = bank.key
                  return (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full ring-1 ring-white/30"
                          style={{ backgroundColor: bank.color }}
                        />
                        <span className="font-normal text-slate-100">{bank.name}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Invoice Number */}
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber" className="text-sm font-medium text-slate-200">
              Invoice/Transaction Number
            </Label>
            <Input
              id="invoiceNumber"
              placeholder="Enter your transaction number here"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="h-11 border border-white/25 bg-white/10 placeholder:text-white/50 text-white shadow-sm backdrop-blur-md hover:bg-white/15 focus:border-blue-300 focus:ring-2 focus:ring-blue-400/40 font-mono text-base"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-slate-200">
                Amount <span className="font-normal text-slate-400">(Optional)</span>
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter transaction amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-11 border border-white/25 bg-white/10 placeholder:text-white/50 text-white shadow-sm backdrop-blur-md hover:bg-white/15 focus:border-blue-300 focus:ring-2 focus:ring-blue-400/40"
              />
            </div>

            {/* Recipient Phone */}
            <div className="space-y-2">
              <Label htmlFor="recipientPhone" className="text-sm font-medium text-slate-200">
                Recipient Phone <span className="font-normal text-slate-400">(Optional)</span>
              </Label>
              <Input
                id="recipientPhone"
                placeholder="Enter recipient phone number"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="h-11 border border-white/25 bg-white/10 placeholder:text-white/50 text-white shadow-sm backdrop-blur-md hover:bg-white/15 focus:border-blue-300 focus:ring-2 focus:ring-blue-400/40"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-slate-200">
              Notes <span className="font-normal text-slate-400">(Optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or comments"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="border border-white/25 bg-white/10 placeholder:text-white/50 text-white shadow-sm backdrop-blur-md hover:bg-white/15 focus:border-blue-300 focus:ring-2 focus:ring-blue-400/40 resize-none"
            />
          </div>

          {/* Validation Error */}
          {validationError && (
            <Alert variant="destructive" className="border-red-400/40 bg-red-500/20 text-red-100 backdrop-blur-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              onClick={handleVerification}
              disabled={isLoading}
              className="h-12 flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-lg shadow-blue-900/40 hover:from-blue-600 hover:to-indigo-600 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying Transaction...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Verify Transaction
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={isLoading}
              className="h-12 border border-white/30 bg-white/10 px-8 font-semibold text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
            >
              Reset Form
            </Button>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`mt-8 rounded-xl border p-6 backdrop-blur-xl ${result.isValid ? "border-emerald-300/40 bg-emerald-500/15" : "border-red-300/40 bg-red-500/15"}`}>
              <div className="mb-5 flex items-center gap-3">
                {result.isValid ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20 ring-1 ring-emerald-300/40">
                    <CheckCircle className="h-5 w-5 text-emerald-300" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-400/20 ring-1 ring-red-300/40">
                    <XCircle className="h-5 w-5 text-red-300" />
                  </div>
                )}
                <h3 className={`text-lg font-bold ${result.isValid ? "text-emerald-200" : "text-red-200"}`}>
                  {result.isValid ? "Verification Successful" : "Verification Failed"}
                </h3>
              </div>

              {result.isValid && result.transactionDetails ? (
                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/15 bg-white/10 sm:grid-cols-3">
                  <div className="bg-white/5 p-4 backdrop-blur-sm">
                    <span className="text-xs font-medium text-slate-300 uppercase tracking-wide">Transaction ID</span>
                    <p className="mt-1 truncate font-mono text-sm font-semibold text-white">{result.transactionDetails.transactionId}</p>
                  </div>
                  <div className="bg-white/5 p-4 backdrop-blur-sm">
                    <span className="text-xs font-medium text-slate-300 uppercase tracking-wide">Amount</span>
                    <p className="mt-1 text-sm font-semibold text-white">{result.transactionDetails.amount}</p>
                  </div>
                  <div className="bg-white/5 p-4 backdrop-blur-sm">
                    <span className="text-xs font-medium text-slate-300 uppercase tracking-wide">Date</span>
                    <p className="mt-1 text-sm font-semibold text-white">{result.transactionDetails.date}</p>
                  </div>
                  <div className="bg-white/5 p-4 backdrop-blur-sm">
                    <span className="text-xs font-medium text-slate-300 uppercase tracking-wide">Sender</span>
                    <p className="mt-1 truncate text-sm font-semibold text-white">{result.transactionDetails.sender}</p>
                  </div>
                  <div className="bg-white/5 p-4 backdrop-blur-sm">
                    <span className="text-xs font-medium text-slate-300 uppercase tracking-wide">Recipient</span>
                    <p className="mt-1 truncate text-sm font-semibold text-white">{result.transactionDetails.recipient}</p>
                  </div>
                  <div className="bg-white/5 p-4 backdrop-blur-sm">
                    <span className="text-xs font-medium text-slate-300 uppercase tracking-wide">Status</span>
                    <div className="mt-1">
                      <Badge variant="secondary" className="bg-emerald-400/20 text-emerald-100 border-transparent">{result.transactionDetails.status}</Badge>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 backdrop-blur-sm">
                    <span className="text-xs font-medium text-slate-300 uppercase tracking-wide">Bank</span>
                    <p className="mt-1 text-sm font-semibold text-white">{result.transactionDetails.bank}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-red-300/30 bg-red-950/30 p-4 backdrop-blur-sm">
                  <p className="text-center text-sm font-medium text-red-200">{result.error}</p>
                </div>
              )}

              {invoiceNumber && (
                <div className="mt-5 border-t border-white/15 pt-4">
                  <a
                    href={getReceiptUrl(selectedBank, invoiceNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-300 hover:text-blue-200 hover:underline"
                  >
                    <CheckCircle className="h-4 w-4" />
                    View {getBankConfig(selectedBank)?.name || "bank"} receipt
                  </a>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
