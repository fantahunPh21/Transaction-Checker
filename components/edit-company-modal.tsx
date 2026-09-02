"use client"

import { useState, useEffect } from "react"
import { X, Plus } from "lucide-react"
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
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

import FileUploader from "./file-uploader"

interface FileUploaderState {
  entity: string
  file: File
}

// Define the form schema with validation
const formSchema = z.object({
  id: z.number(),
  name: z.string().min(0, "Company name is required"),
  address: z.string().min(0, "Address is required"),
  logo: z
    .any()
    .refine((file) => file === null || (file instanceof File && file.size > 0) || typeof file === "string", {
      message: "Invalid file",
    })
    .optional(),
  tin: z.string().min(0, "TIN is required"),
  email: z.string().min(1, "Email is required"),
  phoneNumber: z.string().min(1, "Phone is required"),
  bankAccounts: z.array(
    z.object({
      id: z.string().optional(),
      bankName: z.string().min(1, "Bank name is required"),
      accountNumber: z.string().min(1, "Account number is required"),
      accountHolder: z.string().min(1, "Account holder is required"),
    }),
  ),
})

type FormValues = z.infer<typeof formSchema>

interface EditCompanyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: {
    companyId: number
    companyName?: string
    companyEmail?: string
    companyPhone?: string
    TinNumber?: string
    tin?: string
    location?: string
    logo?: string | null
    bankAccount?: Array<{ id?: string; bankName?: string; accountNumber?: string; accountHolder?: string }>
  } | null
  onSubmit: (data: Record<string, unknown>) => void
}

