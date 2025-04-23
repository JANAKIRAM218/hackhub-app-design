import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Terminal } from "lucide-react"
import { cn } from "@/lib/utils"

interface User {
  name: string
  username: string
  avatar?: string
}

interface UserAvatarProps {
  user: User
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  showBadge?: boolean
  className?: string
}

export function UserAvatar({ user, size = "md", showBadge = true, className }: UserAvatarProps) {
  // Generate a deterministic color based on the username
  const getColorClass = (username: string) => {
    const colors = [
      "bg-pink-500",
      "bg-purple-500",
      "bg-blue-500",
      "bg-cyan-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-orange-500",
      "bg-red-500",
    ]

    // Simple hash function to get a consistent index
    const hash = username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const sizeClasses = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-14 w-14 text-lg",
    xl: "h-20 w-20 text-xl",
  }

  const badgeSizeClasses = {
    xs: "h-2 w-2",
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
    xl: "h-6 w-6",
  }

  return (
    <div className={cn("relative", className)}>
      <Avatar className={cn(sizeClasses[size], "border border-border/40")}>
        <AvatarImage src={user.avatar || ""} alt={user.name} />
        <AvatarFallback className={getColorClass(user.username)}>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>

      {showBadge && (
        <div className="absolute bottom-0 right-0 rounded-full bg-background border border-border/40 flex items-center justify-center">
          <Terminal className={cn(badgeSizeClasses[size], "text-neon-green")} strokeWidth={2.5} />
        </div>
      )}
    </div>
  )
}
