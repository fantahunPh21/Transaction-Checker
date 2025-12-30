"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, CheckCircle, XCircle } from "lucide-react"
import { TransactionVerifier } from "@/components/transaction-verifier"
import { type VerificationResult } from "@/lib/verification"

interface VerificationIntegrationProps {
  onVerificationComplete?: (result: VerificationResult) => void
  triggerText?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function VerificationIntegration({ 
  onVerificationComplete, 
  triggerText = "Verify Transaction",
  variant = "outline",
  size = "sm",
  className 
}: Readonly<VerificationIntegrationProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const [lastResult, setLastResult] = useState<VerificationResult | null>(null)

  console.log("🔍 VerificationIntegration rendered:", {
    isOpen,
    hasLastResult: !!lastResult,
    triggerText,
    variant,
    size,
    className
  })

  // Track state changes
  useEffect(() => {
    console.log("📊 State changed - isOpen:", isOpen)
  }, [isOpen])

  const handleVerificationComplete = (result: VerificationResult) => {
    console.log("Verification completed:", result)
    setLastResult(result)
    if (onVerificationComplete) {
      onVerificationComplete(result)
    }
    // Keep dialog open to show result
  }

  const handleClose = () => {
    console.log("🔒 Closing dialog")
    setIsOpen(false)
    setLastResult(null)
  }

  const handleButtonClick = () => {
    console.log("🖱️ Button clicked! Current isOpen:", isOpen)
    console.log("🖱️ Setting isOpen to true")
    setIsOpen(true)
    console.log("🖱️ isOpen should now be true")
  }



  return (
          <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          console.log("🔄 Dialog onOpenChange called with:", open)
          console.log("🔄 Current isOpen state:", isOpen)
          console.log("🔄 Setting isOpen to:", open)
          setIsOpen(open)
          console.log("🔄 isOpen state updated")
        }}
      >
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        onClick={handleButtonClick}
      >
        <ShieldCheck className="mr-2 h-4 w-4" />
        {triggerText}
      </Button>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Transaction Verification
          </DialogTitle>
          <DialogDescription>
            Verify a transaction by entering the transaction number and selecting the bank
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <TransactionVerifier 
            onVerificationComplete={handleVerificationComplete}
          />
          
          {lastResult && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-3">
                {lastResult.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <h3 className="font-semibold">
                  {lastResult.isValid ? "Verification Successful" : "Verification Failed"}
                </h3>
              </div>
              
              {lastResult.isValid && lastResult.transactionDetails && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Transaction ID:</span>
                      <p className="font-mono">{lastResult.transactionDetails.transactionId}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Amount:</span>
                      <p>{lastResult.transactionDetails.amount}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Bank:</span>
                      <Badge variant="secondary">{lastResult.transactionDetails.bank}</Badge>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Status:</span>
                      <Badge variant="secondary">{lastResult.transactionDetails.status}</Badge>
                    </div>
                  </div>
                </div>
              )}
              
              {!lastResult.isValid && (
                <p className="text-red-600">{lastResult.error}</p>
              )}
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
