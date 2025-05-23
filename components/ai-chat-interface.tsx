"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Smile, RefreshCw, Sparkles, Mic, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAIChat, type AIChatMessage } from "@/hooks/use-ai-chat"
import { SonixAssistant } from "@/components/sonix-assistant"
import { VoiceRecorder } from "@/components/voice-recorder"
import { AudioPlayer } from "@/components/audio-player"

interface User {
  id: string
  name: string
  avatar: string
}

interface AIChatInterfaceProps {
  currentUser: User
  className?: string
}

export function AIChatInterface({ currentUser, className }: AIChatInterfaceProps) {
  const { messages, isAITyping, sendMessageToAI, sendVoiceMessageToAI, clearChat } = useAIChat()
  const [newMessage, setNewMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isAITyping])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      sendMessageToAI(newMessage.trim())
      setNewMessage("")
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  const handleVoiceRecordingComplete = (audioBlob: Blob) => {
    sendVoiceMessageToAI(audioBlob)
    setIsRecording(false)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      }).format(date)
    }
  }

  const groupMessagesByDate = (messages: AIChatMessage[]) => {
    const groups: { [key: string]: AIChatMessage[] } = {}

    messages.forEach((message) => {
      const dateKey = message.timestamp.toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(message)
    })

    return Object.entries(groups).map(([dateKey, msgs]) => ({
      date: new Date(dateKey),
      messages: msgs,
    }))
  }

  const messageGroups = groupMessagesByDate(messages)

  // Add welcome message if no messages
  useEffect(() => {
    if (messages.length === 0) {
      sendMessageToAI("Hello")
    }
  }, [messages.length, sendMessageToAI])

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <SonixAssistant isTyping={isAITyping} />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate flex items-center gap-1">
              Sonix <Sparkles className="h-3.5 w-3.5 text-neon-blue" />
            </h3>
            <p className="text-xs text-muted-foreground">{isAITyping ? "Typing..." : "AI Assistant"}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearChat} title="Clear chat">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messageGroups.map(({ date, messages: groupMessages }) => (
            <div key={date.toISOString()}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">{formatDate(date)}</div>
              </div>

              {/* Messages */}
              <div className="space-y-2">
                {groupMessages.map((message, index) => {
                  const isUser = message.sender === "user"
                  const showAvatar = !isUser && (index === 0 || groupMessages[index - 1]?.sender !== message.sender)
                  const showTimestamp =
                    index === groupMessages.length - 1 || groupMessages[index + 1]?.sender !== message.sender

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2 max-w-[85%] sm:max-w-[70%]",
                        isUser ? "ml-auto flex-row-reverse" : "mr-auto",
                      )}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {showAvatar && !isUser ? (
                          <SonixAssistant isTyping={false} />
                        ) : isUser && showAvatar ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                            <AvatarFallback className="text-xs">{currentUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-8 w-8" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
                        <div
                          className={cn(
                            "px-3 py-2 rounded-2xl max-w-full break-words",
                            isUser
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 rounded-bl-md",
                            message.type === "voice" && "min-w-[200px]",
                          )}
                        >
                          {message.type === "voice" ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Volume2 className="h-4 w-4" />
                                <span className="text-sm font-medium">Voice Message</span>
                              </div>
                              {message.audioUrl && <AudioPlayer src={message.audioUrl} small />}
                            </div>
                          ) : (
                            <p className="text-sm">{message.content}</p>
                          )}
                        </div>

                        {/* Timestamp and Status */}
                        {showTimestamp && (
                          <div
                            className={cn(
                              "flex items-center gap-1 mt-1 text-xs text-muted-foreground",
                              isUser ? "flex-row-reverse" : "",
                            )}
                          >
                            <span>{formatTime(message.timestamp)}</span>
                            {isUser && (
                              <span className="text-xs">
                                {message.status === "sending" && "⏳"}
                                {message.status === "sent" && "✓"}
                                {message.status === "delivered" && "✓✓"}
                                {message.status === "read" && "✓✓"}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isAITyping && (
            <div className="flex gap-2 max-w-[85%] sm:max-w-[70%]">
              <SonixAssistant isTyping={true} />
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 px-4 py-2 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border/40 bg-background/80 backdrop-blur-sm">
        {isRecording ? (
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecordingComplete}
            onCancel={() => setIsRecording(false)}
            maxDuration={60}
          />
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            {/* Voice Message Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 flex-shrink-0 text-neon-blue hover:bg-blue-500/10 hover:text-blue-500"
              onClick={() => setIsRecording(true)}
            >
              <Mic className="h-5 w-5" />
            </Button>

            {/* Input Area */}
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask Sonix anything..."
                className="pr-12 min-h-[40px] resize-none bg-muted/50 border-muted focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
              />

              {/* Emoji Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-4 w-4" />
              </Button>

              {/* Simple Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 bg-background border border-border rounded-lg p-2 shadow-lg z-10">
                  <div className="grid grid-cols-6 gap-1">
                    {["😀", "😂", "😍", "🤔", "😢", "😡", "👍", "👎", "❤️", "🔥", "💯", "🎉"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className="p-2 hover:bg-muted rounded text-lg"
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 animate-pulse-glow-blue"
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
