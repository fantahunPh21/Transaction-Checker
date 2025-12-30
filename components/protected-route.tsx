"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, hasAnyRole } from "@/lib/auth"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
}

export function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication...")

      // Check if user is authenticated
      const authenticated = isAuthenticated()
      console.log("Is authenticated:", authenticated)

      if (!authenticated) {
        // Redirect to login if not authenticated
        const currentPath = window.location.pathname
        console.log("Not authenticated, redirecting to login. Current path:", currentPath)
        router.push(`/sign-in?redirect=${encodeURIComponent(currentPath)}`)
        return
      }

      // If roles are required, check if user has any of them
      if (requiredRoles.length > 0) {
        const authorized = hasAnyRole(requiredRoles)
        console.log("Required roles:", requiredRoles, "Is authorized:", authorized)

        if (!authorized) {
          // Redirect to unauthorized page if user doesn't have required roles
          console.log("Not authorized, redirecting to unauthorized page")
          router.push("/unauthorized")
          return
        }

        setIsAuthorized(true)
      } else {
        // If no specific roles required, just being authenticated is enough
        setIsAuthorized(true)
      }

      setIsChecking(false)
    }

    checkAuth()
  }, [router, requiredRoles])

  if (isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return isAuthorized ? <>{children}</> : null
}
