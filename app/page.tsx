"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { Sidebar } from "@/components/sidebar"
import { PostCard } from "@/components/post-card"
import { TrendingTopics } from "@/components/trending-topics"
import { SuggestedUsers } from "@/components/suggested-users"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { usePosts } from "@/hooks/use-posts"
import { useInView } from "react-intersection-observer"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { posts, loadMorePosts, hasMore, isLoading } = usePosts()

  // Infinite scroll setup
  const { ref, inView } = useInView()

  // Load more posts when the user scrolls to the bottom
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMorePosts()
    }
  }, [inView, hasMore, isLoading, loadMorePosts])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  // Mock data for trending topics
  const trendingTopics = [
    { id: "1", name: "cybersecurity", posts: 1243 },
    { id: "2", name: "AI", posts: 982 },
    { id: "3", name: "blockchain", posts: 754 },
    { id: "4", name: "quantumcomputing", posts: 521 },
    { id: "5", name: "ethicalhacking", posts: 498 },
    { id: "6", name: "machinelearning", posts: 432 },
    { id: "7", name: "python", posts: 387 },
    { id: "8", name: "javascript", posts: 356 },
  ]

  // Mock data for suggested users
  const suggestedUsers = [
    {
      id: "1",
      name: "Emma Watson",
      username: "emmahacker",
      avatar: "/placeholder.svg?height=40&width=40",
      bio: "Security researcher | Bug bounty hunter | Coffee addict",
    },
    {
      id: "2",
      name: "David Liu",
      username: "davidcodes",
      avatar: "/placeholder.svg?height=40&width=40",
      bio: "Full-stack developer | Open source contributor | AI enthusiast",
    },
    {
      id: "3",
      name: "Priya Sharma",
      username: "priyatech",
      avatar: "/placeholder.svg?height=40&width=40",
      bio: "AI researcher @ OpenAI | PhD in Computer Science | Speaker",
    },
  ]

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

        <main className="md:col-span-6 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold font-mono glow-text">Feed</h1>
            <Button className="glow">
              <Plus className="mr-2 h-4 w-4" /> New Post
            </Button>
          </div>

          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
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
                <p>// End of feed //</p>
              </div>
            )}
          </div>
        </main>

        <aside className="hidden md:block md:col-span-3 space-y-6">
          <div className="sticky top-20 space-y-6">
            <TrendingTopics topics={trendingTopics} />
            <SuggestedUsers users={suggestedUsers} />
          </div>
        </aside>
      </div>
    </div>
  )
}
