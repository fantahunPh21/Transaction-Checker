"use client"

import { TransactionVerifier } from "@/components/transaction-verifier"
import { ClientOnly } from "@/components/client-only"

export default function VerificationPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl text-white">
        <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold">Transaction Verification</h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
          Verify transactions by entering transaction numbers and selecting banks. 
          Get instant verification results with our secure system.
        </p>
      </div>
      
      <div className="grid gap-8">
        <ClientOnly fallback={
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          </div>
        }>
          <TransactionVerifier 
            onVerificationComplete={(result) => {
              // You can handle verification completion here
              // For example, automatically create a payment record
              console.log("Verification completed:", result)
            }}
          />
        </ClientOnly>
      </div>
    </div>
  )
}
