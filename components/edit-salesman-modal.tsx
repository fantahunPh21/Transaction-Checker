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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

// Define the form schema with validation
const formSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  shopIds: z.array(z.string()).min(1, "At least one shop must be selected"),
})

type FormValues = z.infer<typeof formSchema>

export function EditSalesmanModal({ open, onOpenChange, salesman, onSubmit, shops }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      shopIds: [],
    },
  })

  // Update form values when salesman changes
  useEffect(() => {
    if (salesman) {
      console.log("Salesman data for edit:", salesman)

      // Extract shop IDs from the salesman object
      const shopIds = Array.isArray(salesman.shops)
        ? salesman.shops.map((shop) => shop.id || shop.shopBranchId || "")
        : []

      form.reset({
        id: salesman.id || salesman.salesmanId || "",
        firstName: salesman.firstName || "",
        lastName: salesman.lastName || "",
        phoneNumber: salesman.phoneNumber || salesman.phone || "",
        shopIds: shopIds,
      })
    }
  }, [salesman, form])

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true)
      console.log("Submitting salesman data:", data)

      // Map selected shop IDs to shop objects
      const selectedShops = shops.filter((shop) => data.shopIds.includes(shop.id || shop.shopBranchId))

      const updatedSalesman = {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        shops: selectedShops,
      }

      await onSubmit(updatedSalesman)

      toast({
        title: "SUCCESS",
        description: "The salesman has been updated successfully.",
        variant: "success",
      })

      setTimeout(() => {
        onOpenChange(false)
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "ERROR",
        description: "Failed to update salesman. Please try again.",
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
          <DialogTitle>Edit Salesman</DialogTitle>
          <DialogDescription>Update the salesman details below.</DialogDescription>
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
            </div>

            <FormField
              control={form.control}
              name="phoneNumber"
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
              name="shopIds"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Assigned Shops</FormLabel>
                  </div>
                  <div className="space-y-2">
                    {shops.map((shop) => (
                      <FormField
                        key={shop.id || shop.shopBranchId}
                        control={form.control}
                        name="shopIds"
                        render={({ field }) => {
                          const shopId = shop.id || shop.shopBranchId
                          return (
                            <FormItem key={shopId} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(shopId)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, shopId])
                                      : field.onChange(field.value?.filter((value) => value !== shopId))
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{shop.name || shop.shopBranchName}</FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

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
