"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

interface SuggestedUser {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
}

interface SuggestedUsersProps {
  users: SuggestedUser[]
}

export function SuggestedUsers({ users }: SuggestedUsersProps) {
  const [followedUsers, setFollowedUsers] = useState<Record<string, boolean>>({})

  // Load followed users from localStorage on mount
  useEffect(() => {
    const storedFollows = localStorage.getItem("hackhub-follows")
    if (storedFollows) {
      try {
        setFollowedUsers(JSON.parse(storedFollows))
      } catch (error) {
        console.error("Failed to parse follows:", error)
      }
    }
  }, [])

  // Handle follow/unfollow
  const toggleFollow = (userId: string) => {
    const newFollowedUsers = {
      ...followedUsers,
      [userId]: !followedUsers[userId],
    }

    setFollowedUsers(newFollowedUsers)
    localStorage.setItem("hackhub-follows", JSON.stringify(newFollowedUsers))
  }

  return (
    <Card className="border-border/40 bg-background/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-neon-green" />
          <span>Who to Follow</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-start gap-3">
              <Avatar>
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-muted">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-semibold truncate">{user.name}</span>
                  <span className="text-muted-foreground text-xs">@{user.username}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{user.bio}</p>
              </div>
              <Button
                variant={followedUsers[user.id] ? "default" : "outline"}
                size="sm"
                className={followedUsers[user.id] ? "glow" : "glow-blue hover:text-neon-blue"}
                onClick={() => toggleFollow(user.id)}
              >
                {followedUsers[user.id] ? "Following" : "Follow"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
