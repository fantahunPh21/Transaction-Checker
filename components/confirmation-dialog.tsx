"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  onConfirmAll?: () => void
  confirmButtonText?: string
  confirmAllButtonText?: string
  cancelButtonText?: string
  isConfirmationInProgress?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onConfirmAll,
  confirmButtonText = "Confirm Selected",
  confirmAllButtonText = "Confirm All",
  cancelButtonText = "Cancel",
  isConfirmationInProgress = false,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isConfirmationInProgress}>
            {cancelButtonText}
          </Button>
          <div className="flex gap-2">
            {onConfirmAll && (
              <Button
                variant="default"
                onClick={onConfirmAll}
                disabled={isConfirmationInProgress}
                className="bg-green-600 hover:bg-green-700"
              >
                {isConfirmationInProgress ? "Processing..." : confirmAllButtonText}
              </Button>
            )}
            <Button variant="default" onClick={onConfirm} disabled={isConfirmationInProgress}>
              {isConfirmationInProgress ? "Processing..." : confirmButtonText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
