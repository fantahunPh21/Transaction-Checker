"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Check, X, Calendar, ImageIcon } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// This is a preview component to show how the dialog will look with sample data
export function EnhancedRecordDetailsDialogPreview() {
  const [open, setOpen] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentSlipIndex, setCurrentSlipIndex] = useState(0)
  const [selectedSlips, setSelectedSlips] = useState<Record<number, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sample record data
  const record = {
    paymentRecordsId: 12345,
    companyName: "ABC Trading PLC",
    customerTIN: "0001138372",
    customerName: "3M ENGINEERING & CONSTRUCTION",
    amountPaid: 1221.93,
    salesPerson: "John Doe",
    remark: "Payment for invoice #INV-2023-456",
    requestStatus: "REQUESTED",
    slipInfo: [
      {
        debitedAccountNumber: "4564565767",
        debitedAccountName: "3M ENGINEERING",
        creditAccountNo: "67331889",
        creditAccountName: "ABC Trading Account",
        amountPaid: 1110.93,
        transactionDate: new Date("2025-05-07T11:33:00"),
        referenceId: "TRX-123456",
        images: ["sample-slip-1.jpg"],
      },
      {
        debitedAccountNumber: "345",
        debitedAccountName: "3M CONSTRUCTION",
        creditAccountNo: "wert5567",
        creditAccountName: "ABC Trading Secondary",
        amountPaid: 111.0,
        transactionDate: new Date("2025-05-07T11:36:56"),
        referenceId: "TRX-789012",
        images: ["sample-slip-2.jpg"],
      },
    ],
  }

  // Sample images
  const images = ["/placeholder.svg?height=400&width=600", "/placeholder.svg?height=400&width=600"]

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const nextSlip = () => {
    if (record && record.slipInfo && record.slipInfo.length > 0) {
      setCurrentSlipIndex((prev) => (prev + 1) % record.slipInfo.length)
    }
  }

  const prevSlip = () => {
    if (record && record.slipInfo && record.slipInfo.length > 0) {
      setCurrentSlipIndex((prev) => (prev - 1 + record.slipInfo.length) % record.slipInfo.length)
    }
  }

  const handleSlipSelectionChange = (slipIndex: number, checked: boolean) => {
    setSelectedSlips((prev) => ({
      ...prev,
      [slipIndex]: checked,
    }))
  }

  const handleSelectAllSlips = (checked: boolean) => {
    const newSelectedSlips = {}
    if (record && record.slipInfo) {
      record.slipInfo.forEach((slip, index) => {
        newSelectedSlips[index] = checked
      })
    }
    setSelectedSlips(newSelectedSlips)
  }

  const hasSlipInfo = record.slipInfo && Array.isArray(record.slipInfo) && record.slipInfo.length > 0
  const selectedSlipCount = Object.values(selectedSlips).filter(Boolean).length

  // Format date for display
  const formatDate = (date: Date | string) => {
    if (date instanceof Date) {
      return date.toLocaleDateString()
    }
    return new Date(date).toLocaleDateString()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Record Details</DialogTitle>
          <DialogDescription>Payment Record ID: {record.paymentRecordsId}</DialogDescription>
        </DialogHeader>

        {/* Customer and Company Information Card - Always visible at the top */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Record Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-muted-foreground text-sm">Customer Name</h3>
                <p>{record.customerName}</p>
              </div>
              <div>
                <h3 className="font-medium text-muted-foreground text-sm">Customer TIN</h3>
                <p>{record.customerTIN}</p>
              </div>
              <div>
                <h3 className="font-medium text-muted-foreground text-sm">Company Name</h3>
                <p>{record.companyName}</p>
              </div>
              <div>
                <h3 className="font-medium text-muted-foreground text-sm">Sales Person</h3>
                <p>{record.salesPerson}</p>
              </div>
              <div>
                <h3 className="font-medium text-muted-foreground text-sm">Total Amount</h3>
                <p className="font-semibold">Br. {record.amountPaid.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="font-medium text-muted-foreground text-sm">Request Status</h3>
                <Badge variant="outline">{record.requestStatus.toUpperCase()}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Slip Information and Attachments */}
        {hasSlipInfo && (
          <Tabs defaultValue="slips" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="slips">Slip Information</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>

            {/* Slip Information Tab - Styled like Attachments Tab */}
            <TabsContent value="slips" className="space-y-4 py-4">
              {/* Selection controls */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="select-all" onCheckedChange={(checked) => handleSelectAllSlips(!!checked)} />
                  <label htmlFor="select-all" className="text-sm font-medium">
                    Select All
                  </label>
                  <span className="text-sm text-muted-foreground ml-2">{selectedSlipCount} selected</span>
                </div>

                {selectedSlipCount > 0 && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-1" disabled={isSubmitting}>
                      <Check className="h-4 w-4" />
                      Confirm Selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-destructive"
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                      Deny Selected
                    </Button>
                  </div>
                )}
              </div>

              {/* Slip selector buttons - similar to attachments tab */}
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Select slip to view:</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {record.slipInfo.map((slip, index) => (
                    <Button
                      key={index}
                      variant={index === currentSlipIndex ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentSlipIndex(index)}
                    >
                      Slip {index + 1} - {slip.referenceId}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Current slip details */}
              <div className="relative">
                <Card className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">
                      Slip {currentSlipIndex + 1} Details
                      <div className="flex items-center mt-1">
                        <Checkbox
                          className="mr-2"
                          checked={!!selectedSlips[currentSlipIndex]}
                          onCheckedChange={(checked) => handleSlipSelectionChange(currentSlipIndex, !!checked)}
                        />
                        <Badge variant="outline">REQUESTED</Badge>
                      </div>
                    </CardTitle>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" />
                      View Images
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-muted-foreground text-sm">Reference ID</h3>
                        <p>{record.slipInfo[currentSlipIndex].referenceId}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-muted-foreground text-sm">Transaction Date</h3>
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(record.slipInfo[currentSlipIndex].transactionDate)}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-muted-foreground text-sm">Dr. Account Name</h3>
                        <p>{record.slipInfo[currentSlipIndex].debitedAccountName}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-muted-foreground text-sm">Dr. Account Number</h3>
                        <p>{record.slipInfo[currentSlipIndex].debitedAccountNumber}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-muted-foreground text-sm">Cr. Account Name</h3>
                        <p>{record.slipInfo[currentSlipIndex].creditAccountName}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-muted-foreground text-sm">Cr. Account Number</h3>
                        <p>{record.slipInfo[currentSlipIndex].creditAccountNo}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-muted-foreground text-sm">Amount</h3>
                        <p className="font-semibold">Br. {record.slipInfo[currentSlipIndex].amountPaid.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation controls - just like in attachments tab */}
                <div className="flex items-center justify-between w-full mt-4">
                  <Button variant="outline" size="sm" onClick={prevSlip} disabled={record.slipInfo.length <= 1}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous Slip
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Slip {currentSlipIndex + 1} of {record.slipInfo.length}
                  </div>
                  <Button variant="outline" size="sm" onClick={nextSlip} disabled={record.slipInfo.length <= 1}>
                    Next Slip
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Attachments Tab */}
            <TabsContent value="attachments" className="space-y-4 py-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Viewing images for slip:</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {record.slipInfo.map((slip, index) => (
                    <Button
                      key={index}
                      variant={index === currentSlipIndex ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentSlipIndex(index)}
                    >
                      Slip {index + 1} - {slip.referenceId}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative w-full">
                  <img
                    src={images[currentImageIndex] || "/placeholder.svg"}
                    alt={`Attachment ${currentImageIndex + 1}`}
                    className="mx-auto h-auto max-h-[400px] w-auto rounded-md object-contain"
                  />

                  {images.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>

                <div className="mt-4 flex justify-center">
                  <p className="text-sm text-muted-foreground">
                    Image {currentImageIndex + 1} of {images.length}
                  </p>
                </div>

                <div className="mt-2 flex gap-2">
                  {images.map((_, index) => (
                    <Button
                      key={index}
                      variant={index === currentImageIndex ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {record.remark && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{record.remark}</p>
            </CardContent>
          </Card>
        )}

        <Separator className="my-4" />

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>

          <div className="flex gap-2">
            {/* For records with slip info */}
            {hasSlipInfo && record.requestStatus?.toLowerCase() === "requested" && selectedSlipCount > 0 && (
              <>
                <Button variant="outline" className="flex items-center gap-1 text-destructive" disabled={isSubmitting}>
                  <X className="h-4 w-4" />
                  Deny Selected
                </Button>
                <Button className="flex items-center gap-1" disabled={isSubmitting}>
                  <Check className="h-4 w-4" />
                  Confirm Selected
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
