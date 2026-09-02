"use client"

import { useState } from "react"
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
  name: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  logo: z.instanceof(File).refine((file) => file.size > 0, { message: "Logo is required" }),
  tin: z.string().min(1, "TIN is required"),
  email: z.string().min(1, "Email is required"),
  phoneNumber: z.string().min(1, "Phone is required"),
  // shops: z.array(
  //   z.object({
  //     name: z.string().min(1, "Shop name is required"),
  //     location: z.string().min(1, "Location is required"),
  //   }),
  // ),
  bankAccounts: z.array(
    z.object({
      bankName: z.string().min(1, "Bank name is required"),
      accountNumber: z.string().min(1, "Account number is required"),
      accountHolder: z.string().min(1, "Account holder is required"),
    }),
  ),
})

type FormValues = z.infer<typeof formSchema>

interface AddCompanyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Record<string, unknown>) => void
}

export function AddCompanyModal({ open, onOpenChange, onSubmit }: AddCompanyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      tin: "",
      email: "",
      phoneNumber: "",
      //shops: [{ name: "", location: "" }],
      bankAccounts: [{ bankName: "", accountNumber: "", accountHolder: "" }],
    },
  })

  async function handleSubmit(data: FormValues) {
    try {
      setIsSubmitting(true)

      // Get authentication token
      const token = localStorage.getItem("authToken")
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You need to be logged in to perform this action.",
          variant: "destructive",
        })
        return
      }

      // =======> UPLOAD COMPANY LOGO <=========
      const logoUpload = await FileUploader.uploadFile({
        endpoint: "http://localhost:8088/finance-payment-confirmation/api/v1/upload/file", // Replace with your endpoint
        file: data.logo, // File object
        entityData: data.name, // Additional form data to send with the file
        uploadedImageNames: [],
      })

      if (logoUpload.status == false) {
        throw new Error(logoUpload.content)
      }

      const jsonData = {
        companyName: data.name,
        companyEmail: data.email,
        logo: logoUpload.content,
        companyPhone: data.phoneNumber,
        bankAccount: data.bankAccounts,
        location: data.address,
        tinNumber: data.tin,
      }
      console.log(jsonData)

      // sending string data of company
      const response = await fetch(`http://localhost:8088/finance-payment-confirmation/api/v1/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jsonData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API error:", response.status, errorText)
        throw new Error(`Failed to register company: ${response.status} ${response.statusText}`)
      }

      toast({
        title: "SUCCESS",
        description: "The company has been added successfully.",
        variant: "success",
      })
      setTimeout(() => {
        form.reset()
        onOpenChange(false)
      }, 1000)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register company",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // const addShop = () => {
  //   const currentShops = form.getValues("shops")
  //   form.setValue("shops", [...currentShops, { name: "", location: "" }])
  // }

  // const removeShop = (index: number) => {
  //   const currentShops = form.getValues("shops")
  //   if (currentShops.length > 1) {
  //     form.setValue(
  //       "shops",
  //       currentShops.filter((_, i) => i !== index),
  //     )
  //   }
  // }

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
          <DialogTitle>Add New Company</DialogTitle>
          <DialogDescription>Enter the company details below.</DialogDescription>
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
                      <Input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            field.onChange(file) // Store the File object in the form state
                          }
                        }}
                      />
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

            {/* Shops Section
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Shops</h3>
                <Button type="button" variant="outline" size="sm" onClick={addShop}>
                  <Plus className="h-4 w-4 mr-1" /> Add Shop
                </Button>
              </div>

              {form.watch("shops").map((_, index) => (
                <Card key={index} className="mb-3">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Shop {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeShop(index)}
                        disabled={form.watch("shops").length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`shops.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shop Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter shop name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`shops.${index}.location`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter location" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div> */}

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
                      <FormField
                        control={form.control}
                        name={`bankAccounts.${index}.bankName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <select
                                  {...field} // Bind the field to the form state
                                  className="w-full h-10 border rounded-md bg-white pr-10 pl-3 py-2 appearance-none overflow-y-auto"
                                  style={{ overflowY: "auto" }}
                                  onChange={(e) => field.onChange(e.target.value)} // Update the form state on selection
                                  value={field.value} // Bind the selected value
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
                                {/* Dropdown SVG Icon */}
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
                      <FormField
                        control={form.control}
                        name={`bankAccounts.${index}.accountHolder`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Holder</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter account holder name" {...field} />
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
                {isSubmitting ? "Saving..." : "Save Company"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
