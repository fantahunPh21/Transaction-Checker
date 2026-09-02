"use client"

import type React from "react"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { MainTopbar } from "@/components/main-topbar"
import { useAuth } from "@/contexts/auth-context"

/**
 * Layout component that conditionally renders the topbar
 * Shows the topbar on all pages except sign-in and unauthorized
 * @param children - The child components to render
 */
export default function LayoutWithTopbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { checkTokenExpiration } = useAuth()

  // Paths where the topbar should not be shown
  const excludedPaths = ["/sign-in", "/unauthorized"]
  const shouldShowTopbar = !excludedPaths.includes(pathname)

  // Check token expiration on route changes
  useEffect(() => {
    if (pathname !== "/sign-in" && pathname !== "/unauthorized") {
      checkTokenExpiration()
    }
  }, [pathname, checkTokenExpiration])

  return (
    <>
      {shouldShowTopbar && <MainTopbar />}
      {children}
    </>
  )
}
