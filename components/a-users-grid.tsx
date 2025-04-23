"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Terminal, UserPlus, UserCheck } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { UserAvatar } from "@/components/user-avatar"

interface User {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
  isFollowing: boolean
}

export function AUsersGrid() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate API call to fetch users
    const fetchUsers = async () => {
      setIsLoading(true)

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate mock users whose names start with A
      const mockUsers: User[] = [
        {
          id: "user-a1",
          name: "Alex Chen",
          username: "alexc0der",
          avatar: "/placeholder.svg?height=100&width=100",
          bio: "Security researcher | Bug bounty hunter | Coffee addict",
          isFollowing: false,
        },
        {
          id: "user-a2",
          name: "Aria Johnson",
          username: "aria_dev",
          avatar: "/placeholder.svg?height=100&width=100",
          bio: "Full-stack developer | Open source contributor | AI enthusiast",
          isFollowing: true,
        },
        {
          id: "user-a3",
          name: "Adrian Smith",
          username: "adrian_hack",
          avatar: "/placeholder.svg?height=100&width=100",
          bio: "Cybersecurity specialist | Ethical hacker | Speaker",
          isFollowing: false,
        },
        {
          id: "user-a4",
          name: "Alicia Zhang",
          username: "alicia_z",
          avatar: "/placeholder.svg?height=100&width=100",
          bio: "AI researcher | PhD in Computer Science | Blockchain developer",
          isFollowing: false,
        },
        {
          id: "user-a5",
          name: "Aaron Miller",
          username: "aaronm",
          avatar: "/placeholder.svg?height=100&width=100",
          bio: "Network security | CTF player | Linux enthusiast",
          isFollowing: true,
        },
        {
          id: "user-a6",
          name: "Aisha Patel",
          username: "aisha_codes",
          avatar: "/placeholder.svg?height=100&width=100",
          bio: "Software engineer | Open source advocate | Tech blogger",
          isFollowing: false,
        },
        {
          id: "user-a7",
          name: "Adam Wilson",
          username: "adam_w",
          avatar: "/placeholder.svg?height=100&width=100",
          bio: "Penetration tester | Security consultant | Speaker",
          isFollowing: false,
        },
        {
          id: "user-a8",
          name: "Amelia Clark",
          username: "amelia_c",
          avatar: "/placeholder.svg?height=100&width=100",
          bio: "Data scientist | Machine learning engineer | Python lover",
          isFollowing: false,
        },
      ]

      // Check localStorage for follow status
      const storedFollows = localStorage.getItem("hackhub-follows")
      if (storedFollows) {
        try {
          const follows = JSON.parse(storedFollows)
          mockUsers.forEach((user) => {
            user.isFollowing = follows[user.id] || user.isFollowing
          })
        } catch (error) {
          console.error("Failed to parse follows:", error)
        }
      }

      setUsers(mockUsers)
      setIsLoading(false)
    }

    fetchUsers()
  }, [])

  const toggleFollow = (userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user)),
    )

    // Update localStorage
    const storedFollows = localStorage.getItem("hackhub-follows")
    let follows: Record<string, boolean> = {}

    if (storedFollows) {
      try {
        follows = JSON.parse(storedFollows)
      } catch (error) {
        console.error("Failed to parse follows:", error)
      }
    }

    const user = users.find((u) => u.id === userId)
    if (user) {
      const newFollowStatus = !user.isFollowing
      follows[userId] = newFollowStatus
      localStorage.setItem("hackhub-follows", JSON.stringify(follows))

      toast({
        title: newFollowStatus ? "Following" : "Unfollowed",
        description: newFollowStatus ? `You started following ${user.name}` : `You have unfollowed ${user.name}`,
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="h-5 w-5 text-neon-green" />
        <h2 className="text-xl font-bold font-mono glow-text">&gt; Hackers Whose Names Start With A</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="border-border/40 bg-background/80 backdrop-blur-sm animate-pulse">
              <CardContent className="p-6 h-[180px]"></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {users.map((user) => (
            <Card
              key={user.id}
              className="border-border/40 bg-background/80 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 group"
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <UserAvatar user={user} size="xl" className="mb-4" />

                <div className="space-y-1 mb-4">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-mono text-sm text-muted-foreground">&gt;_</span>
                    <h3 className="font-semibold">{user.name}</h3>
                  </div>
                  <p className="text-sm text-neon-green font-mono">@{user.username}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{user.bio}</p>
                </div>

                <Button
                  variant={user.isFollowing ? "outline" : "default"}
                  size="sm"
                  className={
                    user.isFollowing ? "w-full border-neon-blue text-neon-blue hover:bg-neon-blue/10" : "w-full glow"
                  }
                  onClick={() => toggleFollow(user.id)}
                >
                  {user.isFollowing ? (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" />
                      <span className="mr-1">&gt;</span> Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      <span className="mr-1">&gt;</span> Follow
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
