"use client"

import Link from "next/link"
import { Home, Compass, Bell, MessageSquare, Bookmark, User, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const isMobile = useMobile()

  if (isMobile) return null

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Bookmarks", href: "/bookmarks", icon: Bookmark },
    { name: "A Users", href: "/a-users", icon: Users },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                <item.icon className="mr-3 h-5 w-5 group-hover:text-neon-green transition-colors" />
                <span className="group-hover:text-neon-green transition-colors">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
