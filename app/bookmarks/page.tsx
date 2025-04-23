"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { Sidebar } from "@/components/sidebar"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Bookmark, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useInView } from "react-intersection-observer"

// Import the Post type from use-posts
import type { Post } from "@/hooks/use-posts"

export default function BookmarksPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [bookmarks, setBookmarks] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Infinite scroll setup
  const { ref, inView } = useInView()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  // Load initial bookmarks
  useEffect(() => {
    loadBookmarks()
  }, [])

  // Load more bookmarks when the user scrolls to the bottom
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMoreBookmarks()
    }
  }, [inView, hasMore, isLoading])

  const loadBookmarks = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      // Get bookmarks from localStorage or use mock data
      const storedBookmarks = localStorage.getItem("hackhub-bookmarks")
      let initialBookmarks: Post[] = []

      if (storedBookmarks) {
        try {
          const parsedBookmarks = JSON.parse(storedBookmarks)
          initialBookmarks = Array.isArray(parsedBookmarks) ? parsedBookmarks : []
        } catch (error) {
          console.error("Failed to parse bookmarks:", error)
        }
      }

      // If no bookmarks in localStorage, use mock data
      if (initialBookmarks.length === 0) {
        initialBookmarks = generateMockBookmarks(10)
        // Save mock bookmarks to localStorage
        localStorage.setItem("hackhub-bookmarks", JSON.stringify(initialBookmarks))
      }

      setBookmarks(initialBookmarks.slice(0, 5))
      setPage(1)
      setHasMore(initialBookmarks.length > 5)
      setIsLoading(false)
    }, 1000)
  }

  const loadMoreBookmarks = () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      const nextPage = page + 1
      const storedBookmarks = localStorage.getItem("hackhub-bookmarks")
      let allBookmarks: Post[] = []

      if (storedBookmarks) {
        try {
          allBookmarks = JSON.parse(storedBookmarks)
        } catch (error) {
          console.error("Failed to parse bookmarks:", error)
        }
      }

      const startIndex = page * 5
      const endIndex = startIndex + 5

      if (startIndex < allBookmarks.length) {
        const newBookmarks = allBookmarks.slice(startIndex, endIndex)
        setBookmarks((prev) => [...prev, ...newBookmarks])
        setPage(nextPage)
        setHasMore(endIndex < allBookmarks.length)
      } else {
        setHasMore(false)
      }

      setIsLoading(false)
    }, 1000)
  }

  const removeBookmark = (postId: string) => {
    // Remove from state
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== postId))

    // Remove from localStorage
    const storedBookmarks = localStorage.getItem("hackhub-bookmarks")
    if (storedBookmarks) {
      try {
        const allBookmarks: Post[] = JSON.parse(storedBookmarks)
        const updatedBookmarks = allBookmarks.filter((bookmark) => bookmark.id !== postId)
        localStorage.setItem("hackhub-bookmarks", JSON.stringify(updatedBookmarks))
      } catch (error) {
        console.error("Failed to update bookmarks:", error)
      }
    }
  }

  const clearAllBookmarks = () => {
    setBookmarks([])
    localStorage.setItem("hackhub-bookmarks", JSON.stringify([]))
    setHasMore(false)
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
            <h1 className="text-2xl font-bold font-mono glow-text">Bookmarks</h1>
            {bookmarks.length > 0 && (
              <Button variant="outline" className="text-red-400 hover:text-red-300" onClick={clearAllBookmarks}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear all
              </Button>
            )}
          </div>

          {bookmarks.length > 0 ? (
            <div className="space-y-4">
              {bookmarks.map((post) => (
                <div key={post.id} className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background text-red-400 hover:text-red-300"
                    onClick={() => removeBookmark(post.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <PostCard post={post} />
                </div>
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
                  <p>// End of bookmarks //</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
              <p className="text-muted-foreground">Save posts for later by clicking the bookmark icon</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// Helper function to generate mock bookmarks
function generateMockBookmarks(count: number): Post[] {
  const bookmarks: Post[] = []

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

  const contents = [
    "Just discovered this amazing vulnerability in a popular web framework. Always validate your inputs, folks! #cybersecurity #hacking",
    "Check out my new neural network architecture for image recognition. It's 30% faster than the current state-of-the-art! #AI #MachineLearning",
    "Just built this cool terminal dashboard for monitoring network traffic. The visualization is all in ASCII art! #networking #terminal",
    "Just released our new quantum encryption library. 100x faster than traditional methods with unbreakable security! #quantumcomputing #cybersecurity",
    "We've trained an AI model that can generate secure code and identify vulnerabilities automatically. Open-sourcing next week! #AI #securecodegen",
    "Just discovered a backdoor in a popular IoT device. Manufacturers need to take security seriously! #IoTSecurity #hacking",
    "My latest research on neural network vulnerabilities is now published. #AI #security",
    "Just automated our entire CI/CD pipeline with this custom script. Deployment time reduced by 70%! #devops #automation",
    "Just published my comprehensive guide on setting up a secure home lab for penetration testing. Link in comments! #cybersecurity #pentesting",
    "Found a zero-day vulnerability in a major browser. Responsible disclosure in progress. #security #bugbounty",
  ]

  const codeSnippets = [
    {
      language: "python",
      content:
        "import tensorflow as tf\n\nclass ImprovedCNN(tf.keras.Model):\n  def __init__(self):\n    super(ImprovedCNN, self).__init__()\n    self.conv1 = tf.keras.layers.Conv2D(32, 3, activation='relu')\n    self.pool = tf.keras.layers.MaxPooling2D()\n    self.flatten = tf.keras.layers.Flatten()\n    self.dense1 = tf.keras.layers.Dense(128, activation='relu')\n    self.dense2 = tf.keras.layers.Dense(10, activation='softmax')\n    \n  def call(self, x):\n    x = self.conv1(x)\n    x = self.pool(x)\n    x = self.flatten(x)\n    x = self.dense1(x)\n    return self.dense2(x)",
    },
    {
      language: "javascript",
      content:
        "// Example of AI-generated secure code\nfunction sanitizeInput(input) {\n  if (typeof input !== 'string') {\n    throw new TypeError('Input must be a string');\n  }\n  \n  // Remove potentially dangerous characters\n  return input\n    .replace(/[\\u0000-\\u001F\\u007F-\\u009F]/g, '')\n    .replace(/[&<>\"']/g, (char) => {\n      switch (char) {\n        case '&': return '&amp;';\n        case '<': return '&lt;';\n        case '>': return '&gt;';\n        case '\"': return '&quot;';\n        case \"'\": return '&#39;';\n        default: return char;\n      }\n    });\n}",
    },
  ]

  const timeAgo = [
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
    const content = contents[Math.floor(Math.random() * contents.length)]
    const hasImage = Math.random() > 0.5
    const hasCode = !hasImage && Math.random() > 0.5
    const code = hasCode ? codeSnippets[Math.floor(Math.random() * codeSnippets.length)] : undefined
    const likes = Math.floor(Math.random() * 1000)
    const comments = Math.floor(Math.random() * 200)
    const shares = Math.floor(Math.random() * 100)
    const createdAt = timeAgo[Math.floor(Math.random() * timeAgo.length)]

    bookmarks.push({
      id: `bookmark-${i + 1}`,
      user,
      content,
      image: hasImage ? `/placeholder.svg?height=300&width=600` : undefined,
      code,
      likes,
      comments,
      shares,
      createdAt,
    })
  }

  return bookmarks
}
