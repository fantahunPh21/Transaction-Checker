"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon, Upload } from "lucide-react"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Toaster } from "./ui/toaster"

// Define the form schema with validation
const formSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  referenceId: z.string().min(1, "Reference ID is required"),
  customerName: z.string().min(1, "Customer name is required"),
  amountPaid: z.coerce
    .number()
    .positive("Amount must be positive")
    .or(z.literal("").transform(() => 0)), // Handle empty string case
  salesPerson: z.string().min(1, "Sales person is required"),
  remark: z.string().optional(),
  transactionDate: z.date({
    required_error: "Transaction date is required",
  }),
  drAccountNumber: z.string().min(1, "Dr. account number is required"),
  drAccountName: z.string().min(1, "Dr. account name is required"),
  crAccountNumber: z.string().min(1, "Cr. account number is required"),
  crAccountName: z.string().min(1, "Cr. account name is required"),
  images: z.array(z.instanceof(File)).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AddTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  isFinanceUser?: boolean
}

export function AddTransactionModal(props: AddTransactionModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      companyName: "",
      referenceId: "",
      customerName: "",
      amountPaid: 0, // Changed from undefined to empty string
      salesPerson: "",
      remark: "",
      transactionDate: new Date(),
      drAccountNumber: "",
      drAccountName: "",
      crAccountNumber: "",
      crAccountName: "",
      images: [],
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      setImageFiles((prevFiles) => [...prevFiles, ...files])

      // Create preview URLs for the images
      const newPreviews = files.map((file) => URL.createObjectURL(file))
      setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index])
    setImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index))
  }

  async function onSubmit(data: FormValues) {
    try {
      setIsSubmitting(true)

      // Log the form data to the console
      console.log("Form Data:", data)

      const jsonData = {
        companyName: data.companyName,
        referenceId: data.referenceId,
        customerName: data.customerName,
        debitAccountNo: data.drAccountNumber,
        debitAccountName: data.drAccountName,
        creditAccountName: data.crAccountName,
        creditAccountNo: data.crAccountNumber,
        amountPaid: data.amountPaid,
        salesPerson: data.salesPerson,
        remark: data.remark,
      }

      // Create FormData to handle file uploads
      const formData = new FormData()
      formData.append("data", JSON.stringify(jsonData))

      // Append each image file
      imageFiles.forEach((file, index) => {
        formData.append(`image_${index}`, file)
      })

      // Use different endpoint based on user type
      const endpoint = props.isFinanceUser
        ? "http://localhost:8088/finance-payment-confirmation/api/v1/payment-records/finance-confirm"
        : "http://localhost:8088/finance-payment-confirmation/api/v1/payment-records"

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to process transaction")
      }

      toast({
        title: props.isFinanceUser ? "Transaction confirmed" : "Transaction added",
        description: props.isFinanceUser
          ? "The transaction has been confirmed successfully."
          : "The transaction has been added successfully.",
        variant: "success",
      })

      // Clean up image previews
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
      setImageFiles([])
      setImagePreviews([])

      // Close the modal and reset the form
      setTimeout(() => {
        props.onOpenChange(false)
        form.reset()
        if (props.onSuccess) props.onSuccess()
      }, 2000)

      // Call the success callback if provided
      if (props.onSuccess) {
        props.onSuccess()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process transaction",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogDescription>Enter the transaction details below to add a new payment record.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Company Name and Reference ID */}
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referenceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter reference ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Customer Name and Amount Paid */}
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter customer name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amountPaid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Paid</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value} // Explicitly set value
                          onChange={(e) => {
                            // Handle empty string case
                            field.onChange(e.target.value === "" ? "" : e.target.value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sales Person and Transaction Date */}
                <FormField
                  control={form.control}
                  name="salesPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sales Person</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter sales person name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transactionDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Transaction Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value ? "text-muted-foreground" : ""
                              }`}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dr. Account Number and Name */}
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="drAccountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dr. Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Dr. account number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="drAccountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dr. Account Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Dr. account name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Cr. Account Number and Name */}
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="crAccountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cr. Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Cr. account number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="crAccountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cr. Account Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Cr. account name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Image Upload Section */}
                <div className="col-span-2">
                  <FormLabel>Attachment Images</FormLabel>
                  <div className="mt-2 flex items-center gap-2">
                    <Input type="file" accept="image/*" multiple onChange={handleImageChange} className="flex-1" />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-full rounded-md object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Remark */}
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="remark"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remark</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter any additional remarks" className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? props.isFinanceUser
                      ? "Confirming..."
                      : "Adding..."
                    : props.isFinanceUser
                      ? "Confirm Transaction"
                      : "Add Transaction"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}
