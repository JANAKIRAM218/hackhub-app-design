"use client"

import { useState, useCallback } from "react"
import { generateAIResponse } from "@/services/ai-service"

export interface AIChatMessage {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  status: "sending" | "sent" | "delivered" | "read"
  type: "text" | "voice"
  audioUrl?: string
}

export function useAIChat() {
  const [messages, setMessages] = useState<AIChatMessage[]>([])
  const [isAITyping, setIsAITyping] = useState(false)

  // Send text message to AI and get response
  const sendMessageToAI = useCallback(async (content: string) => {
    if (!content.trim()) return

    // Add user message
    const userMessage: AIChatMessage = {
      id: `user-msg-${Date.now()}`,
      content,
      sender: "user",
      timestamp: new Date(),
      status: "sent",
      type: "text",
    }

    setMessages((prev) => [...prev, userMessage])

    // Show AI typing indicator
    setIsAITyping(true)

    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(content)

      // Add AI message
      const aiMessage: AIChatMessage = {
        id: `ai-msg-${Date.now()}`,
        content: aiResponse.content,
        sender: "ai",
        timestamp: aiResponse.timestamp,
        status: "sent",
        type: aiResponse.type,
        audioUrl: aiResponse.audioUrl,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error generating AI response:", error)

      // Add error message
      const errorMessage: AIChatMessage = {
        id: `ai-error-${Date.now()}`,
        content: "Sorry, I'm having trouble processing your request right now. Please try again later.",
        sender: "ai",
        timestamp: new Date(),
        status: "sent",
        type: "text",
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsAITyping(false)
    }
  }, [])

  // Send voice message to AI
  const sendVoiceMessageToAI = useCallback(async (audioBlob: Blob) => {
    // Create object URL for the audio blob
    const audioUrl = URL.createObjectURL(audioBlob)

    // Add user voice message
    const userMessage: AIChatMessage = {
      id: `user-voice-${Date.now()}`,
      content: "[Voice Message]", // Placeholder text for voice messages
      sender: "user",
      timestamp: new Date(),
      status: "sent",
      type: "voice",
      audioUrl,
    }

    setMessages((prev) => [...prev, userMessage])

    // Show AI typing indicator
    setIsAITyping(true)

    try {
      // In a real app, you would send the audio to a speech-to-text service
      // and then pass the transcribed text to the AI
      // For now, we'll just simulate this process

      // Generate AI response (pass true to indicate it's a voice message)
      const aiResponse = await generateAIResponse("[Voice Message]", true)

      // Add AI message
      const aiMessage: AIChatMessage = {
        id: `ai-msg-${Date.now()}`,
        content: aiResponse.content,
        sender: "ai",
        timestamp: aiResponse.timestamp,
        status: "sent",
        type: aiResponse.type,
        audioUrl: aiResponse.audioUrl,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error generating AI response:", error)

      // Add error message
      const errorMessage: AIChatMessage = {
        id: `ai-error-${Date.now()}`,
        content: "Sorry, I'm having trouble processing your voice message right now. Please try again later.",
        sender: "ai",
        timestamp: new Date(),
        status: "sent",
        type: "text",
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsAITyping(false)
    }
  }, [])

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isAITyping,
    sendMessageToAI,
    sendVoiceMessageToAI,
    clearChat,
  }
}
