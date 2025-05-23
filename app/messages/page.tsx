"use client"

import { useState } from "react"
import { MainNav } from "@/components/main-nav"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { EnhancedConversationList } from "@/components/enhanced-conversation-list"
import { EnhancedMessageDisplay } from "@/components/enhanced-message-display"
import { EnhancedMessageInput } from "@/components/enhanced-message-input"
import { useEnhancedAIChat } from "@/hooks/use-enhanced-ai-chat"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SonixAssistant } from "@/components/sonix-assistant"
import { Button } from "@/components/ui/button"
import { RefreshCw, Sparkles, MoreVertical } from "lucide-react"
import type { Conversation, EnhancedMessage } from "@/types/conversation"

export default function EnhancedMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState("sonix-ai")

  // Enhanced AI chat for Sonix
  const {
    messages: aiMessages,
    isAITyping,
    suggestions,
    sendMessageToAI,
    sendVoiceMessageToAI,
    sendFileToAI,
    clearChat,
  } = useEnhancedAIChat("sonix-ai")

  // Mock conversations data
  const conversations: Conversation[] = [
    {
      id: "1",
      type: "direct",
      name: "Alex Chen",
      participants: [
        {
          id: "alex",
          name: "Alex Chen",
          username: "alexc0der",
          avatar: "/placeholder.svg?height=40&width=40",
          isOnline: true,
        },
      ],
      lastMessage: "Did you check out that new encryption library?",
      lastMessageTime: new Date(Date.now() - 10 * 60 * 1000),
      unreadCount: 2,
      isArchived: false,
      isPinned: false,
      settings: {
        notifications: true,
        canAddMembers: false,
        canEditInfo: false,
      },
    },
    {
      id: "2",
      type: "group",
      name: "Dev Team",
      description: "Main development team chat",
      participants: [
        {
          id: "alex",
          name: "Alex Chen",
          username: "alexc0der",
          avatar: "/placeholder.svg?height=40&width=40",
          isOnline: true,
          role: "admin",
        },
        {
          id: "sophia",
          name: "Sophia Kim",
          username: "sophiadev",
          avatar: "/placeholder.svg?height=40&width=40",
          isOnline: false,
          role: "member",
        },
        {
          id: "marcus",
          name: "Marcus Johnson",
          username: "mjhacker",
          avatar: "/placeholder.svg?height=40&width=40",
          isOnline: true,
          role: "moderator",
        },
      ],
      lastMessage: "Let's review the new security protocols",
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unreadCount: 0,
      isArchived: false,
      isPinned: true,
      settings: {
        notifications: true,
        canAddMembers: true,
        canEditInfo: true,
      },
    },
    {
      id: "3",
      type: "community",
      name: "HackHub Community",
      description: "General community discussions",
      participants: Array.from({ length: 1247 }, (_, i) => ({
        id: `user-${i}`,
        name: `User ${i}`,
        username: `user${i}`,
        avatar: "/placeholder.svg?height=40&width=40",
        isOnline: Math.random() > 0.7,
        role: i < 5 ? "admin" : i < 20 ? "moderator" : "member",
      })),
      lastMessage: "Welcome to the community!",
      lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
      unreadCount: 5,
      isArchived: false,
      isPinned: false,
      settings: {
        notifications: false,
        canAddMembers: false,
        canEditInfo: false,
      },
    },
    {
      id: "4",
      type: "channel",
      name: "announcements",
      description: "Official announcements and updates",
      participants: Array.from({ length: 500 }, (_, i) => ({
        id: `user-${i}`,
        name: `User ${i}`,
        username: `user${i}`,
        avatar: "/placeholder.svg?height=40&width=40",
        isOnline: Math.random() > 0.8,
        role: i < 3 ? "admin" : "member",
      })),
      lastMessage: "New features released!",
      lastMessageTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
      unreadCount: 1,
      isArchived: false,
      isPinned: true,
      settings: {
        notifications: true,
        canAddMembers: false,
        canEditInfo: false,
      },
    },
  ]

  // Mock messages for non-AI conversations
  const mockMessages: EnhancedMessage[] = [
    {
      id: "1",
      content: "Hey, did you check out that new encryption library I mentioned?",
      senderId: "alex",
      senderName: "Alex Chen",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: "text",
      status: "read",
    },
    {
      id: "2",
      content: "Not yet, what's it called?",
      senderId: "user-1",
      senderName: "You",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      type: "text",
      status: "read",
    },
    {
      id: "3",
      content: "It's called CryptoShield. Here's a code snippet showing how to use it:",
      senderId: "alex",
      senderName: "Alex Chen",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      type: "text",
      status: "read",
    },
    {
      id: "4",
      content:
        "```javascript\nimport { CryptoShield } from 'cryptoshield';\n\nconst shield = new CryptoShield();\n\n// Generate a secure key pair\nconst keyPair = shield.generateKeyPair();\n\n// Encrypt data\nconst encrypted = shield.encrypt(sensitiveData, keyPair.publicKey);\n\n// Decrypt data\nconst decrypted = shield.decrypt(encrypted, keyPair.privateKey);\n```",
      senderId: "alex",
      senderName: "Alex Chen",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      timestamp: new Date(Date.now() - 18 * 60 * 1000),
      type: "code",
      status: "read",
    },
  ]

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

  const groupMessagesByDate = (messages: EnhancedMessage[]) => {
    const groups: { [key: string]: EnhancedMessage[] } = {}

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

  const selectedConversationData = conversations.find((c) => c.id === selectedConversation)
  const isAIConversation = selectedConversation === "sonix-ai"
  const currentMessages = isAIConversation ? aiMessages : mockMessages
  const messageGroups = groupMessagesByDate(currentMessages)

  return (
    <div className="min-h-screen">
      <MainNav />
      <div className="container grid grid-cols-1 md:grid-cols-12 gap-6 py-6">
        <aside className="hidden md:block md:col-span-3">
          <Sidebar className="sticky top-20" />
        </aside>

        <main className="md:col-span-9">
          <Card className="border-border/40 bg-background/80 backdrop-blur-sm h-[calc(100vh-10rem)]">
            <div className="grid md:grid-cols-3 h-full">
              {/* Conversation List */}
              <div className="border-r border-border/40">
                <EnhancedConversationList
                  conversations={conversations}
                  selectedConversationId={selectedConversation}
                  onSelectConversation={setSelectedConversation}
                />
              </div>

              {/* Chat Content */}
              <div className="md:col-span-2 flex flex-col h-full">
                {selectedConversationData || isAIConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border/40 bg-background/80 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        {isAIConversation ? (
                          <SonixAssistant isTyping={isAITyping} />
                        ) : (
                          <div className="relative">{/* Add avatar for other conversation types */}</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate flex items-center gap-1">
                            {isAIConversation ? (
                              <>
                                Sonix <Sparkles className="h-3.5 w-3.5 text-neon-blue" />
                              </>
                            ) : (
                              selectedConversationData?.name
                            )}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {isAIConversation
                              ? isAITyping
                                ? "Typing..."
                                : "AI Assistant"
                              : selectedConversationData?.description ||
                                `${selectedConversationData?.participants.length} participants`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAIConversation && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={clearChat}
                            title="Clear chat"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messageGroups.map(({ date, messages: groupMessages }) => (
                          <div key={date.toISOString()}>
                            {/* Date Separator */}
                            <div className="flex items-center justify-center my-4">
                              <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                                {formatDate(date)}
                              </div>
                            </div>

                            {/* Messages */}
                            <div className="space-y-2">
                              {groupMessages.map((message, index) => {
                                const isCurrentUser = message.senderId === "user-1"
                                const showAvatar =
                                  !isCurrentUser &&
                                  (index === 0 || groupMessages[index - 1]?.senderId !== message.senderId)
                                const showTimestamp =
                                  index === groupMessages.length - 1 ||
                                  groupMessages[index + 1]?.senderId !== message.senderId

                                return (
                                  <EnhancedMessageDisplay
                                    key={message.id}
                                    message={message}
                                    isCurrentUser={isCurrentUser}
                                    showAvatar={showAvatar}
                                    showTimestamp={showTimestamp}
                                  />
                                )
                              })}
                            </div>
                          </div>
                        ))}

                        {/* AI Typing Indicator */}
                        {isAIConversation && isAITyping && (
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
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    {isAIConversation ? (
                      <EnhancedMessageInput
                        onSendMessage={sendMessageToAI}
                        onSendFile={sendFileToAI}
                        onSendVoice={sendVoiceMessageToAI}
                        suggestions={suggestions}
                        onSuggestionClick={sendMessageToAI}
                        placeholder="Ask Sonix anything..."
                        disabled={isAITyping}
                      />
                    ) : (
                      <EnhancedMessageInput
                        onSendMessage={(content) => console.log("Send message:", content)}
                        onSendFile={(file) => console.log("Send file:", file)}
                        onSendVoice={(blob) => console.log("Send voice:", blob)}
                        placeholder="Type a message..."
                      />
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Select a conversation to start messaging
                  </div>
                )}
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
