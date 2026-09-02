"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, Store, Users, Menu, Moon, Sun, LogOut, User, Settings, Bell } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "@/components/theme-provider"

export function AppTopbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Navigation items with icons
  const navItems = [
    { name: "Dashboard", href: "/", icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    { name: "Companies", href: "/companies", icon: <Building2 className="h-4 w-4 mr-2" /> },
    { name: "Shops", href: "/shops", icon: <Store className="h-4 w-4 mr-2" /> },
    { name: "Salesmen", href: "/salesmen", icon: <Users className="h-4 w-4 mr-2" /> },
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.fullName) return "U"

    const names = user.fullName.split(" ")
    if (names.length === 1) return names[0][0]
    return `${names[0][0]}${names[names.length - 1][0]}`
  }

  // Get avatar URL
  const getAvatarUrl = () => {
    if (!user?.avatarUrl) return null

    // Check if the URL is already absolute
    if (user.avatarUrl.startsWith("http")) {
      return user.avatarUrl
    }

    // Otherwise, prepend the API base URL
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${user.avatarUrl}`
  }

  // Check if a path is active (exact match or starts with for nested routes)
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex h-full flex-col">
                <div className="flex items-center border-b py-4">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                    <div className="rounded-md bg-primary p-1">
                      <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-semibold">Finance Payment Confirmation</span>
                  </Link>
                </div>
                <nav className="flex-1 overflow-auto py-6">
                  <div className="grid gap-2 px-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          isActive(item.href) ? "bg-accent text-accent-foreground" : "transparent",
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </nav>
                {user && (
                  <div className="border-t p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={getAvatarUrl() || ""} alt={user.fullName} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.fullName}</span>
                        <span className="text-xs text-muted-foreground">{user.username}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="hidden md:flex items-center gap-2">
            <div className="ml-2 rounded-md bg-primary p-1">
                <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
            </div>
            <span className="text-xl font-semibold">Finance Payment Confirmation</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  3
                </Badge>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <span className="font-medium">Notifications</span>
                <Button variant="ghost" size="sm" className="text-xs">
                  Mark all as read
                </Button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-accent cursor-pointer border-b">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>SY</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">New transaction</span> has been added
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 hover:bg-accent cursor-pointer border-b">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Payment confirmed</span> for invoice #1234
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 hover:bg-accent cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">New shop</span> has been registered
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-2 border-t">
                <Button variant="outline" className="w-full text-sm">
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {mounted && theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Menu */}
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
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-3 p-3 border-b">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getAvatarUrl() || ""} alt={user.fullName} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.fullName}</span>
                    <span className="text-xs text-muted-foreground">{user.username}</span>
                  </div>
                </div>
                <div className="p-1">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <div className="p-1">
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
