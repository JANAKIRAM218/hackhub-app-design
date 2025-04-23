"use client"

import { useState, useRef, type ChangeEvent } from "react"
import { X, ImageIcon, Loader2 } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { Post } from "@/hooks/use-posts"

interface NewPostModalProps {
  isOpen: boolean
  onClose: () => void
}

interface User {
  name: string
  username: string
  avatar: string
}

interface UserAvatarProps {
  user: User
  size: "sm" | "md" | "lg"
}

function UserAvatar({ user, size }: UserAvatarProps) {
  let avatarSize = "h-8 w-8"
  let fontSize = "text-sm"

  if (size === "md") {
    avatarSize = "h-10 w-10"
    fontSize = "text-base"
  } else if (size === "lg") {
    avatarSize = "h-12 w-12"
    fontSize = "text-lg"
  }

  return (
    <Avatar className={avatarSize}>
      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
      <AvatarFallback className={fontSize}>{user.name[0].toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}

export function NewPostModal({ isOpen, onClose }: NewPostModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [caption, setCaption] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const removeImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = () => {
    if (!caption.trim() && !imagePreview) {
      toast({
        title: "Empty post",
        description: "Please add a caption or an image to your post.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Create new post
    const newPost: Post = {
      id: `post-${Date.now()}`,
      user: {
        name: user?.name || "Anonymous",
        username: user?.username || "anonymous",
        avatar: user?.avatar || "/placeholder.svg?height=40&width=40",
      },
      content: caption,
      image: imagePreview || undefined,
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: "Just now",
    }

    // Save to localStorage
    setTimeout(() => {
      // Get existing posts
      const storedPosts = localStorage.getItem("hackhub-posts")
      let posts: Post[] = []

      if (storedPosts) {
        try {
          posts = JSON.parse(storedPosts)
        } catch (error) {
          console.error("Failed to parse posts:", error)
        }
      }

      // Add new post at the beginning
      posts.unshift(newPost)

      // Save back to localStorage
      localStorage.setItem("hackhub-posts", JSON.stringify(posts))

      // Show success toast
      toast({
        title: "Post created",
        description: "Your post has been published successfully!",
      })

      // Reset form and close modal
      setCaption("")
      setImagePreview(null)
      setIsSubmitting(false)
      onClose()

      // Refresh the page to show the new post
      router.refresh()
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-mono glow-text">Create Post</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size="sm" />
              <span className="font-semibold">{user.name}</span>
            </div>
          )}

          <Textarea
            placeholder="What's on your mind?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="min-h-[120px] bg-muted/50 border-muted focus:border-neon-green focus:ring-1 focus:ring-neon-green resize-none"
          />

          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Post preview"
                className="w-full h-auto rounded-md border border-border/40"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-90"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-border/40 rounded-md p-8 text-center cursor-pointer hover:border-neon-green/50 transition-colors"
              onClick={handleImageClick}
            >
              <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Click to upload an image</p>
            </div>
          )}

          <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageChange} />

          <Button
            className="w-full glow"
            onClick={handleSubmit}
            disabled={isSubmitting || (!caption.trim() && !imagePreview)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>Post</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
