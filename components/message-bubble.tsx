"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  message: {
    id: string
    content: string
    type: "text" | "image" | "voice" | "reaction"
    isCurrentUser: boolean
    reactions?: string[]
    imageUrl?: string
  }
  onReactionAdd: (messageId: string, emoji: string) => void
  onLongPress: (messageId: string, event: React.TouchEvent | React.MouseEvent) => void
  children: React.ReactNode
}

export function MessageBubble({ message, onReactionAdd, onLongPress, children }: MessageBubbleProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0]
    setTouchStartPos({ x: touch.clientX, y: touch.clientY })
    setIsPressed(true)

    const timer = setTimeout(() => {
      onLongPress(message.id, event)
      setIsPressed(false)
    }, 500)

    setLongPressTimer(timer)
  }

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
    setIsPressed(false)
    setTouchStartPos(null)
  }

  const handleTouchMove = (event: React.TouchEvent) => {
    if (touchStartPos && longPressTimer) {
      const touch = event.touches[0]
      const deltaX = Math.abs(touch.clientX - touchStartPos.x)
      const deltaY = Math.abs(touch.clientY - touchStartPos.y)

      if (deltaX > 10 || deltaY > 10) {
        clearTimeout(longPressTimer)
        setLongPressTimer(null)
        setIsPressed(false)
      }
    }
  }

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.preventDefault()
    onLongPress(message.id, event)
  }

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    onLongPress(message.id, event)
  }

  return (
    <div
      className={cn(
        "relative px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl break-words cursor-pointer",
        "text-sm sm:text-base leading-relaxed select-none",
        "transition-all duration-150 ease-out",
        isPressed ? "scale-95" : "hover:scale-[1.02] active:scale-[0.98]",
        message.isCurrentUser ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md",
        message.type === "image" && "p-1 sm:p-2",
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {children}
    </div>
  )
}
