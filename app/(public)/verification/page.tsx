"use client"

import { TransactionVerifier } from "@/components/transaction-verifier"
import { ClientOnly } from "@/components/client-only"

export default function VerificationPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-600/40 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-purple-600/40 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-emerald-500/30 blur-3xl" />
        <div className="absolute top-1/4 left-1/2 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
      </div>

      <div className="relative space-y-8 py-10">
        <div className="text-center space-y-4 px-4 pt-8 pb-6">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-md shadow-lg shadow-blue-500/10">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300">
            Transaction Verification
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Verify transactions by entering transaction numbers and selecting banks. 
            Get instant verification results with our secure system.
          </p>
        </div>
        
        <div className="mx-auto max-w-2xl px-4">
          <ClientOnly fallback={
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
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
    </div>
  )
}
