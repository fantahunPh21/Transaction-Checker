"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpDown, MoreHorizontal, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { RecordDetailsDialog } from "@/components/record-details-dialog"
import { usePaymentRecords } from "@/hooks/use-payment-records"

export function PaymentRecordsTable() {
  const { toast } = useToast()
  const router = useRouter()
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [confirmingId, setConfirmingId] = useState(null)

  const { records, isLoading, error, pagination, goToPage, changePageSize, refreshRecords } = usePaymentRecords()

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading payment records...</div>
  }

  if (error) {
    return <div className="flex justify-center p-4 text-red-500">Error loading payment records: {error}</div>
  }

  const handleViewDetails = (record) => {
    setSelectedRecord(record)
    setDetailsOpen(true)
    toast({
      title: "Record Details",
      description: `Viewing details for record #${record.paymentRecordsId}`,
    })
  }

  const handleConfirmPayment = async (paymentRecordsId) => {
    try {
      setConfirmingId(paymentRecordsId)
      toast({
        title: "Processing",
        description: "Confirming payment record...",
      })

      const response = await fetch(`/api/v1/payment-records/${paymentRecordsId}/confirm`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to confirm payment")
      }

      const result = await response.json()

      toast({
        title: "Success",
        description: "Payment record has been confirmed successfully",
        variant: "default",
      })

      refreshRecords()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm payment",
        variant: "destructive",
      })
    } finally {
      setConfirmingId(null)
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
            {!records || records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                  No payment records found
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.paymentRecordsId}>
                  <TableCell className="font-medium">{record.paymentRecordsId}</TableCell>
                  <TableCell>{record.customerName}</TableCell>
                  <TableCell>{record.companyName}</TableCell>
                  <TableCell>{record.debitAccountNo}</TableCell>
                  <TableCell>{record.creditAccountNo}</TableCell>
                  <TableCell>{record.referenceId}</TableCell>
                  <TableCell>Br.{Number.parseFloat(record.amountPaid).toFixed(2)}</TableCell>
                  <TableCell>{new Date("04.07.2025").toLocaleDateString("en-CA")}</TableCell>
                  <TableCell>{record.salesPerson}</TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        record.requestStatus.toLowerCase() === "completed"
                          ? "bg-green-100 text-green-800"
                          : record.requestStatus.toLowerCase() === "requested"
                            ? "bg-yellow-100 text-yellow-800"
                            : record.requestStatus.toLowerCase() == "duplicate"
                              ? "bg-red-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {record.requestStatus.toUpperCase()}
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
                          <DropdownMenuItem
                            onClick={() => handleConfirmPayment(record.paymentRecordsId)}
                            disabled={confirmingId === record.paymentRecordsId}
                          >
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
            Showing <span className="font-medium">{records?.length || 0}</span> of{" "}
            <span className="font-medium">{pagination?.totalElements || 0}</span> records
          </p>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">Rows per page</p>
            <Select
              value={pagination?.pageSize?.toString() || "10"}
              onValueChange={(value) => changePageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pagination?.pageSize || 10} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage((pagination?.currentPage || 0) - 1)}
            disabled={(pagination?.currentPage || 0) === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>
          <div className="flex items-center justify-center text-sm font-medium">
            Page {(pagination?.currentPage || 0) + 1} of {pagination?.totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage((pagination?.currentPage || 0) + 1)}
            disabled={(pagination?.currentPage || 0) === (pagination?.totalPages || 1) - 1}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>

      {selectedRecord && (
        <RecordDetailsDialog
          record={selectedRecord}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onConfirm={() => {
            handleConfirmPayment(selectedRecord.id)
            setDetailsOpen(false)
          }}
        />
      )}
    </>
  )
}
