"use client"

import { useState } from "react"
import { ChatInterface } from "./chat-interface"

// Mock data
const mockCurrentUser = {
  id: "user-1",
  name: "You",
  avatar: "/placeholder.svg?height=40&width=40&text=You",
  isOnline: true,
}

const mockOtherUser = {
  id: "user-2",
  name: "Sarah Connor",
  avatar: "/placeholder.svg?height=40&width=40&text=SC",
  isOnline: true,
  lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
}

const generateMockMessages = () => {
  const messages = [
    {
      id: "1",
      content: "Hey! How's the new security project going?",
      senderId: "user-2",
      senderName: "Sarah Connor",
      senderAvatar: mockOtherUser.avatar,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      type: "text" as const,
      status: "read" as const,
    },
    {
      id: "2",
      content:
        "It's going well! Just finished implementing the new encryption algorithm. The performance improvements are impressive.",
      senderId: "user-1",
      senderName: "You",
      senderAvatar: mockCurrentUser.avatar,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000), // 1h 55m ago
      type: "text" as const,
      status: "read" as const,
    },
    {
      id: "3",
      content: "That's awesome! Can you share some details about the algorithm?",
      senderId: "user-2",
      senderName: "Sarah Connor",
      senderAvatar: mockOtherUser.avatar,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 10 * 60 * 1000), // 1h 50m ago
      type: "text" as const,
      status: "read" as const,
    },
    {
      id: "4",
      content:
        "It's based on elliptic curve cryptography with some optimizations for mobile devices. The key generation is 40% faster now.",
      senderId: "user-1",
      senderName: "You",
      senderAvatar: mockCurrentUser.avatar,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15 * 60 * 1000), // 1h 45m ago
      type: "text" as const,
      status: "read" as const,
    },
    {
      id: "5",
      content: "Impressive! 🔥 Are you planning to open source it?",
      senderId: "user-2",
      senderName: "Sarah Connor",
      senderAvatar: mockOtherUser.avatar,
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      type: "text" as const,
      status: "read" as const,
    },
    {
      id: "6",
      content: "Yes, we're planning to release it next month after the security audit is complete.",
      senderId: "user-1",
      senderName: "You",
      senderAvatar: mockCurrentUser.avatar,
      timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      type: "text" as const,
      status: "read" as const,
    },
    {
      id: "7",
      content: "Perfect! I'd love to contribute to the project. Let me know when you need help with testing.",
      senderId: "user-2",
      senderName: "Sarah Connor",
      senderAvatar: mockOtherUser.avatar,
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      type: "text" as const,
      status: "read" as const,
    },
  ]

  return messages
}

export function ChatDemo() {
  const [messages, setMessages] = useState(generateMockMessages())
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      content,
      senderId: mockCurrentUser.id,
      senderName: mockCurrentUser.name,
      senderAvatar: mockCurrentUser.avatar,
      timestamp: new Date(),
      type: "text" as const,
      status: "sending" as const,
    }

    setMessages((prev) => [...prev, newMessage])

    // Simulate message status updates
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "sent" as const } : msg)))
    }, 500)

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "delivered" as const } : msg)),
      )
    }, 1000)

    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "read" as const } : msg)))
    }, 2000)

    // Simulate typing indicator and auto-reply
    setTimeout(() => {
      setIsTyping(true)
    }, 3000)

    setTimeout(() => {
      setIsTyping(false)
      const autoReply = {
        id: `auto-${Date.now()}`,
        content: "Thanks for sharing! I'll review the details and get back to you soon. 👍",
        senderId: mockOtherUser.id,
        senderName: mockOtherUser.name,
        senderAvatar: mockOtherUser.avatar,
        timestamp: new Date(),
        type: "text" as const,
        status: "sent" as const,
      }
      setMessages((prev) => [...prev, autoReply])
    }, 5000)
  }

  return (
    <div className="h-[600px] max-w-md mx-auto border border-border rounded-lg overflow-hidden bg-background shadow-lg">
      <ChatInterface
        currentUser={mockCurrentUser}
        otherUser={mockOtherUser}
        messages={messages}
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
      />
    </div>
  )
}
