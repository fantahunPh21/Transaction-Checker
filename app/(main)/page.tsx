"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Plus, ShieldCheck } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentRecordsTable } from "@/components/payment-records-table"
import { PendingRecordsTable } from "@/components/pending-records-table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { AddTransactionModal } from "@/components/add-transaction-modal"
import { ProtectedRoute } from "@/components/protected-route"
import { VerificationIntegration } from "@/components/verification-integration"
import { DebugDialog } from "@/components/debug-dialog"
import { ApiHealthCheck } from "@/components/api-health-check"

export default function DashboardPage() {
  const { toast } = useToast()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [stats, setStats] = useState({
    totalRecords: "...",
    pendingRecords: "...",
    confirmedThisMonth: "...",
    totalPaidAmount: "...",
  })
  const [isFinanceUser, setIsFinanceUser] = useState(false)
  const [totalRecords, setToatlRecords] = useState()

  const fetchStats = async (showToast = false) => {
    try {
      setIsRefreshing(true)
      // You can create a separate endpoint for stats or calculate them client-side
      // This is a placeholder for demonstration
      const token = localStorage.getItem("authToken")
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      const [allResponse, pendingResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/finance-payment-confirmation/api/v1/payment-records`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/finance-payment-confirmation/api/v1/payment-records/pending`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
      ])

      if (!allResponse.ok || !pendingResponse.ok) {
        throw new Error(`Stats fetch failed: all=${allResponse.status}, pending=${pendingResponse.status}`)
      }
      const allRecords = await allResponse.json()
      const pendingRecords = await pendingResponse.json()

      // Calculate stats from the data
      const total = allRecords.content.length
      const pending = pendingRecords.content.length
      console.log(pendingRecords.content.length)
      console.log(allRecords.content.length)
      console.log(stats.totalRecords)
      // const confirmed = allRecords.filter((r) => r.status === "confirmed").length

      setToatlRecords(allRecords.pageable.totalElements)

      // This month's confirmed (simplified calculation)
      const thisMonth = new Date().getMonth()
      const thisYear = new Date().getFullYear()
      const confirmedThisMonth = allRecords.content.filter((r: any) => {
        const date = new Date(r.date)
        return r.status === "confirmed" && date.getMonth() === thisMonth && date.getFullYear() === thisYear
      }).length

      const confirmedCount = allRecords.content.filter((record: any) => record.confirmationStatus === "CONFIRMED").length

      const totalAmount = allRecords.content.reduce((sum: number, record: any) => sum + record.amountPaid, 0)

      // Function to format number as K, M, B
      function formatAmount(amount: number) {
        if (amount >= 1_000_000_000) {
          return (amount / 1_000_000_000).toFixed(2) + "B"
        } else if (amount >= 1_000_000) {
          return (amount / 1_000_000).toFixed(2) + "M"
        } else if (amount >= 1_000) {
          return (amount / 1_000).toFixed(2) + "K"
        } else {
          return amount.toFixed(2)
        }
      }

      const formattedTotal = formatAmount(totalAmount)

      setStats({
        totalRecords: total.toString(),
        pendingRecords: pending.toString(),
        confirmedThisMonth: confirmedCount.toString(),
        totalPaidAmount: formattedTotal,
      })
      console.log(stats.totalRecords)
      if (showToast) {
        toast({
          title: "Data Refreshed",
          description: "Dashboard data has been updated",
        })
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      // toast({
      //   title: "Error",
      //   description: "Failed to refresh dashboard statistics",
      //   variant: "destructive",
      // })
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats(true)
  }, [])

  const handleRefresh = async () => {
    await fetchStats(true)
    toast({
      title: "Refreshing",
      description: "Refreshing all dashboard data...",
    })
    // Trigger refresh event instead of reloading the page
    const event = new CustomEvent("refreshData")
    window.dispatchEvent(event)
  }

  const refreshData = async () => {
    await fetchStats(true)
    toast({
      title: "Data Refreshed",
      description: "Dashboard data has been updated",
    })
    // Refresh tables without full page reload
    const event = new CustomEvent("refreshData")
    window.dispatchEvent(event)
  }

  return (
    <ProtectedRoute>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 w-full">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-xl font-semibold">Finance Payment Records</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button size="sm" onClick={() => setAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
            <DebugDialog />
            <VerificationIntegration 
              triggerText="Verify Transaction"
              size="sm"
              variant="default"
              onVerificationComplete={(result) => {
                if (result.isValid) {
                  toast({
                    title: "Verification Complete",
                    description: `Transaction ${result.transactionDetails?.transactionId} verified successfully`,
                  })
                }
              }}
            />
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsFinanceUser(!isFinanceUser)
                toast({
                  title: isFinanceUser ? "Normal Mode" : "Finance Mode",
                  description: isFinanceUser ? "Switched to normal user mode" : "Switched to finance user mode",
                })
              }}
            >
              {isFinanceUser ? "Switch to Normal User" : "Switch to Finance User"}
            </Button> */}
          </div>
        </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium">Total Records</span>
              <span className="text-2xl font-bold">{totalRecords}</span>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium">Pending Records</span>
              <span className="text-2xl font-bold">{stats.pendingRecords}</span>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-1">
            <span className="text-xs font-medium">Confirmed This Month</span>
            <span className="text-2xl font-bold">{stats.confirmedThisMonth}</span>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium">Total Paid Amount</span>
              <span className="text-2xl font-bold">{stats.totalPaidAmount}</span>
            </div>
          </div>
        </div>

        {/* API Health Check */}
        <div className="flex justify-center">
          <ApiHealthCheck />
        </div>
        <Tabs defaultValue="all-records" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all-records">All Records</TabsTrigger>
            <TabsTrigger value="pending-records">Pending Records</TabsTrigger>
          </TabsList>
          <TabsContent value="all-records" className="space-y-4">
            <PaymentRecordsTable />
          </TabsContent>
          <TabsContent value="pending-records" className="space-y-4">
            <PendingRecordsTable />
          </TabsContent>
        </Tabs>

        <AddTransactionModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          onSuccess={() => setTimeout(handleRefresh, 5500)}
          isFinanceUser={isFinanceUser}
        />
      </main>
    </ProtectedRoute>
  )
}
