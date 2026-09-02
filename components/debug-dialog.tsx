"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function DebugDialog() {
  const [isOpen, setIsOpen] = useState(false)

  console.log("🐛 DebugDialog rendered, isOpen:", isOpen)

  return (
    <div>
      <Button 
        onClick={() => {
          console.log("🐛 Debug button clicked!")
          setIsOpen(true)
        }}
        variant="default"
        size="sm"
      >
        Debug Dialog Test
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Debug Dialog</DialogTitle>
            <DialogDescription>This is a debug dialog to test functionality.</DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <p>Dialog is working!</p>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
