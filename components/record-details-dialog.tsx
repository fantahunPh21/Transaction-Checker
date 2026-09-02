"use client"

import { useState, useEffect, useCallback } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Check, X, Calendar, ImageIcon } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import api from "@/lib/api"

interface PaymentRecordLine {
  paymentRecordLineId: number
  debitAccountNo: string
  debitAccountName: string
  creditAccountNo: string
  creditAccountName: string
  images: string
  amountPaid: number
  confirmedBy: string | null
  companyName: string
  referenceId: string
  remark: string
  status: string
  createdDate?: string
}

interface PaymentRecord {
  paymentRecordsId: number
  customerName: string
  amountPaid: number
  salesPerson: string
  remark: string
  confirmationStatus: string
  paymentRecordLine?: PaymentRecordLine[]
  customerTIN?: string
  companyName?: string
  createdDate?: string
  debitAccountNo?: string
  creditAccountNo?: string
  referenceId?: string
}

interface RecordDetailsDialogProps {
  record: PaymentRecord
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm?: () => void
  refreshRecords?: () => void
}

export function RecordDetailsDialog({
  record,
  open,
  onOpenChange,
  onConfirm,
  refreshRecords,
}: RecordDetailsDialogProps) {
  const { toast } = useToast()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentSlipIndex, setCurrentSlipIndex] = useState(0)
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("slips")
  const [selectedSlips, setSelectedSlips] = useState<Record<number, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Function to fetch images for a specific slip
  const fetchImages = useCallback(async () => {
    if (!record) return

    setIsLoading(true)
    try {
      // If we have paymentRecordLine and it's an array with items
      if (record.paymentRecordLine && Array.isArray(record.paymentRecordLine) && record.paymentRecordLine.length > 0) {
        const currentLine = record.paymentRecordLine[currentSlipIndex]
        console.log("Fetching images for slip:", currentSlipIndex, "Line:", currentLine)

        if (currentLine && currentLine.images) {
          let imageNames: string[] = []

          // If images is a string, try to parse it as JSON or treat as a single image
          if (typeof currentLine.images === "string") {
            try {
              // Try to parse as JSON
              const parsedImages = JSON.parse(currentLine.images)
              console.log("Parsed images:", parsedImages)

              if (Array.isArray(parsedImages)) {
                imageNames = parsedImages
              } else {
                // If not an array, treat as a single image filename
                imageNames = [currentLine.images]
              }
            } catch (error) {
              // If parsing fails, treat as a single image filename
              console.log("Parsing failed, using as single image:", currentLine.images)
              imageNames = [currentLine.images]
            }
          }
          // If images is already an array
          else if (Array.isArray(currentLine.images)) {
            imageNames = currentLine.images
          }

          console.log("Image names to fetch:", imageNames)

          // Get auth token for image requests
          const token = localStorage.getItem("authToken") || localStorage.getItem("token")

          // Fetch each image with authentication
          const imagePromises = imageNames.map(async (imageName) => {
            try {
              const imageUrl = api.getUrl(`/uploads/${encodeURIComponent(imageName)}`)
              console.log("Fetching image:", imageUrl)

              const response = await fetch(imageUrl, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              })

              if (!response.ok) {
                console.error("Failed to fetch image:", imageName, response.status)
                return null
              }

              const blob = await response.blob()
              return URL.createObjectURL(blob)
            } catch (error) {
              console.error("Error fetching image:", imageName, error)
              return null
            }
          })

          const fetchedImages = await Promise.all(imagePromises)
          const validImages = fetchedImages.filter(Boolean) as string[]

          console.log("Fetched images:", validImages.length)
          setImages(validImages)
        } else {
          console.log("No images found for this slip")
          setImages([])
        }
      } else {
        console.log("No payment record lines found")
        setImages([])
      }
    } catch (error) {
      console.error("Error in fetchImages:", error)
      setImages([])
    } finally {
      setIsLoading(false)
    }
  }, [record, currentSlipIndex])

  // Load images when the dialog opens or when the current slip changes
  useEffect(() => {
    if (open && record) {
      console.log("Fetching images for slip index:", currentSlipIndex)
      fetchImages()
      setCurrentImageIndex(0) // Reset to first image when slip changes
    }
  }, [open, record, currentSlipIndex, fetchImages])

  // Reset selected slips when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedSlips({})
      setCurrentSlipIndex(0) // Reset to first slip when dialog opens
      setCurrentImageIndex(0) // Reset to first image when dialog opens
    }
  }, [open])

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
    if (record && record.paymentRecordLine && record.paymentRecordLine.length > 0) {
      setCurrentSlipIndex((prev) => (prev + 1) % record.paymentRecordLine!.length)
    }
  }

  const prevSlip = () => {
    if (record && record.paymentRecordLine && record.paymentRecordLine.length > 0) {
      setCurrentSlipIndex((prev) => (prev - 1 + record.paymentRecordLine!.length) % record.paymentRecordLine!.length)
    }
  }

  const handleSlipSelectionChange = (slipIndex: number, checked: boolean) => {
    setSelectedSlips((prev) => ({
      ...prev,
      [slipIndex]: checked,
    }))
  }

  // Update the handleSelectAllSlips function
  const handleSelectAllSlips = (checked: boolean) => {
    const newSelectedSlips: Record<number, boolean> = {}
    if (record && record.paymentRecordLine) {
      record.paymentRecordLine.forEach((slip, index) => {
        // Since we don't have status in the actual data, we'll assume all slips are selectable
        newSelectedSlips[index] = checked
      })
    }
    setSelectedSlips(newSelectedSlips)
  }

  // Update the handleConfirmSelected function to use indices instead of IDs
  const handleConfirmSelected = async () => {
    const selectedIndices = Object.entries(selectedSlips)
      .filter(([_, isSelected]) => isSelected)
      .map(([index]) => Number.parseInt(index))

    if (selectedIndices.length === 0) {
      toast({
        title: "No slips selected",
        description: "Please select at least one slip to confirm.",
        variant: "destructive",
      })
      return
    }

    // Convert indices to payment record line data for the API
    const linesToConfirm = selectedIndices.map((index) => record.paymentRecordLine?.[index])

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      await fetch(`payment-records/${record.paymentRecordsId}/confirm-slips`, {
        method: "PUT",
        body: JSON.stringify({
          paymentRecordLines: linesToConfirm,
          confirmedBy: "current-user",
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      toast({
        title: "Success",
        description: `${selectedIndices.length} slip(s) confirmed successfully.`,
        variant: "success",
      })

      // Refresh records
      if (refreshRecords) {
        refreshRecords()
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Error confirming slips:", error)
      toast({
        title: "Error",
        description: "Failed to confirm slips.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update the handleDenySelected function to use indices instead of IDs
  const handleDenySelected = async () => {
    const selectedIndices = Object.entries(selectedSlips)
      .filter(([_, isSelected]) => isSelected)
      .map(([index]) => Number.parseInt(index))

    if (selectedIndices.length === 0) {
      toast({
        title: "No slips selected",
        description: "Please select at least one slip to deny.",
        variant: "destructive",
      })
      return
    }

    // Convert indices to slip data for the API
    const slipsToDeny = selectedIndices.map((index) => record.paymentRecordLine?.[index])

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      await fetch(`payment-records/${record.paymentRecordsId}/deny-slips`, {
        method: "PUT",
        body: JSON.stringify({
          paymentRecordLines: slipsToDeny,
          deniedBy: "current-user", // Replace with actual user info
          reason: "Denied by user", // You might want to add a reason input
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      toast({
        title: "Success",
        description: `${selectedIndices.length} slip(s) denied successfully.`,
        variant: "success",
      })

      // Refresh records
      if (refreshRecords) {
        refreshRecords()
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Error denying slips:", error)
      toast({
        title: "Error",
        description: "Failed to deny slips.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle legacy confirm action
  const handleLegacyConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
  }

  if (!record) return null

  const hasSlipInfo =
    record.paymentRecordLine && Array.isArray(record.paymentRecordLine) && record.paymentRecordLine.length > 0
  const selectedSlipCount = Object.values(selectedSlips).filter(Boolean).length

  // Format date for display
  const formatDate = (date: Date | string) => {
    if (!date) return "-"
    try {
      if (date instanceof Date) {
        return date.toLocaleDateString()
      }
      return new Date(date).toLocaleDateString()
    } catch (e) {
      return "-"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto min-h-[600px]">
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
                <Badge
                  variant={
                    record.confirmationStatus?.toLowerCase() === "completed"
                      ? ("success" as "secondary")
                      : record.confirmationStatus?.toLowerCase() === "requested"
                        ? "outline"
                        : record.confirmationStatus?.toLowerCase() === "duplicate"
                          ? "destructive"
                          : "secondary"
                  }
                >
                  {record.confirmationStatus ? record.confirmationStatus.toUpperCase() : "-"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Slip Information and Attachments */}
        <Tabs defaultValue="slips" className="w-full" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="slips">Slip Information</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>

          {/* Slip Information Tab */}
          <TabsContent value="slips" className="space-y-4 py-4">
            {hasSlipInfo ? (
              <>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleConfirmSelected}
                        className="flex items-center gap-1"
                        disabled={isSubmitting}
                      >
                        <Check className="h-4 w-4" />
                        Confirm Selected
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDenySelected}
                        className="flex items-center gap-1 text-destructive"
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                        Deny Selected
                      </Button>
                    </div>
                  )}
                </div>

                {/* Slip selector buttons */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Select slip to view:</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {record.paymentRecordLine?.map((line, index) => (
                      <Button
                        key={index}
                        variant={index === currentSlipIndex ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentSlipIndex(index)}
                        className={!!selectedSlips[index] ? "bg-blue-50 border-blue-200" : ""}
                      >
                        Slip {index + 1} - {line.referenceId}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Current slip details */}
                <div className="relative">
                  <Card className={`w-full ${!!selectedSlips[currentSlipIndex] ? "bg-blue-50" : ""}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg">
                        Slip {currentSlipIndex + 1} Details
                        <div className="flex items-center mt-1">
                          <Checkbox
                            className="mr-2"
                            checked={!!selectedSlips[currentSlipIndex]}
                            onCheckedChange={(checked) => handleSlipSelectionChange(currentSlipIndex, !!checked)}
                          />
                          <Badge variant="outline">
                            {record.paymentRecordLine![currentSlipIndex].status || "REQUESTED"}
                          </Badge>
                        </div>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveTab("attachments")
                        }}
                        className="flex items-center gap-1"
                      >
                        <ImageIcon className="h-4 w-4" />
                        View Images
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium text-muted-foreground text-sm">Reference ID</h3>
                          <p>{record.paymentRecordLine![currentSlipIndex].referenceId}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-muted-foreground text-sm">Transaction Date</h3>
                          <p className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {record.paymentRecordLine![currentSlipIndex].createdDate
                              ? formatDate(record.paymentRecordLine![currentSlipIndex].createdDate)
                              : formatDate(record.createdDate || new Date())}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-medium text-muted-foreground text-sm">Dr. Account Name</h3>
                          <p>{record.paymentRecordLine![currentSlipIndex].debitAccountName}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-muted-foreground text-sm">Dr. Account Number</h3>
                          <p>{record.paymentRecordLine![currentSlipIndex].debitAccountNo}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-muted-foreground text-sm">Cr. Account Name</h3>
                          <p>{record.paymentRecordLine![currentSlipIndex].creditAccountName}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-muted-foreground text-sm">Cr. Account Number</h3>
                          <p>{record.paymentRecordLine![currentSlipIndex].creditAccountNo}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-muted-foreground text-sm">Amount</h3>
                          <p className="font-semibold">
                            Br. {record.paymentRecordLine![currentSlipIndex].amountPaid.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-medium text-muted-foreground text-sm">Status</h3>
                          <p>{record.paymentRecordLine[currentSlipIndex].status || "-"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Navigation controls */}
                  <div className="flex items-center justify-between w-full mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevSlip}
                      disabled={record.paymentRecordLine.length <= 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous Slip
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Slip {currentSlipIndex + 1} of {record.paymentRecordLine.length}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextSlip}
                      disabled={record.paymentRecordLine.length <= 1}
                    >
                      Next Slip
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <Card className="w-full">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-medium">No Slip Information Available</h3>
                    <p className="text-sm text-muted-foreground">
                      This record doesn't contain detailed slip information.
                    </p>

                    {/* Show basic transaction details if available */}
                    {(record.debitAccountNo || record.creditAccountNo || record.referenceId) && (
                      <div className="mt-6 text-left w-full max-w-md mx-auto">
                        <h4 className="text-sm font-medium mb-2">Basic Transaction Details:</h4>
                        <div className="space-y-2">
                          {record.debitAccountNo && (
                            <div>
                              <span className="text-sm text-muted-foreground">Debited Account: </span>
                              <span>{record.debitAccountNo}</span>
                            </div>
                          )}
                          {record.creditAccountNo && (
                            <div>
                              <span className="text-sm text-muted-foreground">Credited Account: </span>
                              <span>{record.creditAccountNo}</span>
                            </div>
                          )}
                          {record.referenceId && (
                            <div>
                              <span className="text-sm text-muted-foreground">Reference ID: </span>
                              <span>{record.referenceId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Attachments Tab */}
          <TabsContent value="attachments" className="space-y-4 py-4">
            {hasSlipInfo ? (
              <>
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Viewing images for slip:</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {record.paymentRecordLine?.map((line, index) => (
                      <Button
                        key={index}
                        variant={index === currentSlipIndex ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentSlipIndex(index)}
                      >
                        Slip {index + 1} - {line.referenceId}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Image display section */}
                {isLoading ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <p className="text-muted-foreground">Loading images...</p>
                  </div>
                ) : images.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-full">
                      <img
                        src={images[currentImageIndex] || "/placeholder.svg"}
                        alt={`Attachment ${currentImageIndex + 1}`}
                        className="mx-auto h-auto max-h-[400px] w-auto rounded-md object-contain"
                        onError={(e) => {
                          console.error("Image failed to load:", images[currentImageIndex])
                          e.currentTarget.src = "/placeholder.svg"
                        }}
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
                ) : (
                  <div className="flex h-[300px] items-center justify-center">
                    <p className="text-muted-foreground">No attachments available for this slip</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-muted-foreground">No slip information available to show attachments</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>

          <div className="flex gap-2">
            {/* For legacy records without slip info */}
            {!hasSlipInfo && record.confirmationStatus?.toLowerCase() === "requested" && (
              <Button onClick={handleLegacyConfirm}>Confirm Payment</Button>
            )}

            {/* For records with slip info */}
            {hasSlipInfo && record.confirmationStatus?.toLowerCase() === "requested" && selectedSlipCount > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={handleDenySelected}
                  className="flex items-center gap-1 text-destructive"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                  Deny Selected
                </Button>
                <Button onClick={handleConfirmSelected} className="flex items-center gap-1" disabled={isSubmitting}>
                  <Check className="h-4 w-4" />
                  Confirm Selected
                </Button>
              </>
            )}

            {/* For duplicate records */}
            {record.confirmationStatus?.toLowerCase() === "duplicate" && (
              <Button onClick={handleLegacyConfirm} variant="destructive">
                Delete Record
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
