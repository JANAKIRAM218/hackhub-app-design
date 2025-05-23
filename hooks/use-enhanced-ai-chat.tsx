"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { enhancedAIService } from "@/services/enhanced-ai-service"
import type { EnhancedMessage } from "@/types/conversation"

export function useEnhancedAIChat(conversationId: string) {
  const [messages, setMessages] = useState<EnhancedMessage[]>([])
  const [isAITyping, setIsAITyping] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [forwardingMessage, setForwardingMessage] = useState<EnhancedMessage | null>(null)

  // Track read receipts
  const [readReceipts, setReadReceipts] = useState<Record<string, Date>>({})

  // Use a ref to track the latest messages for async operations
  const messagesRef = useRef<EnhancedMessage[]>([])

  // Update the ref when messages change
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // Initialize context when messages change
  useEffect(() => {
    enhancedAIService.updateContext(conversationId, messages)

    // Generate suggestions based on last message
    const lastMessage = messages[messages.length - 1]
    const newSuggestions = enhancedAIService.generateMessageSuggestions(conversationId, lastMessage?.content)
    setSuggestions(newSuggestions)
  }, [conversationId, messages])

  // Mark messages as read
  const markMessagesAsRead = useCallback((messageIds: string[]) => {
    const now = new Date()

    setReadReceipts((prev) => {
      const updated = { ...prev }
      messageIds.forEach((id) => {
        if (!updated[id]) {
          updated[id] = now
        }
      })
      return updated
    })

    // Update message status in the messages array
    setMessages((prev) =>
      prev.map((msg) =>
        messageIds.includes(msg.id) && msg.status !== "read" ? { ...msg, status: "read" as const } : msg,
      ),
    )
  }, [])

  // Edit a message
  const editMessage = useCallback((messageId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              content: newContent,
              isEdited: true,
              editedAt: new Date(),
            }
          : msg,
      ),
    )
    setEditingMessage(null)
  }, [])

  // Forward a message to another conversation
  const forwardMessage = useCallback((message: EnhancedMessage, targetConversationId: string) => {
    // In a real app, this would send the message to another conversation
    console.log(`Forwarding message ${message.id} to conversation ${targetConversationId}`)

    // For demo purposes, we'll just show a simulated forwarded message
    const forwardedMessage: EnhancedMessage = {
      ...message,
      id: `forwarded-${Date.now()}`,
      timestamp: new Date(),
      status: "sent",
      isForwarded: true,
      originalSenderId: message.senderId,
      originalSenderName: message.senderName,
    }

    setMessages((prev) => [...prev, forwardedMessage])
    setForwardingMessage(null)

    return forwardedMessage
  }, [])

  // Send text message to AI with improved error handling
  const sendMessageToAI = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      // Reset error state
      setError(null)

      // Add user message
      const userMessage: EnhancedMessage = {
        id: `user-msg-${Date.now()}`,
        content,
        senderId: "user-1",
        senderName: "You",
        senderAvatar: "/placeholder.svg?height=40&width=40",
        timestamp: new Date(),
        status: "sent",
        type: "text",
      }

      setMessages((prev) => [...prev, userMessage])

      // Show typing indicator immediately
      setIsAITyping(true)

      try {
        // Generate AI response with context
        const aiResponse = await enhancedAIService.generateResponse(conversationId, content)

        // Check if there was an error in the metadata
        if (aiResponse.metadata?.error) {
          throw new Error(aiResponse.metadata.error)
        }

        // Add AI message
        const aiMessage: EnhancedMessage = {
          id: `ai-msg-${Date.now()}`,
          content: aiResponse.content,
          senderId: "sonix",
          senderName: "Sonix",
          senderAvatar: "/placeholder.svg?height=40&width=40&text=S",
          timestamp: aiResponse.timestamp,
          status: "delivered", // Initially delivered, will be marked as read when viewed
          type: aiResponse.type === "image" ? "ai-generated-image" : aiResponse.type === "voice" ? "voice" : "text",
          audioUrl: aiResponse.audioUrl,
          imageUrl: aiResponse.imageUrl,
          metadata: aiResponse.metadata,
        }

        // Use functional update to ensure we're working with the latest state
        setMessages((prev) => [...prev, aiMessage])

        // Automatically mark AI messages as read after a short delay
        setTimeout(() => {
          markMessagesAsRead([aiMessage.id])
        }, 2000)
      } catch (error) {
        console.error("Error generating AI response:", error)
        setError(error instanceof Error ? error.message : "Unknown error occurred")

        // Add error message
        const errorMessage: EnhancedMessage = {
          id: `ai-error-${Date.now()}`,
          content: "Sorry, I'm having trouble processing your request right now. Please try again later.",
          senderId: "sonix",
          senderName: "Sonix",
          senderAvatar: "/placeholder.svg?height=40&width=40&text=S",
          timestamp: new Date(),
          status: "failed",
          type: "text",
        }

        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsAITyping(false)
      }
    },
    [conversationId, markMessagesAsRead],
  )

  // Send voice message to AI
  const sendVoiceMessageToAI = useCallback(
    async (audioBlob: Blob) => {
      const audioUrl = URL.createObjectURL(audioBlob)

      // Reset error state
      setError(null)

      // Add user voice message
      const userMessage: EnhancedMessage = {
        id: `user-voice-${Date.now()}`,
        content: "[Voice Message]",
        senderId: "user-1",
        senderName: "You",
        senderAvatar: "/placeholder.svg?height=40&width=40",
        timestamp: new Date(),
        status: "sent",
        type: "voice",
        audioUrl,
      }

      setMessages((prev) => [...prev, userMessage])
      setIsAITyping(true)

      try {
        // Generate AI response for voice message
        const aiResponse = await enhancedAIService.generateResponse(conversationId, "[Voice Message]", true)

        // Check if there was an error in the metadata
        if (aiResponse.metadata?.error) {
          throw new Error(aiResponse.metadata.error)
        }

        const aiMessage: EnhancedMessage = {
          id: `ai-msg-${Date.now()}`,
          content: aiResponse.content,
          senderId: "sonix",
          senderName: "Sonix",
          senderAvatar: "/placeholder.svg?height=40&width=40&text=S",
          timestamp: aiResponse.timestamp,
          status: "delivered",
          type: aiResponse.type === "image" ? "ai-generated-image" : aiResponse.type === "voice" ? "voice" : "text",
          audioUrl: aiResponse.audioUrl,
          imageUrl: aiResponse.imageUrl,
          metadata: aiResponse.metadata,
        }

        setMessages((prev) => [...prev, aiMessage])

        // Automatically mark AI messages as read after a short delay
        setTimeout(() => {
          markMessagesAsRead([aiMessage.id])
        }, 2000)
      } catch (error) {
        console.error("Error generating AI response:", error)
        setError(error instanceof Error ? error.message : "Unknown error occurred")

        // Add error message
        const errorMessage: EnhancedMessage = {
          id: `ai-error-${Date.now()}`,
          content: "Sorry, I couldn't process your voice message. Please try again later.",
          senderId: "sonix",
          senderName: "Sonix",
          senderAvatar: "/placeholder.svg?height=40&width=40&text=S",
          timestamp: new Date(),
          status: "failed",
          type: "text",
        }

        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsAITyping(false)
      }
    },
    [conversationId, markMessagesAsRead],
  )

  // Send file to AI
  const sendFileToAI = useCallback(
    async (file: any) => {
      // Reset error state
      setError(null)

      // Add user file message
      const userMessage: EnhancedMessage = {
        id: `user-file-${Date.now()}`,
        content: file.fileName,
        senderId: "user-1",
        senderName: "You",
        senderAvatar: "/placeholder.svg?height=40&width=40",
        timestamp: new Date(),
        status: "sent",
        type: file.mimeType?.startsWith("image/") ? "image" : "file",
        fileUrl: file.fileUrl,
        fileName: file.fileName,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        imageUrl: file.mimeType?.startsWith("image/") ? file.fileUrl : undefined,
        metadata: file.metadata,
      }

      setMessages((prev) => [...prev, userMessage])
      setIsAITyping(true)

      try {
        // Generate AI response based on file type
        let prompt = `I've shared a ${file.mimeType?.startsWith("image/") ? "image" : "file"} with you: ${file.fileName}`

        if (file.mimeType?.startsWith("image/")) {
          prompt += ". Can you tell me what you see in this image?"
        }

        const aiResponse = await enhancedAIService.generateResponse(conversationId, prompt)

        // Check if there was an error in the metadata
        if (aiResponse.metadata?.error) {
          throw new Error(aiResponse.metadata.error)
        }

        const aiMessage: EnhancedMessage = {
          id: `ai-msg-${Date.now()}`,
          content: aiResponse.content,
          senderId: "sonix",
          senderName: "Sonix",
          senderAvatar: "/placeholder.svg?height=40&width=40&text=S",
          timestamp: aiResponse.timestamp,
          status: "delivered",
          type: aiResponse.type === "image" ? "ai-generated-image" : aiResponse.type === "voice" ? "voice" : "text",
          audioUrl: aiResponse.audioUrl,
          imageUrl: aiResponse.imageUrl,
          metadata: aiResponse.metadata,
        }

        setMessages((prev) => [...prev, aiMessage])

        // Automatically mark AI messages as read after a short delay
        setTimeout(() => {
          markMessagesAsRead([aiMessage.id])
        }, 2000)
      } catch (error) {
        console.error("Error generating AI response:", error)
        setError(error instanceof Error ? error.message : "Unknown error occurred")

        // Add error message
        const errorMessage: EnhancedMessage = {
          id: `ai-error-${Date.now()}`,
          content: "Sorry, I couldn't process your file. Please try again later.",
          senderId: "sonix",
          senderName: "Sonix",
          senderAvatar: "/placeholder.svg?height=40&width=40&text=S",
          timestamp: new Date(),
          status: "failed",
          type: "text",
        }

        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsAITyping(false)
      }
    },
    [conversationId, markMessagesAsRead],
  )

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([])
    setSuggestions([])
    setError(null)
    setEditingMessage(null)
    setForwardingMessage(null)
    setReadReceipts({})
  }, [])

  return {
    messages,
    isAITyping,
    suggestions,
    error,
    readReceipts,
    editingMessage,
    forwardingMessage,
    sendMessageToAI,
    sendVoiceMessageToAI,
    sendFileToAI,
    clearChat,
    markMessagesAsRead,
    editMessage,
    setEditingMessage,
    forwardMessage,
    setForwardingMessage,
  }
}
