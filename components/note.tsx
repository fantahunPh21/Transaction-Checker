"use client"

import { SelectGroup } from "@/components/ui/select"

import { SelectItem } from "@/components/ui/select"

import { SelectValue } from "@/components/ui/select"

import { useEffect } from "react"

import { useState } from "react"

import { Textarea } from "@/components/ui/textarea"

import { Calendar } from "@/components/ui/calendar"

import { PopoverContent } from "@/components/ui/popover"

import { Button } from "@/components/ui/button"

import { PopoverTrigger } from "@/components/ui/popover"

import { Popover } from "@/components/ui/popover"

import { FormMessage } from "@/components/ui/form"

import { Input } from "@/components/ui/input"

import { FormControl } from "@/components/ui/form"

import { FormLabel } from "@/components/ui/form"

import { FormItem } from "@/components/ui/form"

import { FormField } from "@/components/ui/form"
;<div className="grid grid-cols-2 gap-4">
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

  {/* Transaction Reference */}
  <FormField
    control={form.control}
    name="transactionReference"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Transaction Reference</FormLabel>
        <FormControl>
          <Input placeholder="Enter transaction reference" {...field} />
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
                className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
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

const jsonData = {
    "companyName": data.companyName,
    "referenceId": data.referenceId,
    "customerName": data.customerName,
    "debitAccountNo": data.drAccountNumber,
    "debitAccountName": data.drAccountName,
    "creditAccountName": data.crAccountName,
    "creditAccountNo": data.crAccountNumber,\
"amountPaid\": data.,
    "salesPerson": "",
    "remark": ""
  }

export function usePaymentRecords() {
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("http://192.168.90.102:8088/api/v1/payment-records")

        if (!response.ok) {
          throw new Error(`Failed to fetch payment records: ${response.status}`)
        }

        const result = await response.json()
        console.log("Fetched content:", result.content)
        setRecords(result.content) // store the array
      } catch (err) {
        console.error("Error fetching payment records:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { records, isLoading, error } // <-- FIXED HERE
}

toast({
  title: "Processing Action",
  description: `Processing action for record #${record.paymentRecordsId}`,
})
onConfirm() < FormField
control={form.control}
name = "email"
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
                              control=
{
  form.control
}
name = "phoneNumber"
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



                            <SelectTrigger className="w-full border rounded-md h-10">
{
  /* Add border and height */
}
;<SelectValue placeholder="Select a bank" />
</SelectTrigger>
                                                          <SelectContent>
{
  /* Proper max height and scroll */
}
;<div className="max-h-48 overflow-y-auto w-full border bg-white rounded-md shadow-md">
  {bankNames.map((bankName, idx) => (
    <SelectItem key={idx} value={bankName}>
      {bankName}
    </SelectItem>
  ))}
</div>
</SelectContent>










<div className="pagination-controls">
{
  /* Page Size Dropdown */
}
;(
  <label htmlFor="page-size" className="page-size-label">
    Page Size:{" "}
  </label>
) < select
id = "page-size"
value = { pageSize }
onChange = { handlePageSizeChange }
className = "page-size-dropdown" > <option value={2}>2</option> < option
value={5}>5
</option>
;(<option value={10}>10</option>) < option
value={20}>20
</option>
</select>

{
  /* Previous Button */
}
;<button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">
  Previous
</button>

{
  /* Page Numbers */
}
;<div className="page-numbers">
  {pageNumbers.map((pageNumber) => (
    <button
      key={pageNumber}
      onClick={() => handlePageChange(pageNumber)}
      disabled={currentPage === pageNumber}
      className={`page-number-btn ${currentPage === pageNumber ? "active" : ""}`}
    >
      {pageNumber}
    </button>
  ))}
</div>

{
  /* Next Button */
}
;<button
  onClick={() => handlePageChange(currentPage + 1)}
  disabled={currentPage === totalPages}
  className="pagination-btn"
>
  Next
</button>
</div>




<FormField
  control=
{
  form.control
}
name = "shopsList"
render={({ field }) => (
    <FormItem>
      <FormLabel>Shops</FormLabel>
      <Select
        onValueChange={(val) => {
          const newValue = field.value.includes(val)
            ? field.value.filter((v: string) => v !== val)
            : [...field.value, val]
field.onChange(newValue)
}}
        value=
{
  field.value
}
>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select shops" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
{
  isShopsLoading ? (
    <div className="p-2 text-sm text-muted-foreground">Loading shops...</div>
  ) : (
    shops.map((s) => (
      <SelectGroup key={s.shopBranchId} value={String(s.shopBranchId)}>
        <div className="flex items-center gap-2">
          <input type="checkbox" readOnly checked={field.value?.includes(String(s.shopBranchId))} className="h-4 w-4" />
          {s.shopBranchName.charAt(0).toUpperCase() + s.shopBranchName.slice(1).toLowerCase()}
        </div>
      </SelectGroup>
    ))
  )
}
</SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
