"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar: string
  timestamp: Date
  type: "text" | "image" | "file"
  status: "sending" | "sent" | "delivered" | "read"
}

interface User {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  lastSeen?: Date
}

interface UseChatOptions {
  currentUser: User
  otherUser: User
  initialMessages?: Message[]
  onMessageSent?: (message: Message) => void
  onTypingStart?: () => void
  onTypingStop?: () => void
}

export function useChat({
  currentUser,
  otherUser,
  initialMessages = [],
  onMessageSent,
  onTypingStart,
  onTypingStop,
}: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Send a new message
  const sendMessage = useCallback(
    (content: string, type: "text" | "image" | "file" = "text") => {
      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random()}`,
        content,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        timestamp: new Date(),
        type,
        status: "sending",
      }

      setMessages((prev) => [...prev, newMessage])
      onMessageSent?.(newMessage)

      // Simulate message status progression
      setTimeout(() => updateMessageStatus(newMessage.id, "sent"), 500)
      setTimeout(() => updateMessageStatus(newMessage.id, "delivered"), 1000)
      setTimeout(() => updateMessageStatus(newMessage.id, "read"), 2000)

      return newMessage
    },
    [currentUser, onMessageSent],
  )

  // Update message status
  const updateMessageStatus = useCallback((messageId: string, status: Message["status"]) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, status } : msg)))
  }, [])

  // Handle typing indicators
  const startTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true)
      onTypingStart?.()
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      onTypingStop?.()
    }, 1000)
  }, [isTyping, onTypingStart, onTypingStop])

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    setIsTyping(false)
    onTypingStop?.()
  }, [onTypingStop])

  // Simulate receiving a message
  const receiveMessage = useCallback(
    (content: string, type: "text" | "image" | "file" = "text") => {
      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random()}`,
        content,
        senderId: otherUser.id,
        senderName: otherUser.name,
        senderAvatar: otherUser.avatar,
        timestamp: new Date(),
        type,
        status: "sent",
      }

      setMessages((prev) => [...prev, newMessage])
      return newMessage
    },
    [otherUser],
  )

  // Mark messages as read
  const markAsRead = useCallback((messageIds: string[]) => {
    setMessages((prev) => prev.map((msg) => (messageIds.includes(msg.id) ? { ...msg, status: "read" } : msg)))
  }, [])

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([])
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return {
    messages,
    isTyping,
    otherUserTyping,
    sendMessage,
    receiveMessage,
    startTyping,
    stopTyping,
    updateMessageStatus,
    markAsRead,
    clearChat,
    setOtherUserTyping,
  }
}
