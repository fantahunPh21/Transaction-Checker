"use client"

import { useState } from "react"
import { Plus, Users, Search, MoreHorizontal, Edit, Trash } from "lucide-react"

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
import { AddSalesmanModal } from "@/components/add-salesman-modal"
import { usersRecord } from "@/hooks/users-record"

export default function SalesmenPage() {
  const { toast } = useToast()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedShop, setSelectedShop] = useState(null)

  const {
    users,
    setUsers,
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
  } = usersRecord()

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading shops record...</div>
  }

  if (error) {
    return <div className="flex justify-center p-4 text-red-500">Error shops record: {error}</div>
  }

  const handleAddSalesman = (newSalesman) => {
    const salesmanWithId = {
      ...newSalesman,
      id: (users.length + 1).toString(),
    }
    setUsers([...users, salesmanWithId])
    toast({
      title: "Salesman Added",
      description: `${newSalesman.firstName} ${newSalesman.lastName} has been added successfully.`,
    })
  }

  const handleEditSalesman = (updatedSalesman) => {
    setUsers(users.map((user) => (user.id === updatedSalesman.id ? updatedSalesman : user)))
    toast({
      title: "Salesman Updated",
      description: `${updatedSalesman.firstName} ${updatedSalesman.lastName} has been updated successfully.`,
    })
  }

  const handleDeleteSalesman = (id) => {
    setUsers(users.filter((user) => user.id !== id))
    toast({
      title: "Salesman Deleted",
      description: "The salesman has been deleted successfully.",
    })
  }

  const openEditModal = (user) => {
    setSelectedShop(user)
    setEditModalOpen(true)
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 w-full">
        <div className="flex items-center gap-2 font-semibold">
          <Users className="h-6 w-6" />
          <h1 className="text-xl font-semibold">Salesmen</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search salesmen..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Salesman
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Shops</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No salesmen found. Add a new salesman to get started.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium">{user.firstName}</TableCell>
                    <TableCell>{user.lastName}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      {user.shopBranches && Array.isArray(user.shopBranches) 
                        ? user.shopBranches.map((b) => b.shopBranchName).join(", ")
                        : "No branches assigned"
                      }
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => openEditModal(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteSalesman(user.id)}
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
                Showing <span className="font-medium">{users.length}</span> of{" "}
                <span className="font-medium">{totalItems}</span> salesmen
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

      <AddSalesmanModal open={addModalOpen} onOpenChange={setAddModalOpen} onSubmit={handleAddSalesman} />

      {/* {selectedSalesman && (
        <EditSalesmanModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          salesman={selectedShop}
          onSubmit={handleEditSalesman}
          shops={shops}
        />
      )} */}
    </div>
  )
}
