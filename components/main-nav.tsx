"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Home, Search, Compass, Bell, MessageSquare, Bookmark, User, Settings, Menu, X, LogOut } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function MainNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useMobile()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Bookmarks", href: "/bookmarks", icon: Bookmark },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />

        {!isMobile && (
          <div className="ml-auto flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search HackHub..."
                className="pl-8 bg-muted/50 border-muted focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button variant="outline" className="ml-2 glow">
              New Post
            </Button>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">@{user.username}</p>
                    </div>
                  </DropdownMenuLabel>
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
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}

        {isMobile && (
          <div className="ml-auto flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="container py-4">
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search HackHub..."
                className="pl-8 bg-muted/50 border-muted focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button variant="outline" className="w-full mb-6 glow">
              New Post
            </Button>
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
              <button
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/50 text-red-400 w-full text-left mt-4"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Log out
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
