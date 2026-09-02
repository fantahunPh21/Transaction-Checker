"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { rolesRecord } from "@/hooks/roles-record"

interface AssignRoleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssignRole: (userId: number | undefined, roleId: string) => Promise<void>
  onRemoveRole: (userId: number | undefined, roleId: number | undefined) => Promise<void>
  user: {
    id?: number
    firstName?: string
    lastName?: string
    roles?: Array<{
      id?: number
      roleId?: number
      name?: string
      roleName?: string
    }>
  } | null
}

export function AssignRoleModal({ open, onOpenChange, user, onAssignRole, onRemoveRole }: AssignRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { roles, isLoading: isRolesLoading } = rolesRecord()

  // Reset selected role when modal opens
  useEffect(() => {
    if (open) {
      setSelectedRole("")
    }
  }, [open])

  const handleAssignRole = async () => {
    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select a role to assign",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await onAssignRole(user?.id, selectedRole)

      toast({
        title: "SUCCESS",
        description: "Role assigned successfully",
        variant: "success",
      })

      setSelectedRole("")
    } catch (error) {
      console.error("Error assigning role:", error)
      toast({
        title: "ERROR",
        description: "Failed to assign role. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveRole = async (roleId: number | undefined) => {
    try {
      await onRemoveRole(user?.id, roleId)

      toast({
        title: "SUCCESS",
        description: "Role removed successfully",
        variant: "success",
      })
    } catch (error) {
      console.error("Error removing role:", error)
      toast({
        title: "ERROR",
        description: "Failed to remove role. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Filter out roles that the user already has
  const availableRoles = roles.filter(
    (role) => !user?.roles?.some((userRole) => userRole.id === role.roleId || userRole.roleId === role.roleId),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage User Roles</DialogTitle>
          <DialogDescription>
            Assign or remove roles for {user?.firstName} {user?.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Current Roles</h3>
            <div className="flex flex-wrap gap-2">
              {user?.roles && user.roles.length > 0 ? (
                user.roles.map((role) => (
                  <Badge key={role.id || role.roleId} variant="outline" className="flex items-center gap-1 py-1">
                    {role.name || role.roleName}
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(role.id || role.roleId)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X size={14} />
                      <span className="sr-only">Remove role</span>
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No roles assigned</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Assign New Role</h3>
            <div className="flex gap-2">
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
                disabled={isRolesLoading || availableRoles.length === 0}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {isRolesLoading ? (
                    <div className="p-2 text-sm text-muted-foreground">Loading roles...</div>
                  ) : availableRoles.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No more roles available</div>
                  ) : (
                    availableRoles.map((role) => (
                      <SelectItem key={role.roleId} value={String(role.roleId)}>
                        {(role.roleName ?? role.name ?? "").charAt(0).toUpperCase() +
                          (role.roleName ?? role.name ?? "").slice(1).toLowerCase()}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button onClick={handleAssignRole} disabled={!selectedRole || isSubmitting}>
                {isSubmitting ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
