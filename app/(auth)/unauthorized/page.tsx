"use client"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center space-y-2">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
        <div className="flex flex-col space-y-4">
          <Button onClick={() => router.push("/")} variant="default">
            Go to Dashboard
          </Button>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
          <div className="text-sm text-muted-foreground">
            If you believe this is an error, please contact your administrator.
          </div>
        </div>
      </div>
    </div>
  )
}