export function EditCompanyModal({ open, onOpenChange, company, onSubmit }: EditCompanyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Initialize the form with company values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: company?.companyId ?? 0,
      name: "",
      address: "",
      tin: "",
      email: "",
      phoneNumber: "",
      bankAccounts: [{ bankName: "", accountNumber: "", accountHolder: "" }],
    },
  })

  // Update form values when company changes
  useEffect(() => {
    if (company) {
      console.log("Company data for edit:", company)

      // Ensure bankAccounts is properly formatted
      const bankAccounts =
        Array.isArray(company.bankAccount) && company.bankAccount.length > 0
          ? company.bankAccount.map((account) => ({
              id: account.id || "",
              bankName: account.bankName || "",
              accountNumber: account.accountNumber || "",
              accountHolder: account.accountHolder || "",
            }))
          : [{ bankName: "", accountNumber: "", accountHolder: "" }]

      form.reset({
        id: company.companyId,
        name: company.companyName || "",
        tin: company.TinNumber || company.tin || "",
        email: company.companyEmail || "",
        phoneNumber: company.companyPhone || "",
        address: company.location || "",
        logo: company.logo || undefined,
        bankAccounts: bankAccounts,
      })
    }
  }, [company, form])

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true)
      console.log("Submitting company data:", data)

      // Get auth token
      const token = localStorage.getItem("authToken")
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      const jsonData = {
        companyId: data.id,
        companyName: data.name,
        companyEmail: data.email,
        logo:
          data.logo instanceof File && data.logo.size > 0
            ? data.logo.name
            : typeof data.logo === "string"
              ? data.logo
              : "",
        companyPhone: data.phoneNumber,
        location: data.address,
        tin: data.tin,
      }

      // sending string data of company with auth token
      const stringData = JSON.stringify(jsonData)
      const response = await fetch(`http://localhost:8088/finance-payment-confirmation/api/v1/companies`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add auth token
        },
        body: stringData,
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("You don't have permission to update company information.")
        }
        throw new Error("Failed to process transaction")
      }

      // ==========> CHANGE BANK ACCOUNTS <============
      if (data.bankAccounts && data.bankAccounts.length > 0) {
        const bankAccountPayload = data.bankAccounts.map((account) => ({
          bankName: account.bankName,
          accountNumber: account.accountNumber,
          accountHolder: account.accountHolder,
        }))

        const changeBankAccounts = await fetch(
          `http://localhost:8088/finance-payment-confirmation/api/v1/companies/account/${data.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Add auth token
            },
            body: JSON.stringify(bankAccountPayload),
          },
        )
        if (!changeBankAccounts.ok) {
          toast({
            title: "ERROR",
            description: "Error occurred while changing bank accounts.",
            variant: "destructive",
          })
        }
      }

      // =========> UPLOAD LOGO IF AVAILABLE <==============
      let is_logoUpload = false
      if (data.logo instanceof File && data.logo.size > 0) {
        const logoUpload = await FileUploader.uploadFile({
          endpoint: "http://localhost:8088/finance-payment-confirmation/api/v1/upload/file",
          file: data.logo,
          entityData: data.name,
          token: token, // Pass token to FileUploader
        })
        if (logoUpload) {
          is_logoUpload = true
          toast({
            title: "SUCCESS",
            description: "The company has been edited successfully.",
            variant: "success",
          })
          setTimeout(() => {
            form.reset()
            onOpenChange(false)
            window.location.reload()
          }, 2000)
        } else {
          is_logoUpload = true
          toast({
            title: "ERROR",
            description: "Error occurred while registering company.",
            variant: "destructive",
          })
        }
      }

      if (!is_logoUpload) {
        toast({
          title: "SUCCESS",
          description: "The company has been edited successfully.",
          variant: "success",
        })
        setTimeout(() => {
          form.reset()
          onOpenChange(false)
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "ERROR",
        description: error instanceof Error ? error.message : "Failed to update company. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addBankAccount = () => {
    const currentAccounts = form.getValues("bankAccounts")
    form.setValue("bankAccounts", [...currentAccounts, { bankName: "", accountNumber: "", accountHolder: "" }])
  }

  const removeBankAccount = (index: number) => {
    const currentAccounts = form.getValues("bankAccounts")
    if (currentAccounts.length > 1) {
      form.setValue(
        "bankAccounts",
        currentAccounts.filter((_, i) => i !== index),
      )
    }
  }

  const bankNames = [
    "Commercial Bank of Ethiopia",
    "Awash International Bank",
    "Bank of Abyssinia",
    "Dashen Bank",
    "Zemen Bank",
    "Nib International Bank",
    "United Bank",
    "Oromia International Bank",
    "Wegagen Bank",
    "Lion International Bank",
    "Abay Bank",
    "Bunna International Bank",
    "Enat Bank",
    "Berhan International Bank",
    "Cooperative Bank of Oromia",
    "Hibret Bank",
    "Samson Bank",
    "CBE Birr",
    "Berhan Bank",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>Update the company details below.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
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
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {typeof field.value === "string" && field.value && (
                          <div className="text-sm text-muted-foreground mb-2">Current logo: {field.value}</div>
                        )}
                        <Input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              field.onChange(file) // Store the File object in the form state
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TIN</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter TIN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bank Accounts Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Bank Accounts</h3>
                <Button type="button" variant="outline" size="sm" onClick={addBankAccount}>
                  <Plus className="h-4 w-4 mr-1" /> Add Bank Account
                </Button>
              </div>

              {form.watch("bankAccounts").map((_, index) => (
                <Card key={index} className="mb-3">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Bank Account {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBankAccount(index)}
                        disabled={form.watch("bankAccounts").length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Bank Name - now a select with case-insensitive match */}
                      <FormField
                        control={form.control}
                        name={`bankAccounts.${index}.bankName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <select
                                  name={field.name}
                                  onChange={(e) => field.onChange(e.target.value)}
                                  className="w-full h-10 border rounded-md bg-white pr-10 pl-3 py-2 appearance-none overflow-y-auto"
                                  value={
                                    bankNames.find(
                                      (name) => name.toLowerCase() === (field.value || "").toLowerCase(),
                                    ) ||
                                    field.value ||
                                    ""
                                  }
                                >
                                  <option value="" disabled>
                                    Select a bank
                                  </option>
                                  {bankNames.map((bankName, idx) => (
                                    <option key={idx} value={bankName}>
                                      {bankName}
                                    </option>
                                  ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M5 7l5 5 5-5" />
                                  </svg>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Account Number */}
                      <FormField
                        control={form.control}
                        name={`bankAccounts.${index}.accountNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter account number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Account Holder */}
                      <FormField
                        control={form.control}
                        name={`bankAccounts.${index}.accountHolder`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Holder</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter branch" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
