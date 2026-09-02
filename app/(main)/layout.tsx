import type React from "react"
import { AppTopbar } from "@/components/app-topbar"
import { ProtectedRoute } from "@/components/protected-route"

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <AppTopbar />
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
