export interface ChatMessage {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar: string
  timestamp: Date
  type: "text" | "image" | "voice" | "reaction"
  isCurrentUser: boolean
  reactions?: string[]
  imageUrl?: string
  replyTo?: {
    id: string
    content: string
    senderName: string
    isCurrentUser: boolean
  }
}
