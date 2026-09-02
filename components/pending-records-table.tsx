"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpDown, Eye, CheckCircle, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { RecordDetailsDialog } from "@/components/record-details-dialog"
import { usePendingRecords } from "@/hooks/use-pending-records"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import api from "@/lib/api"
import type { PaymentRecord } from "@/lib/types"

export function PendingRecordsTable() {
  const { toast } = useToast()
  const router = useRouter()
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [confirmingId, setConfirmingId] = useState<number | null>(null)

  const { pendingRecords, isLoading, error } = usePendingRecords()

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading pending records...</div>
  }

  if (error) {
    return <div className="flex justify-center p-4 text-red-500">Error loading pending records: {error}</div>
  }

  const handleViewDetails = (record: PaymentRecord) => {
    setSelectedRecord(record)
    setDetailsOpen(true)
    toast({
      title: "Record Details",
      description: `Viewing details for record #${record.paymentRecordsId}`,
    })
  }

  const handleConfirmPayment = async (paymentRecordsId: number) => {
    try {
      setConfirmingId(paymentRecordsId)
      toast({
        title: "Processing",
        description: "Confirming payment record...",
      })

      // Use the centralized API client
      await api.put(`payment-records/${paymentRecordsId}/confirm`, {})

      toast({
        title: "Success",
        description: "Payment record has been confirmed successfully",
        variant: "default",
      })

      const event = new CustomEvent("refreshData")
      window.dispatchEvent(event)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm payment",
        variant: "destructive",
      })
    } finally {
      setConfirmingId(null)
    }
  }

  // Fix for the length error - ensure pendingRecords is an array before checking length
  const hasRecords = Array.isArray(pendingRecords) && pendingRecords.length > 0

  const formatDate = (dateString: string) => {
    try {
      // Try to parse the date string
      const date = new Date(dateString)
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return new Date().toLocaleDateString("en-CA") // Fallback to current date
      }
      return date.toLocaleDateString("en-CA")
    } catch (error) {
      console.error("Error formatting date:", error)
      return new Date().toLocaleDateString("en-CA") // Fallback to current date
    }
  }

  return (
    <>
      <div className="rounded-md border w-full">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Debit Account</TableHead>
              <TableHead>Credit Account</TableHead>
              <TableHead>Transaction Reference</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Amount
                  <Button size="icon" variant="ghost" className="h-4 w-4">
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Transaction Date
                  <Button size="icon" variant="ghost" className="h-4 w-4">
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </div>
              </TableHead>
              <TableHead>Sales Person</TableHead>
              <TableHead>Request Status</TableHead>
              <TableHead>Confirmation Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!hasRecords ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                  No pending records found
                </TableCell>
              </TableRow>
            ) : (
              pendingRecords.map((record) => (
                <TableRow key={record.paymentRecordsId}>
                  <TableCell className="font-medium">{record.paymentRecordsId}</TableCell>
                  <TableCell>{record.customerName}</TableCell>
                  <TableCell>{record.companyName}</TableCell>
                  <TableCell>{record.debitAccountNo}</TableCell>
                  <TableCell>{record.creditAccountNo}</TableCell>
                  <TableCell>{record.referenceId}</TableCell>
                  <TableCell>Br.{Number(record.amountPaid).toFixed(2)}</TableCell>
                  <TableCell>{record.transactionDate ? formatDate(record.transactionDate) : "-"}</TableCell>
                  <TableCell>{record.salesPerson}</TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        record.requestStatus?.toLowerCase() === "completed"
                          ? "bg-green-100 text-green-800"
                          : record.requestStatus?.toLowerCase() === "requested"
                            ? "bg-yellow-100 text-yellow-800"
                            : record.requestStatus?.toLowerCase() === "duplicate"
                              ? "bg-red-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {record.requestStatus?.toUpperCase() || "UNKNOWN"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        record.confirmationStatus != null && record.confirmationStatus.toLowerCase() === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {record.confirmationStatus != null ? record.confirmationStatus.toUpperCase() : "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(record)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {record.requestStatus === "pending" && (
                          <DropdownMenuItem onClick={() => handleConfirmPayment(record.paymentRecordsId)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm Payment
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{pendingRecords?.length || 0}</span> pending records
          </p>
        </div>
      </div>

      {selectedRecord && (
        <RecordDetailsDialog
          record={selectedRecord}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onConfirm={() => {
            handleConfirmPayment(selectedRecord.paymentRecordsId)
            setDetailsOpen(false)
          }}
        />
      )}
    </>
  )
}
