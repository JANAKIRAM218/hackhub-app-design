"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Send,
  Smile,
  Paperclip,
  Mic,
  X,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SwipeableMessage } from "./swipeable-message"
import { VoiceRecorder } from "./voice-recorder"
import { AudioPlayer } from "./audio-player"

// Message status types
type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed"

// Message types
interface Message {
  id: string
  content: string
  senderId: string
  timestamp: Date
  status: MessageStatus
  type: "text" | "image" | "voice" | "file"
  isDeleted?: boolean
  replyTo?: {
    id: string
    content: string
    senderId: string
  }
  // Media specific properties
  audioUrl?: string
  imageUrl?: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
}

interface EnhancedChatInterfaceProps {
  messages: Message[]
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
    lastSeen?: Date
  }
  onSendMessage: (content: string, type: "text" | "voice", replyToId?: string) => void
  onDeleteMessage?: (messageId: string) => void
  onVoiceRecorded?: (blob: Blob) => void
  className?: string
}

export function EnhancedChatInterface({
  messages,
  currentUser,
  otherUser,
  onSendMessage,
  onDeleteMessage,
  onVoiceRecorded,
  className,
}: EnhancedChatInterfaceProps) {
  // State
  const [inputValue, setInputValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messageRefs = useRef<{ [key: string]: HTMLDivElement }>({})

  // Effect to scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Effect to handle search results
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = messages
        .filter((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase()) && !msg.isDeleted)
        .map((msg) => msg.id)

      setSearchResults(results)
      setCurrentSearchIndex(0)

      if (results.length > 0) {
        scrollToMessage(results[0])
      }
    } else {
      setSearchResults([])
    }
  }, [searchQuery, messages])

  // Effect to detect scroll position
  useEffect(() => {
    const scrollArea = scrollAreaRef.current

    if (!scrollArea) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollArea
      setShowScrollToBottom(scrollHeight - scrollTop - clientHeight > 100)
    }

    scrollArea.addEventListener("scroll", handleScroll)
    return () => scrollArea.removeEventListener("scroll", handleScroll)
  }, [])

  // Effect to focus input when replying
  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus()
    }
  }, [replyingTo])

  // Utility functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollToMessage = (messageId: string) => {
    const messageEl = messageRefs.current[messageId]
    if (messageEl) {
      messageEl.scrollIntoView({ behavior: "smooth", block: "center" })
      // Highlight the message temporarily
      messageEl.classList.add("bg-primary/10")
      setTimeout(() => {
        messageEl.classList.remove("bg-primary/10")
      }, 1500)
    }
  }

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue, "text", replyingTo?.id)
      setInputValue("")
      setReplyingTo(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setInputValue((prev) => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  const handleVoiceRecordingComplete = (audioBlob: Blob) => {
    if (onVoiceRecorded) {
      onVoiceRecorded(audioBlob)
    }
    onSendMessage("[Voice message]", "voice", replyingTo?.id)
    setIsRecording(false)
    setReplyingTo(null)
  }

  const handleReply = (message: Message) => {
    setReplyingTo(message)
    triggerHapticFeedback()
  }

  const handleDeleteMessage = (messageId: string) => {
    if (onDeleteMessage) {
      onDeleteMessage(messageId)
      triggerHapticFeedback()
    }
    setMessageToDelete(null)
  }

  const handleSwipe = (messageId: string, direction: "left" | "right") => {
    setSwipeDirection(direction)

    if (direction === "left") {
      // Only allow deleting your own messages
      const message = messages.find((m) => m.id === messageId)
      if (message && message.senderId === currentUser.id) {
        setMessageToDelete(messageId)
        triggerHapticFeedback()
      }
    } else if (direction === "right") {
      const message = messages.find((m) => m.id === messageId)
      if (message && !message.isDeleted) {
        handleReply(message)
      }
    }
  }

  const triggerHapticFeedback = () => {
    // Check if vibration API is supported
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
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
      }).format(date)
    }
  }

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups, message) => {
      const date = message.timestamp.toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
      return groups
    },
    {} as Record<string, Message[]>,
  )

  // Get message status icon
  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case "sending":
        return <Clock className="h-3 w-3 text-muted-foreground" />
      case "sent":
        return <Check className="h-3 w-3 text-muted-foreground" />
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      case "failed":
        return <X className="h-3 w-3 text-red-500" />
      default:
        return null
    }
  }

  // Render message content based on type
  const renderMessageContent = (message: Message) => {
    if (message.isDeleted) {
      return <div className="italic text-muted-foreground text-sm">This message was deleted</div>
    }

    switch (message.type) {
      case "image":
        return (
          <div className="space-y-1">
            <img
              src={message.imageUrl || "/placeholder.svg"}
              alt="Image"
              className="rounded-md max-w-full max-h-60 object-contain"
            />
            {message.content && <p>{message.content}</p>}
          </div>
        )
      case "voice":
        return (
          <div className="w-full max-w-[240px]">
            <AudioPlayer src={message.audioUrl || ""} small className="w-full" />
          </div>
        )
      case "file":
        return (
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {message.fileSize ? `${(message.fileSize / 1024).toFixed(1)} KB` : ""}
              </p>
            </div>
          </div>
        )
      default:
        return <p className="whitespace-pre-wrap break-words">{message.content}</p>
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col w-full h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] md:h-[700px]",
        "bg-background border border-border/40 rounded-md overflow-hidden",
        className,
      )}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/40 bg-background/95 backdrop-blur-sm shrink-0 z-10">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src={otherUser.avatar || "/placeholder.svg"} alt={otherUser.name} />
            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{otherUser.name}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {otherUser.isOnline
                ? "Active now"
                : otherUser.lastSeen
                  ? `Last seen ${formatTime(otherUser.lastSeen)}`
                  : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSearching(!isSearching)}>
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {isSearching && (
        <div className="p-2 border-b border-border/40 bg-background/95 backdrop-blur-sm flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="pl-8 h-9"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-2 text-xs"
              disabled={searchResults.length === 0 || currentSearchIndex <= 0}
              onClick={() => {
                if (currentSearchIndex > 0) {
                  setCurrentSearchIndex((prev) => prev - 1)
                  scrollToMessage(searchResults[currentSearchIndex - 1])
                }
              }}
            >
              ↑
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-2 text-xs"
              disabled={searchResults.length === 0 || currentSearchIndex >= searchResults.length - 1}
              onClick={() => {
                if (currentSearchIndex < searchResults.length - 1) {
                  setCurrentSearchIndex((prev) => prev + 1)
                  scrollToMessage(searchResults[currentSearchIndex + 1])
                }
              }}
            >
              ↓
            </Button>

            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {searchResults.length > 0
                ? `${currentSearchIndex + 1} of ${searchResults.length}`
                : searchQuery.trim()
                  ? "No results"
                  : ""}
            </span>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setIsSearching(false)
                setSearchQuery("")
                setSearchResults([])
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-3 space-y-4 scroll-smooth">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="space-y-3">
            {/* Date Separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-muted/50 px-3 py-1 rounded-full text-xs text-muted-foreground">
                {formatDate(new Date(date))}
              </div>
            </div>

            {/* Messages */}
            {dateMessages.map((message) => {
              const isCurrentUser = message.senderId === currentUser.id
              const showAvatar = !isCurrentUser

              return (
                <div
                  key={message.id}
                  ref={(el) => {
                    if (el) messageRefs.current[message.id] = el
                  }}
                  className={cn(
                    "flex items-end gap-2 transition-colors duration-300",
                    isCurrentUser ? "justify-end" : "justify-start",
                    searchResults.includes(message.id) &&
                      searchResults[currentSearchIndex] === message.id &&
                      "bg-primary/10 rounded-lg",
                  )}
                >
                  {/* Avatar */}
                  {showAvatar && (
                    <Avatar className="h-8 w-8 hidden sm:flex flex-shrink-0">
                      <AvatarImage src={otherUser.avatar || "/placeholder.svg"} alt={otherUser.name} />
                      <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}

                  {/* Message Bubble */}
                  <SwipeableMessage
                    onSwipe={(direction) => handleSwipe(message.id, direction)}
                    isCurrentUser={isCurrentUser}
                    onDelete={() => handleDeleteMessage(message.id)}
                    onReply={() => handleReply(message)}
                    showDeleteOption={isCurrentUser && !message.isDeleted}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] sm:max-w-[70%] px-3 py-2 rounded-2xl",
                        isCurrentUser
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted rounded-bl-none",
                        message.type === "voice" && "p-2",
                      )}
                    >
                      {/* Reply Preview */}
                      {message.replyTo && (
                        <div
                          className={cn(
                            "mb-1 pb-1 text-xs border-l-2 pl-2 -ml-1",
                            "border-primary/40 text-muted-foreground",
                            "flex flex-col",
                          )}
                        >
                          <span className="font-medium text-primary/70">
                            {message.replyTo.senderId === currentUser.id ? "You" : otherUser.name}
                          </span>
                          <span className="truncate">{message.replyTo.content}</span>
                        </div>
                      )}

                      {/* Message Content */}
                      {renderMessageContent(message)}

                      {/* Message Timestamp & Status */}
                      <div
                        className={cn(
                          "flex items-center gap-1 mt-1 text-[10px]",
                          isCurrentUser
                            ? "justify-end text-primary-foreground/70"
                            : "justify-end text-muted-foreground",
                        )}
                      >
                        <span>{formatTime(message.timestamp)}</span>
                        {isCurrentUser && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </SwipeableMessage>
                </div>
              )
            })}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollToBottom && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-20 right-4 h-8 w-8 rounded-full shadow-md opacity-80 hover:opacity-100"
          onClick={scrollToBottom}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}

      {/* Reply Preview */}
      {replyingTo && (
        <div className="p-2 border-t border-border/40 bg-background/95 backdrop-blur-sm flex items-center gap-2">
          <div className="w-1 h-full bg-primary rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary">
              {replyingTo.senderId === currentUser.id ? "You" : otherUser.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{replyingTo.content}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyingTo(null)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Voice Recording Interface */}
      {isRecording ? (
        <VoiceRecorder
          onRecordingComplete={handleVoiceRecordingComplete}
          onCancel={() => setIsRecording(false)}
          maxDuration={60}
          className="p-3 border-t border-border/40 bg-background/95 backdrop-blur-sm"
        />
      ) : (
        /* Message Input */
        <div className="p-3 border-t border-border/40 bg-background/95 backdrop-blur-sm flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 flex-shrink-0"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => {}}>
            <Paperclip className="h-5 w-5" />
          </Button>

          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="pr-10 min-h-[40px] max-h-32 resize-none"
              onKeyDown={handleKeyDown}
            />
          </div>

          {inputValue.trim() ? (
            <Button
              variant="primary"
              size="icon"
              className="h-9 w-9 flex-shrink-0 rounded-full"
              onClick={handleSendMessage}
            >
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => setIsRecording(true)}>
              <Mic className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-3 bg-background border border-border rounded-lg p-2 shadow-lg z-10">
          <div className="grid grid-cols-8 gap-1">
            {["😀", "😂", "😍", "🤔", "😢", "😡", "👍", "👎", "❤️", "🔥", "💯", "🎉", "😎", "🤗", "😴", "🤯"].map(
              (emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="p-2 hover:bg-muted rounded text-lg"
                  onClick={() => handleEmojiSelect(emoji)}
                >
                  {emoji}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {messageToDelete && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-background border border-border rounded-lg p-4 max-w-xs w-full">
            <h3 className="text-sm font-medium mb-2">Delete message?</h3>
            <p className="text-xs text-muted-foreground mb-4">This message will be deleted for everyone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setMessageToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteMessage(messageToDelete)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
