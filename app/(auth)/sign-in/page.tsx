"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { FileText, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { login, isLoading, user } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Get redirect URL from query params
  const redirectUrl = searchParams.get("redirect") || "/"

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      console.log("User already logged in, redirecting to:", redirectUrl)
      router.push(redirectUrl)
    }
  }, [user, router, redirectUrl])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Update the handleSubmit function to include better error handling and debugging
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.email || !formData.password) {
      toast({
        title: "Validation error",
        description: "Please enter both email and password",
        variant: "destructive",
      })
      return
    }

    console.log("Attempting login with:", formData.email)

    // Attempt login
    const success = await login(formData.email, formData.password)

    if (success) {
      // Show success toast
      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      })

      // Redirect to the requested page or dashboard after a short delay
      // The delay ensures the token is properly stored before navigation
      setTimeout(() => {
        console.log("Redirecting to:", redirectUrl)
        router.push(redirectUrl)
      }, 1000)
    } else {
      // Show error toast
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="ml-2 rounded-md bg-primary p-1">
                <img src="/logo.png" alt="Logo" className="h-16 w-16 object-contain" />
            </div>
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-muted-foreground">Enter your credentials to access your account</p>
        </div>
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-primary underline-offset-4 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="#" className="text-primary underline-offset-4 hover:underline">
              Contact administrator
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
