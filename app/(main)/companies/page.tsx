"use client"

import { useState } from "react"
import { Plus, Building2, Search, MoreHorizontal, Edit, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { AddCompanyModal } from "@/components/add-company-modal"
import { EditCompanyModal } from "@/components/edit-company-modal"
import { companiesRecord } from "@/hooks/companies-record"

export default function CompaniesPage() {
  const { toast } = useToast()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(null)

  const {
    companies,
    setCompanies,
    totalItems,
    isLoading,
    error,
    currentPage,
    pageSize,
    setCurrentPage,
    handlePageChange,
    handlePageSizeChange,
    searchQuery,
    setSearchQuery,
  } = companiesRecord()

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading companies record...</div>
  }

  if (error) {
    return <div className="flex justify-center p-4 text-red-500">Error companies record: {error}</div>
  }

  const handleAddCompany = (newCompany) => {
    toast({
      title: "Company Added",
      description: `${newCompany.name} has been added successfully.`,
    })
  }

  const handleEditCompany = (updatedCompany) => {
    setCompanies(companies.map((company) => (company.id === updatedCompany.id ? updatedCompany : company)))
    toast({
      title: "Company Updated",
      description: `${updatedCompany.name} has been updated successfully.`,
    })
  }

  const handleDeleteCompany = (id) => {
    setCompanies(companies.filter((company) => company.companyId !== id))
    toast({
      title: "Company Deleted",
      description: "The company has been deleted successfully.",
    })
  }

  const openEditModal = (company) => {
    console.log(company)
    setSelectedCompany(company)
    setEditModalOpen(true)
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 w-full">
        <div className="flex items-center gap-2 font-semibold">
          <Building2 className="h-6 w-6" />
          <h1 className="text-xl font-semibold">Companies</h1>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search companies..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>
        <div className="rounded-md border overflow-x-auto w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>TIN</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Shops</TableHead>
                <TableHead>Bank Accounts</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No companies found. Add a new company to get started.
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((company) => (
                  <TableRow key={company.companyId}>
                    <TableCell className="font-medium">{company.companyName}</TableCell>
                    <TableCell>{company.tinNumber}</TableCell>
                    <TableCell>{company.companyEmail}</TableCell>
                    <TableCell>{company.companyPhone}</TableCell>
                    <TableCell>{company.shopBranch.length}</TableCell>
                    <TableCell>{company.bankAccount.length}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditModal(company)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteCompany(company.companyId)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between space-x-2 py-4 px-4">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{companies.length}</span> of{" "}
                <span className="font-medium">{totalItems}</span> companies
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">Rows per page</p>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => handlePageSizeChange({ target: { value } })}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 20, 50].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(null, Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <div className="flex items-center justify-center text-sm font-medium">
                Page {currentPage + 1} of {Math.ceil(totalItems / pageSize)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(null, Math.min(Math.ceil(totalItems / pageSize) - 1, currentPage + 1))}
                disabled={currentPage >= Math.ceil(totalItems / pageSize) - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>

      <AddCompanyModal open={addModalOpen} onOpenChange={setAddModalOpen} onSubmit={handleAddCompany} />

      {selectedCompany && (
        <EditCompanyModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          company={selectedCompany}
          onSubmit={handleEditCompany}
        />
      )}
    </div>
  )
}
