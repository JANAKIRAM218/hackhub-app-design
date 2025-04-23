"use client"

import { cn } from "@/lib/utils"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { Sidebar } from "@/components/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, MessageSquare, UserPlus, Bell, BellOff, Bookmark, Share2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useInView } from "react-intersection-observer"

interface Notification {
  id: string
  type: "like" | "comment" | "follow" | "mention" | "bookmark" | "share"
  user: {
    name: string
    username: string
    avatar: string
  }
  content: string
  postId?: string
  postPreview?: string
  createdAt: string
  read: boolean
}

export default function NotificationsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Infinite scroll setup
  const { ref, inView } = useInView()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  // Load initial notifications
  useEffect(() => {
    loadNotifications()
  }, [])

  // Load more notifications when the user scrolls to the bottom
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMoreNotifications()
    }
  }, [inView, hasMore, isLoading])

  const loadNotifications = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      const mockNotifications = generateMockNotifications(20)
      setNotifications(mockNotifications)
      setPage(1)
      setHasMore(true)
      setIsLoading(false)
    }, 1000)
  }

  const loadMoreNotifications = () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      const nextPage = page + 1

      if (nextPage <= 3) {
        // Limit to 3 pages (60 notifications)
        const mockNotifications = generateMockNotifications(20, nextPage * 20)
        setNotifications((prev) => [...prev, ...mockNotifications])
        setPage(nextPage)
      } else {
        setHasMore(false)
      }

      setIsLoading(false)
    }, 1000)
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const getFilteredNotifications = () => {
    if (activeTab === "all") {
      return notifications
    }
    return notifications.filter((notification) =>
      activeTab === "unread" ? !notification.read : notification.type === activeTab,
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-neon-blue" />
      case "follow":
        return <UserPlus className="h-4 w-4 text-neon-green" />
      case "mention":
        return <Bell className="h-4 w-4 text-yellow-500" />
      case "bookmark":
        return <Bookmark className="h-4 w-4 text-purple-500" />
      case "share":
        return <Share2 className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  if (!isAuthenticated) {
    return null // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen">
      <MainNav />
      <div className="container grid grid-cols-1 md:grid-cols-12 gap-6 py-6">
        <aside className="hidden md:block md:col-span-3">
          <Sidebar className="sticky top-20" />
        </aside>

        <main className="md:col-span-9 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold font-mono glow-text">Notifications</h1>
            <Button variant="outline" className="glow-blue" onClick={markAllAsRead}>
              <BellOff className="mr-2 h-4 w-4" /> Mark all as read
            </Button>
          </div>

          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 mb-6 bg-muted/30">
              <TabsTrigger value="all" className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green">
                All
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green"
              >
                Unread
              </TabsTrigger>
              <TabsTrigger value="like" className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green">
                Likes
              </TabsTrigger>
              <TabsTrigger
                value="comment"
                className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green"
              >
                Comments
              </TabsTrigger>
              <TabsTrigger
                value="follow"
                className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green"
              >
                Follows
              </TabsTrigger>
              <TabsTrigger
                value="mention"
                className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green"
              >
                Mentions
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0 space-y-4">
              {getFilteredNotifications().map((notification) => (
                <Card
                  key={notification.id}
                  className={cn(
                    "p-4 border-border/40 hover:border-primary/40 transition-all duration-300",
                    !notification.read && "bg-muted/30 border-l-4 border-l-neon-green",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={notification.user.avatar || "/placeholder.svg"} alt={notification.user.name} />
                      <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <span className="font-semibold">{notification.user.name}</span>
                        <span className="text-muted-foreground text-sm">@{notification.user.username}</span>
                      </div>
                      <p className="mt-1">{notification.content}</p>
                      {notification.postPreview && (
                        <div className="mt-2 p-3 rounded bg-muted/30 border border-border/40 text-sm text-muted-foreground">
                          {notification.postPreview}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-muted-foreground">{notification.createdAt}</div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-center py-4">
                  <div className="h-8 w-8 rounded-full border-2 border-neon-green border-t-transparent animate-spin"></div>
                </div>
              )}

              {/* Intersection observer target */}
              {hasMore && <div ref={ref} className="h-10" />}

              {!hasMore && !isLoading && (
                <div className="text-center py-4 text-muted-foreground font-mono">
                  <p>// End of notifications //</p>
                </div>
              )}

              {getFilteredNotifications().length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                  <p className="text-muted-foreground">
                    {activeTab === "unread"
                      ? "You've read all your notifications"
                      : "You don't have any notifications yet"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

// Helper function to generate mock notifications
function generateMockNotifications(count: number, startId = 0): Notification[] {
  const notifications: Notification[] = []

  const users = [
    {
      name: "Alex Chen",
      username: "alexc0der",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Sophia Kim",
      username: "sophiadev",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Marcus Johnson",
      username: "mjhacker",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Tech Innovator",
      username: "techinnovator",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "AI Research Lab",
      username: "airesearchlab",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const notificationTypes: Notification["type"][] = ["like", "comment", "follow", "mention", "bookmark", "share"]

  const likeContents = ["liked your post", "liked your comment", "liked your code snippet"]

  const commentContents = [
    'commented on your post: "Great insight! I\'ll try this approach."',
    'replied to your comment: "Thanks for pointing that out!"',
    'commented on your code: "This could be optimized further."',
  ]

  const followContents = ["started following you", "followed you back"]

  const mentionContents = [
    "mentioned you in a post",
    "tagged you in a comment",
    "mentioned you in their code explanation",
  ]

  const bookmarkContents = ["bookmarked your post", "saved your code snippet"]

  const shareContents = ["shared your post", "shared your code snippet"]

  const postPreviews = [
    "Just discovered this amazing vulnerability in a popular web framework...",
    "Check out my new neural network architecture for image recognition...",
    "Just built this cool terminal dashboard for monitoring network traffic...",
    "Just released our new quantum encryption library. 100x faster than traditional methods...",
    "We've trained an AI model that can generate secure code and identify vulnerabilities automatically...",
  ]

  const timeAgo = [
    "Just now",
    "2m ago",
    "5m ago",
    "15m ago",
    "32m ago",
    "1h ago",
    "2h ago",
    "3h ago",
    "5h ago",
    "6h ago",
    "10h ago",
    "1d ago",
    "2d ago",
    "3d ago",
    "5d ago",
    "1w ago",
  ]

  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)]
    const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]

    let content = ""
    switch (type) {
      case "like":
        content = likeContents[Math.floor(Math.random() * likeContents.length)]
        break
      case "comment":
        content = commentContents[Math.floor(Math.random() * commentContents.length)]
        break
      case "follow":
        content = followContents[Math.floor(Math.random() * followContents.length)]
        break
      case "mention":
        content = mentionContents[Math.floor(Math.random() * mentionContents.length)]
        break
      case "bookmark":
        content = bookmarkContents[Math.floor(Math.random() * bookmarkContents.length)]
        break
      case "share":
        content = shareContents[Math.floor(Math.random() * shareContents.length)]
        break
    }

    const hasPostPreview = type !== "follow" && Math.random() > 0.3
    const postPreview = hasPostPreview ? postPreviews[Math.floor(Math.random() * postPreviews.length)] : undefined
    const createdAt = timeAgo[Math.floor(Math.random() * timeAgo.length)]
    const read = Math.random() > 0.3

    notifications.push({
      id: `notification-${startId + i + 1}`,
      type,
      user,
      content,
      postId: hasPostPreview ? `post-${Math.floor(Math.random() * 50) + 1}` : undefined,
      postPreview,
      createdAt,
      read,
    })
  }

  return notifications
}
