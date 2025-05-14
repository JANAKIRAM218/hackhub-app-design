"use client"

import { Input } from "@/components/ui/input"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { Sidebar } from "@/components/sidebar"
import { PostCard } from "@/components/post-card"
import { TrendingTopics } from "@/components/trending-topics"
import { SuggestedUsers } from "@/components/suggested-users"
import { Button } from "@/components/ui/button"
import { Plus, Send, Loader2, ImageIcon, X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { usePosts } from "@/hooks/use-posts"
import { useInView } from "react-intersection-observer"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { posts, loadMorePosts, hasMore, isLoading, refresh } = usePosts()
  const { toast } = useToast()

  // Infinite scroll setup
  const { ref, inView } = useInView()

  const [isPostModalOpen, setIsPostModalOpen] = useState(false)

  // Listen for custom event to open post modal
  useEffect(() => {
    const handleOpenPostModal = () => {
      setIsPostModalOpen(true)
    }

    window.addEventListener("open-post-modal", handleOpenPostModal)

    return () => {
      window.removeEventListener("open-post-modal", handleOpenPostModal)
    }
  }, [])

  const handleCreatePost = (content: string, image?: string) => {
    // Create a new post object
    const newPost = {
      id: `post-${Date.now()}`,
      user: {
        name: user?.name || "Anonymous",
        username: user?.username || "anonymous",
        avatar: user?.avatar || "/placeholder.svg?height=40&width=40",
      },
      content,
      image,
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: "Just now",
    }

    // Store the new post in localStorage
    const storedPosts = localStorage.getItem("hackhub-posts")
    let allPosts = []

    if (storedPosts) {
      try {
        allPosts = JSON.parse(storedPosts)
      } catch (error) {
        console.error("Failed to parse posts:", error)
      }
    }

    // Add the new post to the beginning of the posts array
    allPosts = [newPost, ...allPosts]
    localStorage.setItem("hackhub-posts", JSON.stringify(allPosts))

    // Refresh posts to include the new one
    refresh()

    // Close the modal
    setIsPostModalOpen(false)

    toast({
      title: "Post created",
      description: "Your post has been published successfully!",
    })
  }

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

  // Post creation modal
  const PostModal = () => {
    const [content, setContent] = useState("")
    const [image, setImage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isImageLoading, setIsImageLoading] = useState(false)
    const [imageError, setImageError] = useState(false)
    const maxLength = 500 // Maximum character limit

    // Handle image URL change and preview
    const handleImageChange = (url: string) => {
      setImage(url)

      if (!url.trim()) {
        setImagePreview(null)
        setImageError(false)
        return
      }

      setIsImageLoading(true)
      setImageError(false)

      // Create an image element to test if the URL is valid
      const img = new Image()
      img.onload = () => {
        setImagePreview(url)
        setIsImageLoading(false)
      }
      img.onerror = () => {
        setImagePreview(null)
        setIsImageLoading(false)
        setImageError(true)
      }
      img.src = url
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!content.trim()) return

      setIsSubmitting(true)

      // Simulate API delay
      setTimeout(() => {
        handleCreatePost(content, imagePreview || undefined)
        setContent("")
        setImage("")
        setImagePreview(null)
        setIsSubmitting(false)
      }, 500)
    }

    return (
      <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-border/40 bg-background/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-mono glow-text">Create Post</DialogTitle>
            <DialogDescription>Share your code, thoughts, or discoveries with the HackHub community.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Textarea
                  placeholder="What's on your mind?"
                  className="min-h-[120px] bg-muted/50 border-muted focus:border-neon-green focus:ring-1 focus:ring-neon-green resize-none"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={maxLength}
                  required
                />
                <div className="flex justify-end">
                  <span
                    className={`text-xs font-mono ${
                      content.length > maxLength * 0.8
                        ? content.length > maxLength * 0.9
                          ? "text-red-500"
                          : "text-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {content.length}/{maxLength} characters
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-url" className="text-sm font-mono">
                  Image URL (optional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="image-url"
                    placeholder="https://example.com/image.jpg"
                    className={`bg-muted/50 border-muted focus:ring-1 font-mono flex-1 ${
                      imageError
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "focus:border-neon-green focus:ring-neon-green"
                    }`}
                    value={image}
                    onChange={(e) => handleImageChange(e.target.value)}
                  />
                  {image && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={() => {
                        setImage("")
                        setImagePreview(null)
                        setImageError(false)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {imageError && (
                  <p className="text-xs text-red-500 font-mono">
                    Invalid image URL. Please check the URL and try again.
                  </p>
                )}

                {/* Image preview */}
                {isImageLoading && (
                  <div className="flex items-center justify-center h-40 border border-dashed rounded-md border-border/40 bg-muted/30">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 rounded-full border-2 border-neon-green border-t-transparent animate-spin"></div>
                      <span className="text-sm text-muted-foreground">Loading image preview...</span>
                    </div>
                  </div>
                )}

                {imagePreview && !isImageLoading && (
                  <div className="relative border rounded-md overflow-hidden border-border/40 bg-muted/30">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-auto max-h-[200px] object-contain"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 bg-background/80 backdrop-blur-sm"
                        onClick={() => {
                          setImage("")
                          setImagePreview(null)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {!imagePreview && !isImageLoading && !imageError && (
                  <div className="flex items-center justify-center h-20 border border-dashed rounded-md border-border/40 bg-muted/30">
                    <div className="flex flex-col items-center gap-1">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Enter an image URL to see a preview</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPostModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="glow" disabled={!content.trim() || isSubmitting || isImageLoading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Publish
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
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
            <Button className="glow" onClick={() => setIsPostModalOpen(true)}>
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
      {/* Post creation modal */}
      <PostModal />
    </div>
  )
}
