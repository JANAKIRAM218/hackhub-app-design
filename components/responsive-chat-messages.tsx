"use client"

import type React from "react"
import type { ChatMessage } from "@/types/message"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Smile, Camera, Mic, Heart, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { SwipeableMessage } from "@/components/swipeable-message"
import { ReplyPreview } from "@/components/reply-preview"

interface ResponsiveChatMessagesProps {
  messages: ChatMessage[]
  currentUser: {
    id: string
    name: string
    avatar: string
  }
  otherUser: {
    id: string
    name: string
    avatar: string
    isOnline: boolean
  }
  onSendMessage: (content: string, replyToId?: string) => void
  onReaction?: (messageId: string, emoji: string) => void
  className?: string
}

export function ResponsiveChatMessages({
  messages,
  currentUser,
  otherUser,
  onSendMessage,
  onReaction,
  className,
}: ResponsiveChatMessagesProps) {
  const [newMessage, setNewMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [activeReactionMessage, setActiveReactionMessage] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Handle viewport height changes (mobile keyboard)
  useEffect(() => {
    const handleResize = () => {
      if (chatContainerRef.current) {
        const vh = window.innerHeight * 0.01
        document.documentElement.style.setProperty("--vh", `${vh}px`)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    })
  }, [messages])

  // Handle typing indicator
  useEffect(() => {
    if (newMessage.trim()) {
      setIsTyping(true)
      const timer = setTimeout(() => setIsTyping(false), 1000)
      return () => clearTimeout(timer)
    } else {
      setIsTyping(false)
    }
  }, [newMessage])

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showEmojiPicker && !e.target) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [showEmojiPicker])

  // Focus input when replying
  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus()
    }
  }, [replyingTo])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim(), replyingTo?.id)
      setNewMessage("")
      setReplyingTo(null)
      inputRef.current?.focus()
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {}

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

  const handleReaction = (messageId: string, emoji: string) => {
    if (onReaction) {
      onReaction(messageId, emoji)
    }
    setActiveReactionMessage(null)
  }

  const toggleReactionMenu = (messageId: string) => {
    setActiveReactionMessage(activeReactionMessage === messageId ? null : messageId)
  }

  const handleReply = (message: ChatMessage) => {
    setReplyingTo(message)
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  const messageGroups = groupMessagesByDate(messages)

  // Common reaction emojis
  const quickReactions = ["❤️", "👍", "👏", "😂", "😮", "😢"]

  // Find the original message being replied to
  const findOriginalMessage = (replyToId: string) => {
    return messages.find((msg) => msg.id === replyToId)
  }

  return (
    <div
      ref={chatContainerRef}
      className={cn(
        "flex flex-col w-full h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]",
        "sm:h-[calc(100vh-6rem)] sm:max-h-[700px] sm:rounded-lg sm:border sm:border-border/40",
        "bg-background overflow-hidden relative",
        className,
      )}
      style={{ height: "calc(var(--vh, 1vh) * 100 - 4rem)" }}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border/40 bg-background/95 backdrop-blur-sm shrink-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="relative shrink-0">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
              <AvatarImage src={otherUser.avatar || "/placeholder.svg"} alt={otherUser.name} />
              <AvatarFallback className="text-xs sm:text-sm">{otherUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {otherUser.isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500 border-2 border-background"></span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base truncate">{otherUser.name}</h3>
            <p className="text-xs text-muted-foreground">{otherUser.isOnline ? "Active now" : "Active 2h ago"}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden">
        <div className="p-2 sm:p-4 space-y-4 w-full">
          {messageGroups.map(({ date, messages: groupMessages }) => (
            <div key={date.toISOString()} className="w-full">
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4 sm:my-6">
                <div className="bg-muted px-2 sm:px-3 py-1 rounded-full text-xs text-muted-foreground">
                  {formatDate(date)}
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-1 sm:space-y-2 w-full">
                {groupMessages.map((message, index) => {
                  const showAvatar =
                    !message.isCurrentUser && (index === 0 || groupMessages[index - 1]?.senderId !== message.senderId)

                  const showTimestamp =
                    index === groupMessages.length - 1 || groupMessages[index + 1]?.senderId !== message.senderId

                  // Get original message if this is a reply
                  const originalMessage = message.replyTo ? findOriginalMessage(message.replyTo.id) : null

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-1 sm:gap-2 items-end w-full",
                        message.isCurrentUser ? "justify-end" : "justify-start",
                      )}
                    >
                      {/* Avatar (hidden on mobile for received messages) */}
                      {!message.isCurrentUser && (
                        <div className="shrink-0 w-6 sm:w-8">
                          {showAvatar ? (
                            <Avatar className="h-6 w-6 sm:h-8 sm:w-8 hidden sm:flex">
                              <AvatarImage src={message.senderAvatar || "/placeholder.svg"} alt={message.senderName} />
                              <AvatarFallback className="text-xs">{message.senderName.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ) : null}
                        </div>
                      )}

                      {/* Message Content */}
                      <div
                        className={cn(
                          "flex flex-col max-w-[75%] sm:max-w-[70%] min-w-0",
                          message.isCurrentUser ? "items-end" : "items-start",
                        )}
                      >
                        {/* Swipeable Message Container */}
                        <SwipeableMessage onReply={() => handleReply(message)} isCurrentUser={message.isCurrentUser}>
                          {/* Message Bubble */}
                          <div
                            className={cn(
                              "relative px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl break-words cursor-pointer",
                              "text-sm sm:text-base leading-relaxed select-none",
                              "transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]",
                              message.isCurrentUser
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted rounded-bl-md",
                              message.type === "image" && "p-1 sm:p-2",
                            )}
                            onClick={() => toggleReactionMenu(message.id)}
                            onDoubleClick={() => {
                              if (onReaction) {
                                onReaction(message.id, "❤️")
                              }
                            }}
                          >
                            {/* Reply Preview (if this message is a reply) */}
                            {message.replyTo && (
                              <div
                                className={cn(
                                  "mb-1 pb-1 text-xs border-l-2 pl-2 -ml-1",
                                  "border-primary/40 text-muted-foreground",
                                  "flex flex-col",
                                )}
                              >
                                <span className="font-medium text-primary/70">
                                  {message.replyTo.isCurrentUser ? "You" : message.replyTo.senderName}
                                </span>
                                <span className="truncate">{message.replyTo.content}</span>
                              </div>
                            )}

                            {message.type === "image" ? (
                              <div className="space-y-1 sm:space-y-2">
                                <img
                                  src={message.imageUrl || "/placeholder.svg"}
                                  alt="Shared image"
                                  className="rounded-lg max-w-full h-auto max-h-64 sm:max-h-80"
                                />
                                {message.content && <p className="px-2 py-1 text-sm">{message.content}</p>}
                              </div>
                            ) : (
                              <p className="break-words whitespace-pre-wrap">{message.content}</p>
                            )}

                            {/* Reaction Menu */}
                            {activeReactionMessage === message.id && (
                              <div
                                className={cn(
                                  "absolute -top-12 left-0 right-0 mx-auto w-fit",
                                  "flex items-center gap-1 p-1 rounded-full bg-background shadow-lg border border-border/40",
                                  "z-50 animate-in fade-in slide-in-from-bottom-2 duration-200",
                                )}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {quickReactions.map((emoji) => (
                                  <button
                                    key={emoji}
                                    className={cn(
                                      "w-8 h-8 flex items-center justify-center rounded-full",
                                      "hover:bg-muted transition-all duration-150",
                                      "text-lg hover:scale-125",
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleReaction(message.id, emoji)
                                    }}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Reactions */}
                            {message.reactions && message.reactions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1 sm:mt-2">
                                {message.reactions.map((reaction, idx) => (
                                  <button
                                    key={idx}
                                    className={cn(
                                      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs",
                                      "bg-background/80 border border-border/40 hover:bg-muted/50",
                                      "transition-all duration-150 ease-out hover:scale-105 active:scale-95",
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      // Toggle reaction
                                      handleReaction(message.id, reaction)
                                    }}
                                  >
                                    <span className="text-sm">{reaction}</span>
                                    <span className="text-xs text-muted-foreground font-medium">1</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </SwipeableMessage>

                        {/* Timestamp */}
                        {showTimestamp && (
                          <div
                            className={cn(
                              "flex items-center gap-1 mt-1 text-xs text-muted-foreground",
                              message.isCurrentUser ? "flex-row-reverse" : "",
                            )}
                          >
                            <span>{formatTime(message.timestamp)}</span>
                            {message.isCurrentUser && <span className="text-xs">✓✓</span>}
                          </div>
                        )}
                      </div>

                      {/* Current user avatar (mobile only) */}
                      {message.isCurrentUser && (
                        <div className="shrink-0 w-6 sm:w-8">
                          {showAvatar && (
                            <Avatar className="h-6 w-6 sm:h-8 sm:w-8 sm:hidden">
                              <AvatarImage src={message.senderAvatar || "/placeholder.svg"} alt={message.senderName} />
                              <AvatarFallback className="text-xs">{message.senderName.charAt(0)}</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-1 sm:gap-2 items-end">
              <div className="shrink-0 w-6 sm:w-8">
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8 hidden sm:flex">
                  <AvatarImage src={otherUser.avatar || "/placeholder.svg"} alt={otherUser.name} />
                  <AvatarFallback className="text-xs">{otherUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="bg-muted px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-2 sm:p-4 border-t border-border/40 bg-background/95 backdrop-blur-sm shrink-0 z-10">
        {/* Reply Preview */}
        {replyingTo && (
          <ReplyPreview
            message={{
              id: replyingTo.id,
              content: replyingTo.content,
              senderName: replyingTo.senderName,
              isCurrentUser: replyingTo.isCurrentUser,
            }}
            onCancel={cancelReply}
            className="mb-2"
          />
        )}

        <form onSubmit={handleSendMessage} className="flex items-end gap-2 sm:gap-3">
          {/* Camera Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          {/* Input Container */}
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={replyingTo ? "Reply to message..." : "Message..."}
              className={cn(
                "pr-20 sm:pr-24 rounded-full border-muted bg-muted/50",
                "text-sm sm:text-base h-8 sm:h-10",
                "focus:border-primary focus:ring-1 focus:ring-primary",
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
            />

            {/* Input Actions */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {!newMessage.trim() && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowEmojiPicker(!showEmojiPicker)
                    }}
                  >
                    <Smile className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Send/Like Button */}
          {newMessage.trim() ? (
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-full bg-primary hover:bg-primary/90"
            >
              <Send className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          )}
        </form>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-full left-2 sm:left-4 right-2 sm:right-4 mb-2 bg-background border border-border rounded-lg p-3 shadow-lg z-20">
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
              {["😀", "😂", "😍", "🤔", "😢", "😡", "👍", "👎", "❤️", "🔥", "💯", "🎉", "😎", "🤗", "😴", "🤯"].map(
                (emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="p-1 sm:p-2 hover:bg-muted rounded text-lg sm:text-xl"
                    onClick={() => {
                      setNewMessage((prev) => prev + emoji)
                      setShowEmojiPicker(false)
                      inputRef.current?.focus()
                    }}
                  >
                    {emoji}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
