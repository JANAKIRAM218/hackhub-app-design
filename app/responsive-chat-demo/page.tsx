"use client"

import { useState } from "react"
import { MainNav } from "@/components/main-nav"
import { ResponsiveChatMessages } from "@/components/responsive-chat-messages"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface ChatMessage {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar: string
  timestamp: Date
  type: "text" | "image" | "voice" | "reaction"
  isCurrentUser: boolean
  reactions?: string[]
  imageUrl?: string
}

export default function ResponsiveChatDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Hey! How's the new project coming along?",
      senderId: "alex",
      senderName: "Alex Chen",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      type: "text",
      isCurrentUser: false,
    },
    {
      id: "2",
      content: "It's going great! Just finished the responsive design. Want to see a preview?",
      senderId: "user",
      senderName: "You",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      timestamp: new Date(Date.now() - 58 * 60 * 1000),
      type: "text",
      isCurrentUser: true,
      reactions: ["👍", "🔥"],
    },
    {
      id: "3",
      content: "I'd love to check it out 🚀",
      senderId: "alex",
      senderName: "Alex Chen",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      timestamp: new Date(Date.now() - 55 * 60 * 1000),
      type: "text",
      isCurrentUser: false,
      reactions: ["🚀", "❤️"],
    },
    {
      id: "4",
      content: "Here's a screenshot of the mobile view",
      senderId: "user",
      senderName: "You",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      timestamp: new Date(Date.now() - 50 * 60 * 1000),
      type: "image",
      isCurrentUser: true,
      imageUrl: "/placeholder.svg?height=300&width=200",
    },
    {
      id: "5",
      content:
        "Wow, that looks amazing! The responsive design is really clean. I especially like how the avatars adapt to different screen sizes.",
      senderId: "alex",
      senderName: "Alex Chen",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      type: "text",
      isCurrentUser: false,
    },
    {
      id: "6",
      content:
        "Thanks! I spent a lot of time making sure it works well on both mobile and desktop. The message bubbles never exceed 75% width and the input stays fixed at the bottom.",
      senderId: "user",
      senderName: "You",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      timestamp: new Date(Date.now() - 40 * 60 * 1000),
      type: "text",
      isCurrentUser: true,
    },
    {
      id: "7",
      content: "Perfect! And I see you handled the mobile keyboard issue too. That's always tricky to get right.",
      senderId: "alex",
      senderName: "Alex Chen",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      timestamp: new Date(Date.now() - 35 * 60 * 1000),
      type: "text",
      isCurrentUser: false,
    },
    {
      id: "8",
      content: "Yeah, I used CSS custom properties to handle the viewport height changes. Works like a charm! 💪",
      senderId: "user",
      senderName: "You",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: "text",
      isCurrentUser: true,
      reactions: ["💪", "🔥"],
    },
  ])

  const currentUser = {
    id: "user",
    name: "You",
    avatar: "/placeholder.svg?height=40&width=40",
  }

  const otherUser = {
    id: "alex",
    name: "Alex Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
  }

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const currentReactions = msg.reactions || []
          const hasReaction = currentReactions.includes(emoji)

          return {
            ...msg,
            reactions: hasReaction ? currentReactions.filter((r) => r !== emoji) : [...currentReactions, emoji],
          }
        }
        return msg
      }),
    )
  }

  const handleSendMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      timestamp: new Date(),
      type: "text",
      isCurrentUser: true,
    }

    setMessages((prev) => [...prev, newMessage])

    // Simulate a response after a delay
    setTimeout(
      () => {
        const responses = [
          "That's awesome! 🎉",
          "Nice work on that feature!",
          "I love the attention to detail",
          "This is exactly what we needed",
          "Great job! 👏",
        ]

        const responseMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: responses[Math.floor(Math.random() * responses.length)],
          senderId: otherUser.id,
          senderName: otherUser.name,
          senderAvatar: otherUser.avatar,
          timestamp: new Date(),
          type: "text",
          isCurrentUser: false,
        }

        setMessages((prev) => [...prev, responseMessage])
      },
      1000 + Math.random() * 2000,
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainNav />

      <div className="flex-1 flex flex-col w-full max-w-full overflow-hidden">
        {/* Header - Only visible on larger screens */}
        <div className="hidden sm:flex items-center gap-4 px-4 py-6 container mx-auto">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Responsive Chat Demo</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Instagram-inspired chat interface with full responsiveness
            </p>
          </div>
        </div>

        {/* Mobile Header - Only visible on mobile */}
        <div className="flex sm:hidden items-center gap-2 p-3 border-b border-border/40">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-semibold">{otherUser.name}</h2>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 w-full max-w-full flex flex-col">
          <ResponsiveChatMessages
            messages={messages}
            currentUser={currentUser}
            otherUser={otherUser}
            onSendMessage={handleSendMessage}
            onReaction={handleReaction}
            className="flex-1 w-full max-w-full sm:container sm:mx-auto sm:my-0 sm:shadow-lg"
          />
        </div>

        {/* Features List - Only visible on larger screens */}
        <div className="hidden sm:block container mx-auto mt-8 p-4 sm:p-6 bg-muted/50 rounded-lg mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Features Demonstrated:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Responsive message bubbles (max 75% width)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Adaptive avatars (hide/resize on mobile)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Fixed input area with mobile keyboard handling</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Smooth scrolling and auto-scroll to new messages</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Tap-to-react functionality like Instagram</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Instagram-inspired design and interactions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
