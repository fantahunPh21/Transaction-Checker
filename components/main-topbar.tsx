"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { FileText, LogOut, Menu, Moon, Settings, Sun, User } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

/**
 * Main topbar component that appears on all pages except sign-in
 * Includes navigation, theme toggle, and user profile dropdown
 */
export function MainTopbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  /**
   * Get user initials for avatar fallback
   * @returns String with user initials or default "U"
   */
  const getUserInitials = () => {
    if (!user?.fullName) return "U"

    const names = user.fullName.split(" ")
    if (names.length === 1) return names[0][0]
    return `${names[0][0]}${names[names.length - 1][0]}`
  }

  /**
   * Get avatar URL with proper base URL if needed
   * @returns Complete avatar URL or null if not available
   */
  const getAvatarUrl = () => {
    if (!user?.avatarUrl) return null

    // Check if the URL is already absolute
    if (user.avatarUrl.startsWith("http")) {
      return user.avatarUrl
    }

    // Otherwise, prepend the API base URL
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${user.avatarUrl}`
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 sm:w-72">
            <nav className="grid gap-4 py-4 text-lg">
              <Link
                href="/"
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent",
                  pathname === "/" && "bg-accent",
                )}
                onClick={() => setOpen(false)}
              >
                <FileText className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/companies"
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent",
                  pathname === "/companies" && "bg-accent",
                )}
                onClick={() => setOpen(false)}
              >
                <FileText className="h-5 w-5" />
                Companies
              </Link>
              <Link
                href="/shops"
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent",
                  pathname === "/shops" && "bg-accent",
                )}
                onClick={() => setOpen(false)}
              >
                <FileText className="h-5 w-5" />
                Shops
              </Link>
              <Link
                href="/salesmen"
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent",
                  pathname === "/salesmen" && "bg-accent",
                )}
                onClick={() => setOpen(false)}
              >
                <FileText className="h-5 w-5" />
                Salesmen
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <span className="text-lg font-semibold">Finance Payment Confirmation</span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={getAvatarUrl() || ""} alt={user.fullName} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.username}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild variant="default" size="sm">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        )}
      </div>
    </header>
  )
}
