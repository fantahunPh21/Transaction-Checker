"use client"

import { useState } from "react"
import { Plus, Store, Search, MoreHorizontal, Edit, Trash } from "lucide-react"

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
import { AddShopModal } from "@/components/add-shop-modal"
import { EditShopModal } from "@/components/edit-shop-modal"
import { shopsRecord } from "@/hooks/shop-records"

export default function ShopsPage() {
  const { toast } = useToast()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedShop, setSelectedShop] = useState(null)

  const {
    shops,
    setShops,
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
  } = shopsRecord()

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading shops record...</div>
  }

  if (error) {
    return <div className="flex justify-center p-4 text-red-500">Error shops record: {error}</div>
  }

  const handleAddShop = (newShop) => {
    const shopWithId = {
      ...newShop,
      id: (shops.length + 1).toString(),
    }
    setShops([...shops, shopWithId])
    toast({
      title: "Shop Added",
      description: `${newShop.name} has been added successfully.`,
    })
  }

  const handleEditShop = (updatedShop) => {
    setShops(shops.map((shop) => (shop.id === updatedShop.id ? updatedShop : shop)))
    toast({
      title: "Shop Updated",
      description: `${updatedShop.name} has been updated successfully.`,
    })
  }

  const handleDeleteShop = (id) => {
    setShops(shops.filter((shop) => shop.id !== id))
    toast({
      title: "Shop Deleted",
      description: "The shop has been deleted successfully.",
    })
  }

  const openEditModal = (shop) => {
    setSelectedShop(shop)
    setEditModalOpen(true)
  }

  console.log(shops)

  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 w-full">
        <div className="flex items-center gap-2 font-semibold">
          <Store className="h-6 w-6" />
          <h1 className="text-xl font-semibold">Shops</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search shops..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Shop
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No shops found. Add a new shop to get started.
                  </TableCell>
                </TableRow>
              ) : (
                shops.map((shop) => (
                  <TableRow key={shop.shopBranchId}>
                    <TableCell className="font-medium">{shop.shopBranchName}</TableCell>
                    <TableCell>{shop.shopBranchPhone}</TableCell>
                    <TableCell>{shop.email}</TableCell>
                    {/* // {shop.company.name} */}
                    <TableCell>Steely</TableCell>
                    <TableCell>5</TableCell>
                    {/* // {shop.sales.length} */}
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
                          <DropdownMenuItem onClick={() => openEditModal(shop)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteShop(shop.shopBranchId)}
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
                Showing <span className="font-medium">{shops.length}</span> of{" "}
                <span className="font-medium">{totalItems}</span> shops
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

      <AddShopModal open={addModalOpen} onOpenChange={setAddModalOpen} onSubmit={handleAddShop} />

      {selectedShop && (
        <EditShopModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          shop={selectedShop}
          onSubmit={handleEditShop}
        />
      )}
    </div>
  )
}
