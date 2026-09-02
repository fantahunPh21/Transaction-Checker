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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Define the form schema with validation
const formSchema = z.object({
  name: z.string().min(1, "Shop name is required"),
  location: z.string().min(1, "Location is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z.string().min(0, "Phone number is required"),
  companyId: z.string().min(1, "Company is required"),
})

type FormValues = z.infer<typeof formSchema>

export function AddShopModal({ open, onOpenChange, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [companies, setCompanies] = useState([])
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false)
  const { toast } = useToast()

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      email: "",
      phone: "",
      companyId: "",
    },
  })

  // Fetch companies for the dropdown
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoadingCompanies(true)
        // Get auth token
        const token = localStorage.getItem("authToken")
        if (!token) {
          throw new Error("Authentication token not found")
        }

        const response = await fetch("http://localhost:8088/finance-payment-confirmation/api/v1/companies", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch companies")
        }

        const data = await response.json()
        console.log("Companies data:", data)

        // Check if data is an object with content property (paginated response)
        if (data && data.content && Array.isArray(data.content)) {
          setCompanies(data.content)
        }
        // Check if data is already an array
        else if (Array.isArray(data)) {
          setCompanies(data)
        }
        // If neither, log error and set empty array
        else {
          console.error("Unexpected companies data format:", data)
          setCompanies([])
        }
      } catch (error) {
        console.error("Error fetching companies:", error)
        toast({
          title: "Error",
          description: "Failed to load companies. Please try again.",
          variant: "destructive",
        })
        setCompanies([])
      } finally {
        setIsLoadingCompanies(false)
      }
    }

    if (open) {
      fetchCompanies()
    }
  }, [open, toast])

  async function handleSubmit(data: FormValues) {
    try {
      setIsSubmitting(true)

      // Get auth token
      const token = localStorage.getItem("authToken")
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You need to be logged in to perform this action.",
          variant: "destructive",
        })
        return
      }

      const shopData = {
        shopBranchName: data.name,
        location: data.location,
        email: data.email,
        phone: data.phone,
        companyId: Number.parseInt(data.companyId),
      }

      console.log("Submitting shop data:", shopData)

      const response = await fetch("http://localhost:8088/finance-payment-confirmation/api/v1/branches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(shopData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API error:", response.status, errorText)

        if (response.status === 403) {
          throw new Error("You don't have permission to add a shop. Please contact an administrator.")
        } else {
          throw new Error(`Failed to add shop: ${response.status} ${response.statusText}`)
        }
      }

      toast({
        title: "SUCCESS",
        description: "The shop has been added successfully.",
        variant: "success",
      })

      setTimeout(() => {
        form.reset()
        onOpenChange(false)
        // Refresh the page to show the new shop
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add shop",
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
          <DialogTitle>Add New Shop</DialogTitle>
          <DialogDescription>Enter the shop details below.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingCompanies ? (
                        <SelectItem value="loading" disabled>
                          Loading companies...
                        </SelectItem>
                      ) : companies && companies.length > 0 ? (
                        companies.map((company) => (
                          <SelectItem key={company.companyId} value={company.companyId.toString()}>
                            {company.companyName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No companies available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                name="location"
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

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Shop"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
