"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share2, Bookmark, Send, X, ChevronLeft, ChevronRight } from "lucide-react"
import { CodeBlock } from "@/components/code-block"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

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
  images?: string[] // Array of image URLs for carousel
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

type MessageType = "text" | "image" | "voice" | "file"

interface Message {
  id: string
  content: string
  imageUrl?: string
  audioUrl?: string
  fileName?: string
  fileSize?: number
  type: MessageType
  isDeleted?: boolean
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
  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Get all images for the post (main image + related images)
  const getAllImages = () => {
    const images: string[] = []

    // Add main image if it exists
    if (post.image) {
      images.push(post.image)
    }

    // Add additional images if they exist
    if (post.images && post.images.length > 0) {
      images.push(...post.images)
    }

    // If no images provided, use default
    if (images.length === 0 && !post.code) {
      images.push(getDefaultImage())
    }

    return images
  }

  // Default AI-generated image URLs based on post content keywords
  const defaultImages = [
    "/placeholder.svg?height=300&width=600&text=AI+Security+Visualization",
    "/placeholder.svg?height=300&width=600&text=Neural+Network+Diagram",
    "/placeholder.svg?height=300&width=600&text=Cybersecurity+Concept",
    "/placeholder.svg?height=300&width=600&text=Hacker+Terminal+View",
    "/placeholder.svg?height=300&width=600&text=Blockchain+Technology",
    "/placeholder.svg?height=300&width=600&text=Quantum+Computing+Visualization",
  ]

  // Get a deterministic image based on post ID
  const getDefaultImage = () => {
    const postIdNum = Number.parseInt(post.id.replace(/\D/g, "")) || 0
    return defaultImages[postIdNum % defaultImages.length]
  }

  const handlePrevImage = () => {
    const allImages = getAllImages()
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))
  }

  const handleNextImage = () => {
    const allImages = getAllImages()
    setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      handleNextImage()
    } else if (isRightSwipe) {
      handlePrevImage()
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

  // Reset carousel index when post changes
  useEffect(() => {
    setCurrentImageIndex(0)
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

  const allImages = getAllImages()
  const hasMultipleImages = allImages.length > 1

  return (
    <Card className="border-border/40 bg-background/80 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        <Avatar>
          <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
          <AvatarFallback className="bg-muted">{post.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
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

        {allImages.length > 0 && !post.code ? (
          <div className="mb-3">
            {/* Image Carousel */}
            <div className="relative">
              <div
                ref={carouselRef}
                className="overflow-hidden rounded-md border border-border/40"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(-${currentImageIndex * 100}%)`,
                    width: `${allImages.length * 100}%`,
                  }}
                >
                  {allImages.map((img, index) => (
                    <div key={index} className="w-full h-full flex-shrink-0 flex items-center justify-center">
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`Post content ${index + 1}`}
                        className="w-full h-auto object-cover max-h-[300px]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation arrows - only show if multiple images */}
              {hasMultipleImages && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm h-8 w-8"
                    onClick={handlePrevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm h-8 w-8"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Carousel indicators - only show if multiple images */}
              {hasMultipleImages && (
                <div className="flex justify-center mt-2 gap-1">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        currentImageIndex === index ? "bg-neon-green" : "bg-muted-foreground/50",
                      )}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
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
            {user && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
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
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={comment.userAvatar || "/placeholder.svg"} alt={comment.userName} />
                    <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
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
