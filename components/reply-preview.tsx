"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ReplyPreviewProps {
  message: {
    id: string
    content: string
    senderName: string
    isCurrentUser: boolean
  }
  onCancel: () => void
  className?: string
}

export function ReplyPreview({ message, onCancel, className }: ReplyPreviewProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 bg-muted/30 rounded-md animate-in slide-in-from-bottom duration-200",
        className,
      )}
    >
      <div className="w-1 self-stretch bg-primary rounded-full" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-primary">{message.isCurrentUser ? "You" : message.senderName}</p>
        <p className="text-xs text-muted-foreground truncate">{message.content}</p>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={onCancel}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}
