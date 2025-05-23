"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Smile, Paperclip, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar: string
  timestamp: Date
  type: "text" | "image" | "file" | "code"
  status: "sending" | "sent" | "delivered" | "read"
}

interface User {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  lastSeen?: Date
}

interface ChatInterfaceProps {
  currentUser: User
  otherUser: User
  messages: Message[]
  onSendMessage: (content: string) => void
  isTyping?: boolean
  className?: string
}

export function ChatInterface({
  currentUser,
  otherUser,
  messages,
  onSendMessage,
  isTyping = false,
  className,
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      setNewMessage("")
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
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

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}

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

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.avatar || "/placeholder.svg"} alt={otherUser.name} />
              <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {otherUser.isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{otherUser.name}</h3>
            <p className="text-xs text-muted-foreground">
              {otherUser.isOnline ? "Online" : `Last seen ${formatTime(otherUser.lastSeen || new Date())}`}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
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
                  const isCurrentUser = message.senderId === currentUser.id
                  const showAvatar =
                    !isCurrentUser && (index === 0 || groupMessages[index - 1]?.senderId !== message.senderId)
                  const showTimestamp =
                    index === groupMessages.length - 1 || groupMessages[index + 1]?.senderId !== message.senderId

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2 max-w-[85%] sm:max-w-[70%]",
                        isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto",
                      )}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {showAvatar && !isCurrentUser ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.senderAvatar || "/placeholder.svg"} alt={message.senderName} />
                            <AvatarFallback className="text-xs">{message.senderName.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-8 w-8" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div className={cn("flex flex-col", isCurrentUser ? "items-end" : "items-start")}>
                        <div
                          className={cn(
                            "px-3 py-2 rounded-2xl max-w-full break-words",
                            isCurrentUser
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted rounded-bl-md",
                          )}
                        >
                          {message.type === "code" ? (
                            <div className="font-mono text-xs overflow-x-auto whitespace-pre bg-background/50 p-2 rounded border border-border/40">
                              {message.content.replace(/```\w*\n|```/g, "")}
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
                              isCurrentUser ? "flex-row-reverse" : "",
                            )}
                          >
                            <span>{formatTime(message.timestamp)}</span>
                            {isCurrentUser && (
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
          {isTyping && (
            <div className="flex gap-2 max-w-[85%] sm:max-w-[70%]">
              <Avatar className="h-8 w-8">
                <AvatarImage src={otherUser.avatar || "/placeholder.svg"} alt={otherUser.name} />
                <AvatarFallback className="text-xs">{otherUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border/40 bg-background/80 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          {/* Attachment Button */}
          <Button type="button" variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Input Area */}
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="pr-12 min-h-[40px] resize-none bg-muted/50 border-muted focus:border-primary focus:ring-1 focus:ring-primary"
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
          <Button type="submit" size="icon" className="h-10 w-10 flex-shrink-0" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
