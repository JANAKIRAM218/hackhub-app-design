export type ConversationType = "direct" | "group" | "community" | "channel"

export interface Participant {
  id: string
  name: string
  username: string
  avatar: string
  role?: "admin" | "moderator" | "member"
  isOnline: boolean
  lastSeen?: Date
}

export interface Conversation {
  id: string
  type: ConversationType
  name: string
  description?: string
  avatar?: string
  participants: Participant[]
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount: number
  isArchived: boolean
  isPinned: boolean
  settings: {
    notifications: boolean
    canAddMembers: boolean
    canEditInfo: boolean
  }
}

export interface EnhancedMessage {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar: string
  timestamp: Date
  type: "text" | "image" | "file" | "voice" | "ai-generated-image" | "code"
  status: "sending" | "sent" | "delivered" | "read"
  replyTo?: {
    id: string
    content: string
    senderId: string
  }
  reactions?: { emoji: string; users: string[] }[]
  fileUrl?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  imageUrl?: string
  audioUrl?: string
  metadata?: {
    width?: number
    height?: number
    duration?: number
    transcription?: string
  }
  isDeleted?: boolean
  isEdited?: boolean
  editedAt?: Date
  isForwarded?: boolean
  originalSenderId?: string
  originalSenderName?: string
}
