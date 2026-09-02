"use client"

import { useState } from "react"
import { ArrowUpDown, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePaymentRecords } from "@/hooks/use-payment-records"
import { RecordDetailsDialog } from "@/components/record-details-dialog"
import { AddTransactionModal } from "@/components/add-transaction-modal"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import api from "@/lib/api"
import type { PaymentRecord } from "@/lib/types"

export function PaymentRecordsTable() {
  const { toast } = useToast()
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [recordToEdit, setRecordToEdit] = useState<PaymentRecord | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)

  // Use the custom hook with pagination
  const { records, isLoading, error, pagination, goToPage, changePageSize, refreshRecords } = usePaymentRecords()

  const handleViewDetails = (record: PaymentRecord) => {
    setSelectedRecord(record)
    setDetailsOpen(true)
    toast({
      title: "Record Details",
      description: `Viewing details for record #${record.paymentRecordsId}`,
    })
  }

  const handleEditRecord = (record: PaymentRecord) => {
    setRecordToEdit(record)
    setEditModalOpen(true)
    toast({
      title: "Edit Record",
      description: `Editing record #${record.paymentRecordsId}`,
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

      // Refresh the records after confirmation
      refreshRecords()
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

  const handleAddSuccess = () => {
    refreshRecords()
    setRecordToEdit(null)
  }

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading payment records...</div>
  }

  if (error) {
    return <div className="flex justify-center p-4 text-red-500">Error loading payment records: {error}</div>
  }

  // If no records or empty array
  if (!records || records.length === 0) {
    return <div className="flex justify-center p-4">No payment records found</div>
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
              <TableHead>Confirmation Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              // Get the first payment record line (or default to empty object if not available)
              const paymentLine =
                record.paymentRecordLine && record.paymentRecordLine.length > 0 ? record.paymentRecordLine[0] : {}

              return (
                <TableRow key={record.paymentRecordsId}>
                  <TableCell className="font-medium">{record.paymentRecordsId}</TableCell>
                  <TableCell>{record.customerName}</TableCell>
                  <TableCell>{paymentLine.companyName || "-"}</TableCell>
                  <TableCell>{paymentLine.debitAccountNo || "-"}</TableCell>
                  <TableCell>{paymentLine.creditAccountNo || "-"}</TableCell>
                  <TableCell>{paymentLine.referenceId || "-"}</TableCell>
                  <TableCell>Br.{Number(record.amountPaid).toFixed(2)}</TableCell>
                  <TableCell>{new Date(record.createdDate || "04.07.2025").toLocaleDateString("en-CA")}</TableCell>
                  <TableCell>{record.salesPerson}</TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        record.confirmationStatus?.toLowerCase() === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : record.confirmationStatus?.toLowerCase() === "requested"
                            ? "bg-yellow-100 text-yellow-800"
                            : paymentLine.status?.toLowerCase() === "pending"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {record.confirmationStatus ? record.confirmationStatus : paymentLine.status || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(record)}>View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditRecord(record)}>Edit</DropdownMenuItem>
                        {(paymentLine.status?.toLowerCase() === "pending" ||
                          record.confirmationStatus?.toLowerCase() === "requested") && (
                          <DropdownMenuItem
                            onClick={() => handleConfirmPayment(record.paymentRecordsId)}
                            disabled={confirmingId === record.paymentRecordsId}
                          >
                            {confirmingId === record.paymentRecordsId ? "Processing..." : "Confirm"}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{records.length}</span> of{" "}
            <span className="font-medium">{pagination.totalElements}</span> records
          </p>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">Rows per page</p>
            <Select value={pagination.pageSize.toString()} onValueChange={(value) => changePageSize(Number(value))}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pagination.pageSize} />
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
            onClick={() => goToPage(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>
          <div className="flex items-center justify-center text-sm font-medium">
            Page {pagination.currentPage + 1} of {pagination.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>

      {/* Record Details Dialog */}
      {selectedRecord && (
        <RecordDetailsDialog
          record={selectedRecord}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onConfirm={() => {
            handleConfirmPayment(selectedRecord.paymentRecordsId)
            setDetailsOpen(false)
          }}
          refreshRecords={refreshRecords}
        />
      )}

      {/* Add Transaction Modal */}
      <AddTransactionModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={handleAddSuccess}
        isEditing={false}
      />

      {/* Edit Transaction Modal */}
      {recordToEdit && (
        <AddTransactionModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSuccess={handleAddSuccess}
          isEditing={true}
          recordData={recordToEdit}
        />
      )}
    </>
  )
}
