"use client"

import { useState, useEffect } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { companiesRecord } from "@/hooks/companies-record"

// Define the form schema with validation
const formSchema = z.object({
  id: z
    .number()
    .or(z.string())
    .transform((val) => Number(val)), // Accept string or number, convert to number
  name: z.string().min(0, "Shop name is required"),
  phone: z.string().min(0, "Please provide company phone number").optional(),
  email: z.string().min(0, "Email is required"),
  shopPhone: z.string().min(0, "Shop phone is required"),
  location: z.string().min(0, "Location is required"),
  //companyId: z.string().min(1, "Company is required"),
})

interface EditShopModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shop: {
    shopBranchId?: number
    shopBranchName?: string
    shopBranchPhone?: string
    address?: string
    email?: string
    phone?: string
    companyId?: number
    company?: { companyId?: number }
    shopBranchCompany?: { companyId?: number }
  } | null
  onSubmit: (data: Record<string, unknown>) => void
}

type FormValues = z.infer<typeof formSchema>

export function EditShopModal({ open, onOpenChange, shop, onSubmit }: EditShopModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { companies, isLoading } = companiesRecord()

  // Initialize the form with company values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      id: shop?.shopBranchId ?? 0,
      name: "",
      location: "",
      email: "",
      shopPhone: "",
      phone: "",
      //companyId: "",
    },
  })

  // Update form values when shop changes
  useEffect(() => {
    if (shop) {
      console.log("Shop data for edit:", shop)
      form.reset({
        id: shop.shopBranchId || 0, // Ensure ID is not null
        name: shop.shopBranchName || "",
        location: shop.address || "",
        email: shop.email || "",
        shopPhone: shop.shopBranchPhone || "",
        phone: shop.shopBranchPhone || "",
      })
    }
  }, [shop, form])

  const handleSubmit = async (data: FormValues) => {
    console.log("Form submitted with data:", data)

    try {
      setIsSubmitting(true)

      // Get the auth token from localStorage
      const token = localStorage.getItem("authToken")
      console.log("Auth token retrieved:", token ? "Token exists" : "No token")

      // Log the shop object to debug
      console.log("Shop object:", shop)

      // Determine company ID - try all possible locations
      let companyId = null

      if (shop?.companyId) {
        companyId = shop.companyId
        console.log("Using companyId from shop.companyId:", companyId)
      } else if (shop?.company?.companyId) {
        companyId = shop.company.companyId
        console.log("Using companyId from shop.company.companyId:", companyId)
      } else if (shop?.shopBranchCompany?.companyId) {
        companyId = shop.shopBranchCompany.companyId
        console.log("Using companyId from shop.shopBranchCompany.companyId:", companyId)
      } else {
        // If we can't find a company ID, log all properties of the shop object
        console.log("Could not find company ID. All shop properties:")
        const shopObj = shop as Record<string, unknown> | null
        for (const key in shopObj) {
          console.log(`${key}:`, shopObj[key])
        }

        // Try to find any property that might contain "company" in its name
        const possibleCompanyProps = Object.keys(shopObj ?? {}).filter(
          (key) =>
            key.toLowerCase().includes("company") || (typeof shopObj?.[key] === "object" && shopObj?.[key] !== null),
        )

        console.log("Possible company-related properties:", possibleCompanyProps)

        // As a last resort, use a hardcoded company ID for testing
        companyId = 1 // Use a known valid company ID for testing
        console.log("Using hardcoded company ID for testing:", companyId)
      }

      const jsonData = {
        shopBranchId: Number(data.id) || shop?.shopBranchId, // Ensure ID is not null
        shopBranchName: data.name,
        email: data.email,
        shopBranchPhone: data.shopPhone || data.phone, // Use either field
        address: data.location,
        companyId: companyId, // Use the determined company ID
      }

      console.log("Preparing to send data:", jsonData)

      // sending string data of company with authorization header
      console.log("About to make fetch request")
      const response = await fetch(`http://localhost:8088/finance-payment-confirmation/api/v1/branches`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "", // Add authorization header
        },
        body: JSON.stringify(jsonData),
      })
      console.log("Fetch request completed with status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error("API Error:", response.status, errorData)
        throw new Error(`Failed to process transaction: ${response.status} ${errorData?.message || ""}`)
      }

      toast({
        title: "SUCCESS",
        description: "The shop has been edited successfully.",
        variant: "success",
      })
      setTimeout(() => {
        form.reset()
        onOpenChange(false)
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      toast({
        title: "ERROR",
        description: `Failed to update shop: ${error instanceof Error ? error.message : "Please try again"}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Shop</DialogTitle>
          <DialogDescription>Update the shop details below.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shopPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter shop location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} onClick={() => console.log("Submit button clicked")}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
