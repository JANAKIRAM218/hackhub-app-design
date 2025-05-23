"use client"

import { useState, useEffect } from "react"
import { EnhancedChatInterface } from "@/components/enhanced-chat-interface"

// Mock data
const currentUser = {
  id: "user-1",
  name: "You",
  avatar: "/placeholder.svg?height=40&width=40",
}

const otherUser = {
  id: "user-2",
  name: "Alex Chen",
  avatar: "/placeholder.svg?height=40&width=40&text=AC",
  isOnline: true,
  lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
}

// Initial messages
const initialMessages = [
  {
    id: "msg-1",
    content: "Hey there! How's your project coming along?",
    senderId: "user-2",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    status: "read" as const,
    type: "text" as const,
  },
  {
    id: "msg-2",
    content: "It's going well! Just working on the responsive design now.",
    senderId: "user-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23), // 23 hours ago
    status: "read" as const,
    type: "text" as const,
  },
  {
    id: "msg-3",
    content: "That's great! Do you have any screenshots to share?",
    senderId: "user-2",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22), // 22 hours ago
    status: "read" as const,
    type: "text" as const,
  },
  {
    id: "msg-4",
    content: "Here's what I've got so far:",
    senderId: "user-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: "read" as const,
    type: "text" as const,
  },
  {
    id: "msg-5",
    content: "UI Screenshot",
    senderId: "user-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000), // 2 hours ago + 1 second
    status: "read" as const,
    type: "image" as const,
    imageUrl: "/placeholder.svg?height=300&width=400&text=UI+Screenshot",
  },
  {
    id: "msg-6",
    content: "Wow, that looks amazing! I love the color scheme.",
    senderId: "user-2",
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    status: "read" as const,
    type: "text" as const,
  },
  {
    id: "msg-7",
    content: "Thanks! I spent a lot of time on it.",
    senderId: "user-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    status: "read" as const,
    type: "text" as const,
  },
  {
    id: "msg-8",
    content: "I also recorded a voice note explaining some of the features:",
    senderId: "user-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 29), // 29 minutes ago
    status: "read" as const,
    type: "text" as const,
  },
  {
    id: "msg-9",
    content: "[Voice Message]",
    senderId: "user-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 28), // 28 minutes ago
    status: "read" as const,
    type: "voice" as const,
    audioUrl: "/audio/background/soft-ambient.mp3",
  },
  {
    id: "msg-10",
    content: "That's really helpful, thanks for the detailed explanation!",
    senderId: "user-2",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    status: "read" as const,
    type: "text" as const,
    replyTo: {
      id: "msg-9",
      content: "[Voice Message]",
      senderId: "user-1",
    },
  },
  {
    id: "msg-11",
    content: "No problem! Let me know if you have any other questions.",
    senderId: "user-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    status: "delivered" as const,
    type: "text" as const,
  },
  {
    id: "msg-12",
    content: "I'll send you the updated design tomorrow.",
    senderId: "user-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    status: "sent" as const,
    type: "text" as const,
  },
]

export default function EnhancedChatDemoPage() {
  const [messages, setMessages] = useState(initialMessages)

  // Simulate message delivery and read status updates
  useEffect(() => {
    const updateMessageStatus = () => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.senderId === currentUser.id && msg.status === "sent") {
            return { ...msg, status: "delivered" as const }
          }
          return msg
        }),
      )
    }

    const updateReadStatus = () => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.senderId === currentUser.id && msg.status === "delivered") {
            return { ...msg, status: "read" as const }
          }
          return msg
        }),
      )
    }

    // Update delivery status after 2 seconds
    const deliveryTimer = setTimeout(updateMessageStatus, 2000)

    // Update read status after 5 seconds
    const readTimer = setTimeout(updateReadStatus, 5000)

    return () => {
      clearTimeout(deliveryTimer)
      clearTimeout(readTimer)
    }
  }, [messages])

  const handleSendMessage = (content: string, type: "text" | "voice", replyToId?: string) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      content,
      senderId: currentUser.id,
      timestamp: new Date(),
      status: "sending" as const,
      type,
      ...(type === "voice" ? { audioUrl: "/audio/background/soft-ambient.mp3" } : {}),
      ...(replyToId
        ? {
            replyTo: {
              id: replyToId,
              content: messages.find((m) => m.id === replyToId)?.content || "",
              senderId: messages.find((m) => m.id === replyToId)?.senderId || "",
            },
          }
        : {}),
    }

    setMessages((prev) => [...prev, newMessage])

    // Simulate sending status update
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "sent" as const } : msg)))
    }, 1000)

    // Simulate reply after 3 seconds
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const replyMessage = {
          id: `msg-${Date.now()}`,
          content: getRandomReply(),
          senderId: otherUser.id,
          timestamp: new Date(),
          status: "sent" as const,
          type: "text" as const,
        }

        setMessages((prev) => [...prev, replyMessage])
      }, 3000)
    }
  }

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, isDeleted: true } : msg)))
  }

  const getRandomReply = () => {
    const replies = [
      "That sounds great!",
      "Thanks for letting me know.",
      "I'll check it out later.",
      "Can you send me more details?",
      "I'm looking forward to seeing the final result!",
      "Let's discuss this more tomorrow.",
      "Perfect, that works for me.",
      "I appreciate your help with this project.",
    ]

    return replies[Math.floor(Math.random() * replies.length)]
  }

  return (
    <div className="container py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Enhanced Chat Interface</h1>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-card rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">Features</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Fully responsive design for mobile, tablet, and desktop</li>
            <li>Swipe to reply (swipe right) and swipe to delete (swipe left)</li>
            <li>Voice message recording and playback</li>
            <li>Message search functionality</li>
            <li>Message status indicators (sending, sent, delivered, read)</li>
            <li>Haptic feedback on actions (if supported by device)</li>
            <li>Emoji picker</li>
            <li>Reply threading</li>
            <li>Date separators and timestamps</li>
          </ul>
        </div>

        <EnhancedChatInterface
          messages={messages}
          currentUser={currentUser}
          otherUser={otherUser}
          onSendMessage={handleSendMessage}
          onDeleteMessage={handleDeleteMessage}
        />
      </div>
    </div>
  )
}
