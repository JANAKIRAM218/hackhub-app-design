"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share2, Bookmark, Send, X } from "lucide-react"
import { CodeBlock } from "@/components/code-block"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/user-avatar"

interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  createdAt: string
}

interface Post {
  id: string
  user: {
    name: string
    username: string
    avatar: string
  }
  content: string
  image?: string
  code?: {
    language: string
    content: string
  }
  likes: number
  comments: number
  shares: number
  createdAt: string
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [commentsCount, setCommentsCount] = useState(post.comments)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [activeImageId, setActiveImageId] = useState<string | null>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  // Check if device supports touch
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0,
      )
    }

    checkTouch()

    // Also check on resize in case of device mode changes
    window.addEventListener("resize", checkTouch)
    return () => window.removeEventListener("resize", checkTouch)
  }, [])

  // Default AI-generated image URLs based on post content keywords
  const defaultImages = [
    "/placeholder.svg?height=300&width=600&text=Cybersecurity+Attack+Visualization",
    "/placeholder.svg?height=300&width=600&text=Neural+Network+Hack",
    "/placeholder.svg?height=300&width=600&text=Matrix+Code+Rain",
    "/placeholder.svg?height=300&width=600&text=Dark+Web+Access+Terminal",
    "/placeholder.svg?height=300&width=600&text=Blockchain+Security+Breach",
    "/placeholder.svg?height=300&width=600&text=Quantum+Encryption+Hack",
    "/placeholder.svg?height=300&width=600&text=Firewall+Penetration",
    "/placeholder.svg?height=300&width=600&text=Zero+Day+Exploit",
    "/placeholder.svg?height=300&width=600&text=Biometric+Security+Bypass",
    "/placeholder.svg?height=300&width=600&text=Social+Engineering+Attack",
  ]

  // Get a deterministic image based on post ID
  const getDefaultImage = () => {
    const postIdNum = Number.parseInt(post.id.replace(/\D/g, "")) || 0
    return defaultImages[postIdNum % defaultImages.length]
  }

  // Handle image tap/click for touch devices
  const handleImageInteraction = (id: string) => {
    if (isTouchDevice) {
      setActiveImageId(activeImageId === id ? null : id)
    }
  }

  // Check if post is liked/bookmarked and load comments
  useEffect(() => {
    // Check likes
    const storedLikes = localStorage.getItem("hackhub-likes")
    if (storedLikes) {
      try {
        const likes = JSON.parse(storedLikes)
        setLiked(!!likes[post.id])
      } catch (error) {
        console.error("Failed to parse likes:", error)
      }
    }

    // Check bookmarks
    const storedBookmarks = localStorage.getItem("hackhub-bookmarks")
    if (storedBookmarks) {
      try {
        const bookmarks = JSON.parse(storedBookmarks)
        const isBookmarked = bookmarks.some((bookmark: Post) => bookmark.id === post.id)
        setBookmarked(isBookmarked)
      } catch (error) {
        console.error("Failed to parse bookmarks:", error)
      }
    }

    // Load comments
    loadComments()
  }, [post.id])

  const loadComments = () => {
    const storedComments = localStorage.getItem(`hackhub-comments-${post.id}`)
    if (storedComments) {
      try {
        const parsedComments = JSON.parse(storedComments)
        setComments(parsedComments)
        setCommentsCount(parsedComments.length)
      } catch (error) {
        console.error("Failed to parse comments:", error)
      }
    }
  }

  const handleLike = () => {
    const newLiked = !liked
    setLiked(newLiked)
    setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1))

    // Update localStorage
    const storedLikes = localStorage.getItem("hackhub-likes")
    let likes: Record<string, boolean> = {}

    if (storedLikes) {
      try {
        likes = JSON.parse(storedLikes)
      } catch (error) {
        console.error("Failed to parse likes:", error)
      }
    }

    if (newLiked) {
      likes[post.id] = true
    } else {
      delete likes[post.id]
    }

    localStorage.setItem("hackhub-likes", JSON.stringify(likes))
  }

  const handleBookmark = () => {
    const newBookmarked = !bookmarked
    setBookmarked(newBookmarked)

    // Update localStorage
    const storedBookmarks = localStorage.getItem("hackhub-bookmarks")
    let bookmarks: Post[] = []

    if (storedBookmarks) {
      try {
        bookmarks = JSON.parse(storedBookmarks)
      } catch (error) {
        console.error("Failed to parse bookmarks:", error)
      }
    }

    if (newBookmarked) {
      // Add to bookmarks if not already there
      if (!bookmarks.some((bookmark) => bookmark.id === post.id)) {
        bookmarks.push(post)
      }
    } else {
      // Remove from bookmarks
      bookmarks = bookmarks.filter((bookmark) => bookmark.id !== post.id)
    }

    localStorage.setItem("hackhub-bookmarks", JSON.stringify(bookmarks))
  }

  const handleCommentClick = () => {
    setShowComments(!showComments)
    if (!showComments) {
      setTimeout(() => {
        commentInputRef.current?.focus()
      }, 100)
    }
  }

  const handleSubmitComment = () => {
    if (!newComment.trim() || !user) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: newComment.trim(),
        createdAt: "Just now",
      }

      const updatedComments = [...comments, comment]
      setComments(updatedComments)
      setCommentsCount(updatedComments.length)
      setNewComment("")
      setIsSubmitting(false)

      // Save to localStorage
      localStorage.setItem(`hackhub-comments-${post.id}`, JSON.stringify(updatedComments))
    }, 500)
  }

  // Generate unique IDs for images
  const postImageId = `post-image-${post.id}`
  const defaultImageId = `default-image-${post.id}`

  return (
    <Card className="border-border/40 bg-background/80 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        <UserAvatar user={post.user} />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{post.user.name}</span>
            <span className="text-muted-foreground text-sm">@{post.user.username}</span>
          </div>
          <span className="text-xs text-muted-foreground">{post.createdAt}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="mb-3">{post.content}</p>

        {post.image ? (
          <div
            id={postImageId}
            className={cn(
              "rounded-md overflow-hidden mb-3 border border-border/40 group relative transition-all duration-300",
              // Apply hover styles only on non-touch devices
              !isTouchDevice && "hover:border-neon-green",
              // Apply active styles for touch devices when tapped
              isTouchDevice &&
                activeImageId === postImageId &&
                "border-neon-green shadow-[0_0_15px_rgba(0,255,157,0.5)]",
            )}
            data-theme="hacking"
            onClick={() => handleImageInteraction(postImageId)}
          >
            <img
              src={post.image || "/placeholder.svg"}
              alt="Post content"
              className={cn(
                "w-full h-auto object-cover transition-transform duration-300",
                // Apply hover styles only on non-touch devices
                !isTouchDevice && "group-hover:scale-105 group-hover:brightness-110",
                // Apply active styles for touch devices when tapped
                isTouchDevice && activeImageId === postImageId && "scale-105 brightness-110",
              )}
            />
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300",
                // Apply hover styles only on non-touch devices
                !isTouchDevice && "opacity-0 group-hover:opacity-100",
                // Apply active styles for touch devices when tapped
                isTouchDevice && (activeImageId === postImageId ? "opacity-100" : "opacity-0"),
              )}
            ></div>
            {isTouchDevice && (
              <div className="absolute bottom-2 right-2 bg-background/80 text-xs text-neon-green px-2 py-1 rounded-full backdrop-blur-sm">
                Tap to {activeImageId === postImageId ? "close" : "zoom"}
              </div>
            )}
          </div>
        ) : !post.code ? (
          <div
            id={defaultImageId}
            className={cn(
              "rounded-md overflow-hidden mb-3 border border-border/40 group relative transition-all duration-300",
              // Apply hover styles only on non-touch devices
              !isTouchDevice &&
                "hover:border-neon-green hover:shadow-[0_0_15px_rgba(0,255,157,0.5)] hover:animate-pulse-glow",
              // Apply active styles for touch devices when tapped
              isTouchDevice &&
                activeImageId === defaultImageId &&
                "border-neon-green shadow-[0_0_15px_rgba(0,255,157,0.5)]",
            )}
            data-theme="hacking"
            onClick={() => handleImageInteraction(defaultImageId)}
          >
            <img
              src={getDefaultImage() || "/placeholder.svg"}
              alt="AI generated hacking visualization"
              className={cn(
                "w-full h-auto object-cover transition-transform duration-300",
                // Apply hover styles only on non-touch devices
                !isTouchDevice && "group-hover:scale-105 group-hover:brightness-110",
                // Apply active styles for touch devices when tapped
                isTouchDevice && activeImageId === defaultImageId && "scale-105 brightness-110",
              )}
            />
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300",
                // Apply hover styles only on non-touch devices
                !isTouchDevice && "opacity-0 group-hover:opacity-100",
                // Apply active styles for touch devices when tapped
                isTouchDevice && (activeImageId === defaultImageId ? "opacity-100" : "opacity-0"),
              )}
            ></div>
            {isTouchDevice && (
              <div className="absolute bottom-2 right-2 bg-background/80 text-xs text-neon-green px-2 py-1 rounded-full backdrop-blur-sm">
                Tap to {activeImageId === defaultImageId ? "close" : "zoom"}
              </div>
            )}
          </div>
        ) : null}

        {post.code && (
          <div className="mb-3">
            <CodeBlock language={post.code.language} code={post.code.content} />
          </div>
        )}
      </CardContent>
      <Separator className="bg-border/40" />
      <CardFooter className="p-2">
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-muted-foreground hover:text-neon-green"
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-neon-green text-neon-green" : ""}`} />
            <span>{likesCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-1 text-muted-foreground hover:text-neon-green",
              showComments && "text-neon-green",
            )}
            onClick={handleCommentClick}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{commentsCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-muted-foreground hover:text-neon-green"
          >
            <Share2 className="h-4 w-4" />
            <span>{post.shares}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-muted-foreground hover:text-neon-blue"
            onClick={handleBookmark}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-neon-blue text-neon-blue" : ""}`} />
          </Button>
        </div>
      </CardFooter>

      {/* Comments section */}
      {showComments && (
        <div className="px-4 pb-4 space-y-4">
          <Separator className="bg-border/40" />

          {/* Comment input */}
          <div className="flex gap-3">
            {user && <UserAvatar user={user} size="sm" className="flex-shrink-0" />}
            <div className="flex-1 space-y-2">
              <Textarea
                ref={commentInputRef}
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] bg-muted/50 border-muted focus:border-neon-green focus:ring-1 focus:ring-neon-green resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowComments(false)}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button
                  size="sm"
                  className="glow"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                >
                  <Send className="h-4 w-4 mr-1" /> {isSubmitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>

          {/* Comments list */}
          <div className="space-y-4 mt-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <UserAvatar
                    user={{
                      name: comment.userName,
                      username: comment.userId,
                      avatar: comment.userAvatar,
                    }}
                    size="sm"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

export type { Post }
