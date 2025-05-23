"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, PlusCircle, Users, Hash, MessageCircle, Globe, Pin } from "lucide-react"
import { cn } from "@/lib/utils"
import { SonixAssistant } from "@/components/sonix-assistant"
import type { Conversation, ConversationType } from "@/types/conversation"

interface EnhancedConversationListProps {
  conversations: Conversation[]
  selectedConversationId: string
  onSelectConversation: (conversationId: string) => void
  className?: string
}

const CONVERSATION_ICONS = {
  direct: MessageCircle,
  group: Users,
  community: Globe,
  channel: Hash,
}

const CONVERSATION_LABELS = {
  direct: "Direct Message",
  group: "Group",
  community: "Community",
  channel: "Channel",
}

export function EnhancedConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  className,
}: EnhancedConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<ConversationType | "all">("all")

  // Filter conversations
  const filteredConversations = conversations.filter((conversation) => {
    const matchesSearch =
      conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.participants.some(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.username.toLowerCase().includes(searchQuery.toLowerCase()),
      )

    const matchesType = filterType === "all" || conversation.type === filterType

    return matchesSearch && matchesType && !conversation.isArchived
  })

  // Group conversations by type
  const groupedConversations = filteredConversations.reduce(
    (groups, conversation) => {
      const type = conversation.type
      if (!groups[type]) groups[type] = []
      groups[type].push(conversation)
      return groups
    },
    {} as Record<ConversationType, Conversation[]>,
  )

  // Add Sonix AI to direct messages
  const sonixConversation: Conversation = {
    id: "sonix-ai",
    type: "direct",
    name: "Sonix",
    description: "AI Assistant",
    participants: [
      {
        id: "sonix",
        name: "Sonix",
        username: "ai-assistant",
        avatar: "/placeholder.svg?height=40&width=40&text=S",
        isOnline: true,
      },
    ],
    lastMessage: "How can I help you today?",
    lastMessageTime: new Date(),
    unreadCount: 0,
    isArchived: false,
    isPinned: true,
    settings: {
      notifications: true,
      canAddMembers: false,
      canEditInfo: false,
    },
  }

  // Add Sonix to direct messages if not filtered out
  if (filterType === "all" || filterType === "direct") {
    if (!groupedConversations.direct) groupedConversations.direct = []
    groupedConversations.direct.unshift(sonixConversation)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Now"
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return date.toLocaleDateString()
  }

  const getParticipantCount = (conversation: Conversation) => {
    if (conversation.type === "direct") return null
    return conversation.participants.length
  }

  const renderConversationItem = (conversation: Conversation) => {
    const Icon = CONVERSATION_ICONS[conversation.type]
    const isSelected = selectedConversationId === conversation.id
    const participantCount = getParticipantCount(conversation)

    return (
      <button
        key={conversation.id}
        className={cn("w-full p-3 text-left transition-colors hover:bg-muted/30 relative", isSelected && "bg-muted/50")}
        onClick={() => onSelectConversation(conversation.id)}
      >
        {conversation.isPinned && <Pin className="absolute top-2 right-2 h-3 w-3 text-muted-foreground" />}

        <div className="flex items-start gap-3">
          <div className="relative">
            {conversation.id === "sonix-ai" ? (
              <SonixAssistant isTyping={false} />
            ) : (
              <Avatar className="h-12 w-12">
                <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                <AvatarFallback className="bg-muted">{conversation.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}

            {conversation.type !== "direct" && (
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-background border-2 border-background flex items-center justify-center">
                <Icon className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate">{conversation.name}</span>
                {participantCount && (
                  <Badge variant="secondary" className="text-xs">
                    {participantCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {conversation.lastMessageTime && (
                  <span className="text-xs text-muted-foreground">{formatTime(conversation.lastMessageTime)}</span>
                )}
                {conversation.unreadCount > 0 && (
                  <Badge className="h-5 w-5 rounded-full bg-neon-green text-black text-xs p-0 flex items-center justify-center">
                    {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage || "No messages yet"}</p>

              {conversation.type !== "direct" && (
                <Badge variant="outline" className="text-xs ml-2">
                  {CONVERSATION_LABELS[conversation.type]}
                </Badge>
              )}
            </div>

            {conversation.description && (
              <p className="text-xs text-muted-foreground/70 truncate mt-1">{conversation.description}</p>
            )}
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-mono glow-text">Messages</h2>
          <Button variant="ghost" size="icon" className="text-neon-green">
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8 bg-muted/50 border-muted"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Type Filters */}
        <div className="flex gap-1 overflow-x-auto">
          <Button
            variant={filterType === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterType("all")}
            className="whitespace-nowrap"
          >
            All
          </Button>
          {Object.entries(CONVERSATION_LABELS).map(([type, label]) => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterType(type as ConversationType)}
              className="whitespace-nowrap"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedConversations).map(([type, conversations]) => (
          <div key={type}>
            {conversations.length > 0 && (
              <>
                <div className="px-4 py-2 bg-muted/20">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {CONVERSATION_LABELS[type as ConversationType]}
                  </h3>
                </div>
                {conversations.map(renderConversationItem)}
                <Separator className="bg-border/40" />
              </>
            )}
          </div>
        ))}

        {filteredConversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mb-2" />
            <p className="text-sm">No conversations found</p>
          </div>
        )}
      </div>
    </div>
  )
}
