"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { CalendarIcon, Upload } from "lucide-react"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { X, Plus } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Toaster } from "./ui/toaster"
import FileUploader from "@/components/file-uploader"
import { companiesRecord } from "@/hooks/companies-record"
import ReactSelect from "react-select"
import { shopsRecord } from "@/hooks/shop-records"
import api from "@/lib/api"

// Define the form schema with validation - temporarily relaxing validation
const formSchema = z.object({
  companyName: z.string().optional(),
  shopName: z.string().optional(),
  customerTIN: z.string().optional(),
  customerName: z.string().optional(),
  shop: z.string().optional(),
  amountPaid: z.coerce
    .number()
    .optional()
    .or(z.literal("").transform(() => 0)), // Handle empty string case
  salesPerson: z.string().optional(),
  remark: z.string().optional(),
  drAccount: z
    .array(
      z.object({
        debitedAccountNumber: z.string().optional(),
        debitedAccountName: z.string().optional(),
        amountPaid: z.coerce
          .number()
          .optional()
          .or(z.literal("").transform(() => 0)), // Handle empty string case
        transactionDate: z.date().optional(),
        images: z.array(z.instanceof(File)).optional(),
        referenceId: z.string().optional(),
        crAccountNumber: z.string().optional(),
        crAccountName: z.string().optional(),
      }),
    )
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AddTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  isFinanceUser?: boolean
  isEditing?: boolean
  recordData?: any
}

export function AddTransactionModal(props: AddTransactionModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [selectedHolderNames, setSelectedHolderNames] = useState<Record<number, string>>({})
  const { companies, isLoading } = companiesRecord()

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [accounts, setBankAccounts] = useState<{value: string; label: string; accountHolder: string}[]>([])
  const [loadingBanks, setLoadingBanks] = useState(false)
  const { shops, isLoading: isShopLoading, setShops } = shopsRecord()

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedCustomerName, setSelectedCustomerName] = useState("")
  const [selectedCustomerTin, setSelectedCustomerTin] = useState("")
  const [formErrors, setFormErrors] = useState<any>(null)
  const [originalRecord, setOriginalRecord] = useState<any>(null)

  // ==========> AUTOCOMPLETE FOR CUSTOMERS <==========
  const customers = {
    "0046067483": "2BF MECHANICHAL",
    "0001138372": "3M ENGINERING &CONSTRCTION",
    "0038994799": "A M T IMPORT P L C",
    "0042713289": "A N E TRADE WORK PLC",
    "0051321251": "A T H B General Trading P L C",
    "0022646033": "A.S.T.T Constriction P L C",
    "0004381711": "A.W.R ENERGY & ELECTRO",
    "0000072580": "A.Z P.L.C",
    "0062241014": "AB FAM TRADING PLC",
    "0088127770": "ABA KIYA TECHNOLOGY AND TRADING PLC",
    "0044020964": "ABABAYENESH WAKAYEHU BIFTU",
    "0046111425": "Abajalia Trading Plc",
    "0043089582": "ABAL MEKASHA ZIMAMU",
    "0002221828": "ABATE MEKONEN YALEW",
    "0016765021": "ABATE YESGAT ASEGAHEGN",
    "0002206428": "ABAY  YIRIGA  DAMITAWU",
    "0043090482": "ABAY NEGUSSIE TEFERA",
    "0041420035": "ABDELA NURDIN KELIL",
    "0022307965": "ABDI ABEBE",
    "0026782624": "ABDI ABRAR HELIL",
    "0056005067": "ABDI CHEMEDA",
    "0004136938": "ABDI CONSTRUCTION PLC",
    "0063439015": "ABDILFETA  AMAN YASIN",
    "0064808689": "ABDILJBAR DILGEBA SHAFI",
    "0011372649": "ABDINUR  MOHAMED",
    "0046696814": "Abdirashid Sarhaye Mohamud",
    "0069291138": "ABDIURAHF KEMAL ABIDELA",
    "0009308695": "ABDLEKERIM DILEBO KEMAI",
  }
  const handleTinChange = (value: string) => {
    // For example, match tin that starts with the entered value
    const filtered = Object.keys(customers).filter((tin) => tin.startsWith(value))
    setSuggestions(filtered)
    setShowSuggestions(filtered.length > 0)
  }

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      companyName: "",
      customerTIN: "",
      customerName: "",
      amountPaid: 0,
      salesPerson: "",
      remark: "",
      shop: "",
      drAccount: [
        {
          debitedAccountNumber: "",
          debitedAccountName: "",
          amountPaid: 0,
          transactionDate: new Date(),
          referenceId: "",
          images: [],
          crAccountNumber: "",
          crAccountName: "",
        },
      ],
    },
  })

  // When a suggestion is clicked, update both fields
  const handleSuggestionClick = (tin: string) => {
    form.setValue("customerTIN", tin)
    form.setValue("customerName", customers[tin as keyof typeof customers])
    setSelectedCustomerTin(tin)
    setSelectedCustomerName(customers[tin as keyof typeof customers])
    setShowSuggestions(false)
  }

  // Populate form with record data if in edit mode
  useEffect(() => {
    if (props.isEditing && props.recordData) {
      const record = props.recordData
      console.log("Editing record data:", record)
      setOriginalRecord(record)

      // Set company ID and trigger bank accounts fetch
      const companyId = record.companyId?.toString() || ""
      setSelectedCompanyId(companyId)

      // Set basic form fields with proper fallbacks
      form.setValue("companyName", companyId)

      // Handle different field names for customer TIN
      const customerTin = record.customerTIN || record.tinNumber || ""
      form.setValue("customerTIN", customerTin)
      setSelectedCustomerTin(customerTin)

      // Set customer name
      const customerName = record.customerName || ""
      form.setValue("customerName", customerName)
      setSelectedCustomerName(customerName)

      // Set other basic fields
      form.setValue("amountPaid", record.amountPaid || 0)
      form.setValue("salesPerson", record.salesPerson || "")
      form.setValue("remark", record.remark || "")

      // Handle shop ID - convert to string for the select component
      const shopId = record.shopBranchId?.toString() || ""
      form.setValue("shop", shopId)
      console.log("Setting shop ID:", shopId)

      // Handle payment record lines if available
      let paymentLines: any[] = []

      // Try different field names that might contain the payment lines
      if (record.paymentRecordLine && record.paymentRecordLine.length > 0) {
        paymentLines = record.paymentRecordLine
        console.log("Using paymentRecordLine:", paymentLines)
      } else if (record.lines && record.lines.length > 0) {
        paymentLines = record.lines
        console.log("Using lines:", paymentLines)
      } else if (record.slipInfo && record.slipInfo.length > 0) {
        paymentLines = record.slipInfo
        console.log("Using slipInfo:", paymentLines)
      }

      if (paymentLines.length > 0) {
        // Map the payment lines to the form structure
        const formattedSlips = paymentLines.map((line: any) => {
          console.log("Processing line:", line)
          return {
            // Handle different field naming conventions with fallbacks
            debitedAccountNumber: line.debitAccountNo || line.debitedAccountNumber || "",
            debitedAccountName: line.debitAccountName || line.debitedAccountName || "",
            amountPaid: line.amountPaid || 0,
            transactionDate:
              line.transactionDate || line.createdDate
                ? new Date(line.transactionDate || line.createdDate)
                : new Date(),
            referenceId: line.referenceId || "",
            images: [], // We can't populate File objects from URLs
            crAccountNumber: line.creditAccountNo || line.crAccountNumber || "",
            crAccountName: line.creditAccountName || line.crAccountName || "",
          }
        })

        console.log("Formatted slips:", formattedSlips)
        form.setValue("drAccount", formattedSlips)

        // Set selected holder names for credit accounts
        const holderNames: Record<number, string> = {}
        formattedSlips.forEach((slip: any, index: number) => {
          if (slip.crAccountName) {
            holderNames[index] = slip.crAccountName
          }
        })
        setSelectedHolderNames(holderNames)
      } else {
        console.log("No payment lines found in record data")
        // Ensure at least one empty slip is available
        form.setValue("drAccount", [
          {
            debitedAccountNumber: "",
            debitedAccountName: "",
            amountPaid: 0,
            transactionDate: new Date(),
            referenceId: "",
            images: [],
            crAccountNumber: "",
            crAccountName: "",
          },
        ])
      }
    }
  }, [props.isEditing, props.recordData, form])

  const addSlipInfo = () => {
    const currentAccounts = form.getValues("drAccount") || []
    form.setValue("drAccount", [
      ...currentAccounts,
      {
        debitedAccountNumber: "",
        debitedAccountName: "",
        amountPaid: 0,
        referenceId: "",
        transactionDate: new Date(),
        images: [],
        crAccountNumber: "",
        crAccountName: "",
      },
    ])
  }

  const removeSlipInfo = (index: number) => {
    const currentAccounts = form.getValues("drAccount") || []
    if (currentAccounts.length > 1) {
      form.setValue(
        "drAccount",
        currentAccounts.filter((_, i) => i !== index),
      )

      // Also remove the holder name from our state
      const newSelectedHolderNames = { ...selectedHolderNames }
      delete newSelectedHolderNames[index]
      setSelectedHolderNames(newSelectedHolderNames)
    }
  }

  // =========> FETCH BANKS <==========
  useEffect(() => {
    if (!selectedCompanyId) return

    setLoadingBanks(true)
    const token = localStorage.getItem("authToken")

    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088/finance-payment-confirmation/api/v1"}/companies/${selectedCompanyId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch bank accounts: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        const formatted = (data.content.bankAccount || []).map((account: any) => ({
          value: account.accountNumber,
          label: `${account.accountNumber} - ${account.bankName}`,
          accountHolder: account.accountHolder,
        }))
        setBankAccounts(formatted)
      })
      .catch((error) => {
        console.error("Error fetching bank accounts:", error)
        toast({
          title: "Error",
          description: "Failed to load bank accounts",
          variant: "destructive",
        })
      })
      .finally(() => setLoadingBanks(false))
  }, [selectedCompanyId, toast])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      const previews = files.map((file) => URL.createObjectURL(file))

      // Update form value for specific slip entry
      const drAccount = form.getValues("drAccount") || []
      if (drAccount[index]) {
        form.setValue(`drAccount.${index}.images`, files)
      }
    }
  }

  const removeImage = (index: number) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index])
    setImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index))
  }

  // Function to handle credit account selection for each slip
  const handleCreditAccountSelection = (value: string, accountHolder: string, index: number) => {
    // Update the form value for credit account number
    form.setValue(`drAccount.${index}.crAccountNumber`, value)

    // Update the account holder name in our state
    setSelectedHolderNames((prev) => ({
      ...prev,
      [index]: accountHolder,
    }))

    // Also update the form value for credit account name
    form.setValue(`drAccount.${index}.crAccountName`, accountHolder)
  }

  // Direct submission function that bypasses form validation
  const handleDirectSubmit = async () => {
    console.log("Direct submit function called")

    try {
      setIsSubmitting(true)

      // Get current form values
      const formValues = form.getValues()
      console.log("Current form values:", formValues)

      // Create a minimal payload with just the essential fields
      const minimalPayload = {
        customerName: selectedCustomerName || "Test Customer",
        amountPaid: formValues.amountPaid || 0,
        salesPerson: formValues.salesPerson || "Test Sales Person",
        remark: formValues.remark || "",
        tinNumber: selectedCustomerTin || "0000000000",
        shopBranchId: Number.parseInt(formValues.shop as string) || 1,
        companyId: Number.parseInt(formValues.companyName as string) || 1,
        userId: 1,
        lines: [
          {
            companyName: "Test Company",
            referenceId: "TEST-REF-001",
            debitAccountNo: "1234567890",
            debitAccountName: "Test Debit Account",
            creditAccountNo: "0987654321",
            creditAccountName: "Test Credit Account",
            images: "",
            amountPaid: 100,
            remark: "Test transaction",
          },
        ],
      }

      console.log("Sending minimal payload:", minimalPayload)

      // If editing, include the record ID
      if (props.isEditing && props.recordData) {
        ;(minimalPayload as Record<string, any>).paymentRecordsId = props.recordData.paymentRecordsId
      }

      // Use the API client for the request
      let result
      if (props.isEditing) {
        result = await api.put(`payment-records/${props.recordData?.paymentRecordsId}`, minimalPayload)
      } else {
        result = await api.post("/payment-records", minimalPayload)
      }

      toast({
        title: props.isEditing ? "Transaction updated" : "Transaction added",
        description: props.isEditing
          ? "The transaction has been updated successfully."
          : "The transaction has been added successfully.",
        variant: "success",
      })

      // Clean up previews and reset form
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
      setImageFiles([])
      setImagePreviews([])
      setSelectedHolderNames({})

      props.onOpenChange(false)
      form.reset()
      props.onSuccess?.()
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

  async function onSubmit(data: FormValues) {
    console.log("Form submitted with data:", data)
    console.log("Selected customer name:", selectedCustomerName)
    console.log("Selected customer TIN:", selectedCustomerTin)

    try {
      setIsSubmitting(true)

      // Update each slip's credit account name with the selected holder name
      const drAccount = data.drAccount || []
      const updatedDrAccount = drAccount.map((entry, index) => ({
        ...entry,
        crAccountName: selectedHolderNames[index] || entry.crAccountName,
      }))

      // =======> CHECK THE LENGHT OF UPLOADED IMAGES <======
      const drAccountData = await Promise.all(
        updatedDrAccount.map(async (entry, index) => {
          let uploadedImages: string[] = []

          if (entry.images && entry.images.length > 0) {
            const fileList = [...entry.images]

            if (fileList.length > 1) {
              const imageNames = fileList.map((file) => file.name)

              const result = await FileUploader.uploadMultipleFiles({
                endpoint: api.getUrl("/upload/file"),
                files: fileList,
                entityData: imageNames, // assuming one-to-one for names
              })

              if (result.length === 0) {
                throw new Error(`Failed to upload images for Slip #${index + 1}`)
              }

              uploadedImages = result
            } else {
              const result = await FileUploader.uploadFile({
                endpoint: api.getUrl("/upload/file"),
                file: fileList[0],
                uploadedImageNames: [],
                entityData: fileList[0].name,
              })

              if (!result.status) {
                throw new Error(`Failed to upload image for Slip #${index + 1}`)
              }

              uploadedImages = [result.content]
            }
          }
          return {
            ...entry,
            images: uploadedImages,
          }
        }),
      )

      const jsonData = {
        customerName: selectedCustomerName || "Test Customer",
        amountPaid: data.amountPaid || 0,
        salesPerson: data.salesPerson || "Test Sales Person",
        remark: data.remark ?? "",
        tinNumber: selectedCustomerTin || "0000000000",
        shopBranchId: Number.parseInt(data.shop as string) || 1,
        companyId: Number.parseInt(data.companyName as string) || 1,
        userId: 1,
        lines: drAccountData.map((slip) => ({
          companyName:
            companies.find((c) => c.companyId.toString() === data.companyName)?.companyName || "Test Company",
          referenceId: slip.referenceId || "TEST-REF-001",
          debitAccountNo: slip.debitedAccountNumber || "1234567890",
          debitAccountName: slip.debitedAccountName || "Test Debit Account",
          creditAccountNo: slip.crAccountNumber || "0987654321",
          creditAccountName: slip.crAccountName || "Test Credit Account",
          images: slip.images.join(",") || "", // Join image URLs with commas
          amountPaid: slip.amountPaid || 100,
          remark: data.remark ?? "Test transaction",
        })),
      }

      // If editing, include the record ID
      if (props.isEditing && props.recordData) {
        ;(jsonData as Record<string, any>).paymentRecordsId = props.recordData.paymentRecordsId
      }

      console.log("Sending payload:", jsonData)

      // Use the API client for the request
      let result
      if (props.isEditing) {
        result = await api.put(`payment-records/${props.recordData.paymentRecordsId}/confirmLine`, jsonData)
      } else {
        result = await api.post("/payment-records", jsonData)
      }

      toast({
        title: props.isEditing ? "Transaction updated" : "Transaction added",
        description: props.isEditing
          ? "The transaction has been updated successfully."
          : "The transaction has been added successfully.",
        variant: "success",
      })

      // Clean up previews and reset form
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
      setImageFiles([])
      setImagePreviews([])
      setSelectedHolderNames({})

      props.onOpenChange(false)
      form.reset()
      props.onSuccess?.()
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

  // const bankAccounts = [
  //   {
  //     bankName: "Bank of America",
  //     accountNumber: "123456789",
  //     accountHolder: "John Doe",
  //   },
  //   {
  //     bankName: "Wells Fargo",
  //     accountNumber: "987654321",
  //     accountHolder: "Jane Smith",
  //   },
  // ]

  // const options = bankAccounts.map((account) => ({
  //   value: account.accountNumber, // or accountName if needed
  //   label: `${account.accountNumber} (${account.bankName})`,
  //   accountHolder: account.accountHolder,
  // }))

  const shopOptions = shops.map((shop) => ({
    value: String(shop.shopBranchId),
    label: shop.shopBranchName,
  }))

  // Debug function to show form state
  const debugFormState = () => {
    const formValues = form.getValues()
    const formState = form.formState
    console.log("Current form values:", formValues)
    console.log("Form state:", formState)
    console.log("Form errors:", formState.errors)

    // Only set formErrors if there are actual errors
    if (Object.keys(formState.errors).length > 0) {
      setFormErrors(formState.errors)
    } else {
      setFormErrors(null)
      toast({
        title: "Form Validation",
        description: "No validation errors found in the form.",
        variant: "success",
      })
    }
  }

  return (
    <>
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{props.isEditing ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
            <DialogDescription>
              {props.isEditing
                ? "Update the transaction details below."
                : "Enter the transaction details below to add a new payment record."}
            </DialogDescription>
          </DialogHeader>

          {formErrors && Object.keys(formErrors).length > 0 && (
            <div className="bg-red-50 p-3 rounded border border-red-200 mb-4">
              <h4 className="text-red-800 font-medium mb-1">Form Validation Errors:</h4>
              <pre className="text-xs text-red-700 overflow-auto max-h-32">{JSON.stringify(formErrors, null, 2)}</pre>
            </div>
          )}

          <Form {...form}>
            <form
              onSubmit={(e) => {
                console.log("Form onSubmit triggered")
                form.handleSubmit(onSubmit)(e)
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                {/* Company Name */}
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          setSelectedCompanyId(value) // trigger bank fetch
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.companyId} value={String(company.companyId)}>
                              {company.companyName.charAt(0).toUpperCase() + company.companyName.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sales Person */}
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

                {/* Customer TIN with autocomplete */}
                <FormField
                  control={form.control}
                  name="customerTIN"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer TIN</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter customer TIN"
                          {...field}
                          value={selectedCustomerTin || ""}
                          onChange={(e) => {
                            const newValue = e.target.value
                            setSelectedCustomerTin(newValue)
                            field.onChange(newValue)
                            handleTinChange(newValue)
                          }}
                        />
                      </FormControl>
                      {showSuggestions && (
                        <div
                          className="suggestions"
                          style={{
                            border: "1px solid #ccc",
                            maxHeight: "150px",
                            overflowY: "auto",
                            background: "#fff",
                            position: "absolute",
                            zIndex: 1,
                            width: "100%",
                          }}
                        >
                          {suggestions.map((tin) => (
                            <div
                              key={tin}
                              onClick={() => handleSuggestionClick(tin)}
                              style={{ padding: "8px", cursor: "pointer" }}
                            >
                              {tin} - {customers[tin as keyof typeof customers]}
                            </div>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Customer Name */}
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Customer name will be auto-filled"
                          {...field}
                          value={selectedCustomerName || ""}
                          onChange={(e) => {
                            const newValue = e.target.value
                            setSelectedCustomerName(newValue) // update local state
                            field.onChange(newValue) // update RHF
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shops</FormLabel>
                      <FormControl>
                        <ReactSelect
                          isLoading={isShopLoading}
                          options={shopOptions}
                          isSearchable
                          isClearable
                          placeholder="Select shop"
                          value={shopOptions.find((option) => option.value === field.value) ?? null}
                          onChange={(option) => field.onChange(option?.value ?? "")}
                          onBlur={field.onBlur}
                          filterOption={(option, inputValue) =>
                            option.label.toLowerCase().includes(inputValue.toLowerCase())
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Total Paid Amount */}
                <FormField
                  control={form.control}
                  name="amountPaid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Paid Amount</FormLabel>
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

                <div className="col-span-2">
                  <hr className="my-4" />
                </div>

                {/* Slip Information Section */}
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Slip Information</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addSlipInfo}>
                      <Plus className="h-4 w-4 mr-1" /> Add Slip Information
                    </Button>
                  </div>
                  {(form.watch("drAccount") || []).map((slip, index) => (
                    <Card key={index} className="mb-3">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium">Slip Information {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSlipInfo(index)}
                            disabled={(form.watch("drAccount") || []).length <= 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Debited Account Number */}
                          <FormField
                            control={form.control}
                            name={`drAccount.${index}.debitedAccountNumber`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Debited Account Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter account number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Debited Account Name */}
                          <FormField
                            control={form.control}
                            name={`drAccount.${index}.debitedAccountName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Debited Account Holder</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter account holder name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* ADDED: Credit Account Number inside each slip */}

                          <FormField
                            control={form.control}
                            name={`drAccount.${index}.crAccountNumber`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Credited Account Number</FormLabel>
                                <FormControl>
                                  <ReactSelect
                                    isLoading={loadingBanks}
                                    options={accounts}
                                    isSearchable
                                    value={accounts.find((option) => option.value === field.value)}
                                    onChange={(option) => {
                                      field.onChange(option?.value)
                                      handleCreditAccountSelection(
                                        option?.value || "",
                                        option?.accountHolder || "",
                                        index,
                                      )
                                    }}
                                    onBlur={field.onBlur}
                                    placeholder="Select bank account"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* ADDED: Credit Account Name inside each slip */}
                          <FormField
                            control={form.control}
                            name={`drAccount.${index}.crAccountName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Credited Account Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Account name"
                                    value={selectedHolderNames[index] || field.value}
                                    disabled
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* Reference ID */}
                          <FormField
                            control={form.control}
                            name={`drAccount.${index}.referenceId`}
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
                          {/* Amount Paid */}
                          <FormField
                            control={form.control}
                            name={`drAccount.${index}.amountPaid`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Paid Amount</FormLabel>
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

                          {/* Transaction Date */}
                          <FormField
                            control={form.control}
                            name={`drAccount.${index}.transactionDate`}
                            render={({ field }) => (
                              <FormItem className="flex flex-col" style={{ padding: "10px 0" }}>
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

                          {/* Image Upload */}
                          <div className="col-span-2">
                            <FormLabel>Slip Images</FormLabel>
                            <div className="mt-2 flex items-center gap-2">
                              <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleImageChange(e, index)}
                                className="flex-1"
                              />
                              <Button type="button" variant="outline" size="icon">
                                <Upload className="h-4 w-4" />
                              </Button>
                            </div>
                            {props.isEditing && originalRecord?.paymentRecordLine?.[index]?.images && (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground">
                                  {typeof originalRecord.paymentRecordLine[index].images === "string"
                                    ? originalRecord.paymentRecordLine[index].images.split(",").length
                                    : Array.isArray(originalRecord.paymentRecordLine[index].images)
                                      ? originalRecord.paymentRecordLine[index].images.length
                                      : 0}{" "}
                                  existing image(s). Upload new ones to replace.
                                </p>
                                {typeof originalRecord.paymentRecordLine[index].images === "string" &&
                                  originalRecord.paymentRecordLine[index].images.split(",").map((img: string, imgIndex: number) => (
                                    <span key={imgIndex} className="text-xs text-blue-600 mr-2">
                                      {(img as string).split("/").pop()}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Image Previews */}
                <div className="col-span-2">
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

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="secondary" onClick={debugFormState}>
                  Debug Form
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? props.isEditing
                      ? "Updating..."
                      : props.isFinanceUser
                        ? "Confirming..."
                        : "Adding..."
                    : props.isEditing
                      ? "Update Transaction"
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
