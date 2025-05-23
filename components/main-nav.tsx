"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Home,
  Search,
  Compass,
  Bell,
  MessageSquare,
  Bookmark,
  User,
  Settings,
  Menu,
  X,
  LogOut,
  Plus,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/hooks/use-auth"
import { useSearch } from "@/hooks/use-search"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SearchResults } from "@/components/search-results"
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
  const pathname = usePathname()
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Search functionality
  const {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen,
    searchHistory,
    useHistoryItem,
    removeFromSearchHistory,
    clearSearchHistory,
    navigateToResult,
    navigateToSearchPage,
  } = useSearch()

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [setIsOpen])

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
    { name: "A Users", href: "/a-users", icon: User },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  // Function to check if a nav item is active
  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") {
      return true
    }
    return href !== "/" && pathname.startsWith(href)
  }

  // Function to calculate staggered animation delay
  const getAnimationDelay = (index: number) => {
    return `${50 + index * 25}ms`
  }

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigateToSearchPage()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />

        {!isMobile && (
          <div className="ml-auto flex items-center gap-2">
            <div className="relative w-64" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search HackHub..."
                    className="pl-8 bg-muted/50 border-muted focus:border-primary focus:ring-1 focus:ring-primary"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                  />
                </div>
              </form>

              {/* Search results dropdown */}
              {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border/40 rounded-md shadow-lg z-50 overflow-hidden">
                  <SearchResults
                    results={results}
                    isLoading={isLoading}
                    query={query}
                    searchHistory={searchHistory}
                    onSelect={navigateToResult}
                    onSearchAll={navigateToSearchPage}
                    onUseHistoryItem={useHistoryItem}
                    onRemoveHistoryItem={removeFromSearchHistory}
                    onClearHistory={clearSearchHistory}
                  />
                </div>
              )}
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
            "fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out",
            mobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
          )}
        >
          <div className="container py-4 bg-background">
            <div
              className={cn(
                "relative mb-4 transform opacity-0 translate-y-4",
                mobileMenuOpen && "opacity-100 translate-y-0",
              )}
              style={{
                transitionDelay: mobileMenuOpen ? "50ms" : "0ms",
                transitionDuration: "300ms",
              }}
              ref={searchContainerRef}
            >
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search HackHub..."
                    className="pl-8 bg-muted/50 border-muted focus:border-primary focus:ring-1 focus:ring-primary"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                  />
                </div>
              </form>

              {/* Mobile search results dropdown */}
              {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border/40 rounded-md shadow-lg z-50 overflow-hidden">
                  <SearchResults
                    results={results}
                    isLoading={isLoading}
                    query={query}
                    searchHistory={searchHistory}
                    onSelect={(result) => {
                      navigateToResult(result)
                      setMobileMenuOpen(false)
                    }}
                    onSearchAll={() => {
                      navigateToSearchPage()
                      setMobileMenuOpen(false)
                    }}
                    onUseHistoryItem={useHistoryItem}
                    onRemoveHistoryItem={removeFromSearchHistory}
                    onClearHistory={clearSearchHistory}
                  />
                </div>
              )}
            </div>
            <Button
              variant="outline"
              className={cn(
                "w-full mb-6 glow transform opacity-0 translate-y-4",
                mobileMenuOpen && "opacity-100 translate-y-0",
              )}
              style={{
                transitionDelay: mobileMenuOpen ? "100ms" : "0ms",
                transitionDuration: "300ms",
              }}
              onClick={() => {
                // Dispatch a custom event to open the post creation modal
                const event = new CustomEvent("open-post-modal")
                window.dispatchEvent(event)
                // Close the mobile menu
                setMobileMenuOpen(false)
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> New Post
            </Button>
            <nav className="flex flex-col space-y-1">
              {navItems.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                    "transform opacity-0 translate-x-4",
                    mobileMenuOpen && "opacity-100 translate-x-0",
                    isActive(item.href)
                      ? "bg-muted/50 text-neon-green border-l-2 border-neon-green"
                      : "hover:bg-muted/50",
                  )}
                  style={{
                    transitionDelay: mobileMenuOpen ? getAnimationDelay(index) : "0ms",
                    transitionDuration: "300ms",
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className={cn("h-5 w-5", isActive(item.href) && "text-neon-green")} />
                  {item.name}
                </Link>
              ))}
              <button
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/50 text-red-400 w-full text-left mt-4",
                  "transform opacity-0 translate-x-4",
                  mobileMenuOpen && "opacity-100 translate-x-0",
                )}
                style={{
                  transitionDelay: mobileMenuOpen ? getAnimationDelay(navItems.length) : "0ms",
                  transitionDuration: "300ms",
                }}
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
