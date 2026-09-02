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
import { Checkbox } from "@/components/ui/checkbox"

// Define the form schema with validation
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  shopBranches: z.array(z.object({ id: z.string(), name: z.string() })),
})

type FormValues = z.infer<typeof formSchema>

interface AddSalesmanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Record<string, unknown>) => void
}

interface ShopBranchItem {
  shopId: number
  shopBranchName: string
}

export function AddSalesmanModal({ open, onOpenChange, onSubmit }: AddSalesmanModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shops, setShops] = useState<ShopBranchItem[]>([])
  const { toast } = useToast()

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      shopBranches: [],
    },
  })

  // Fetch shops when component mounts
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const token = localStorage.getItem("authToken")
        if (!token) {
          console.error("No authentication token found")
          return
        }

        const response = await fetch("http://localhost:8088/finance-payment-confirmation/api/v1/branches", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch shops: ${response.status}`)
        }

        const data = await response.json()
        setShops(data.content || [])
      } catch (error) {
        console.error("Error fetching shops:", error)
        toast({
          title: "Error",
          description: "Failed to load shops. Please try again.",
          variant: "destructive",
        })
      }
    }

    if (open) {
      fetchShops()
    }
  }, [open, toast])

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

      // Prepare the data for API
      const jsonData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        shopBranchIds: data.shopBranches.map((shop) => shop.id),
      }

      // Send the data to the API
      const response = await fetch("http://localhost:8088/finance-payment-confirmation/api/v1/users", {
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
        throw new Error(`Failed to add salesman: ${response.status} ${response.statusText}`)
      }

      const responseData = await response.json()

      toast({
        title: "Success",
        description: "Salesman added successfully",
        variant: "success",
      })

      // Call the onSubmit callback with the new salesman data
      if (onSubmit) {
        onSubmit(responseData)
      }

      // Reset the form and close the modal
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add salesman",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Salesman</DialogTitle>
          <DialogDescription>Enter the salesman details below.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
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
                      <Input type="email" placeholder="Enter email" {...field} />
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
                name="password"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Shop Branches Section */}
            <div>
              <FormLabel className="block mb-2">Assign to Shops</FormLabel>
              <div className="border rounded-md p-4 space-y-2 max-h-[200px] overflow-y-auto">
                {shops.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No shops available</p>
                ) : (
                  shops.map((shop) => (
                    <div key={shop.shopId} className="flex items-center space-x-2">
                      <Checkbox
                        id={`shop-${shop.shopId}`}
                        checked={form.watch("shopBranches").some((s) => s.id === shop.shopId.toString())}
                        onCheckedChange={(checked) => {
                          const currentShops = form.getValues("shopBranches")
                          if (checked) {
                            form.setValue("shopBranches", [
                              ...currentShops,
                              { id: shop.shopId.toString(), name: shop.shopBranchName },
                            ])
                          } else {
                            form.setValue(
                              "shopBranches",
                              currentShops.filter((s) => s.id !== shop.shopId.toString()),
                            )
                          }
                        }}
                      />
                      <label
                        htmlFor={`shop-${shop.shopId}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {shop.shopBranchName}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Salesman"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
