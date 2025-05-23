"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Reply } from "lucide-react"

interface SwipeableMessageProps {
  children: React.ReactNode
  onReply: () => void
  isCurrentUser: boolean
  className?: string
}

export function SwipeableMessage({ children, onReply, isCurrentUser, className }: SwipeableMessageProps) {
  const [swipeDistance, setSwipeDistance] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const startXRef = useRef<number | null>(null)
  const messageRef = useRef<HTMLDivElement>(null)
  const swipeThreshold = 80 // Minimum distance to trigger reply action

  // Reset swipe when component unmounts or when reply is triggered
  useEffect(() => {
    return () => {
      setSwipeDistance(0)
      setIsSwiping(false)
      startXRef.current = null
    }
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current === null) return

    const currentX = e.touches[0].clientX
    const diff = currentX - startXRef.current

    // Only allow right swipe (positive diff)
    // For current user messages (right side), we need to invert the direction
    const adjustedDiff = isCurrentUser ? -diff : diff

    if (adjustedDiff > 0) {
      // Limit the maximum swipe distance with diminishing returns
      const maxSwipe = 120
      const dampedDiff = Math.min(adjustedDiff, maxSwipe)
      setSwipeDistance(dampedDiff)
    } else {
      setSwipeDistance(0)
    }
  }

  const handleTouchEnd = () => {
    if (swipeDistance > swipeThreshold) {
      // Trigger reply action
      onReply()
    }

    // Reset swipe with animation
    setSwipeDistance(0)
    setIsSwiping(false)
    startXRef.current = null
  }

  return (
    <div className={cn("relative", className)} ref={messageRef}>
      {/* Reply indicator that appears during swipe */}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 flex items-center justify-center",
          "w-10 h-10 rounded-full bg-primary/10 text-primary transition-opacity",
          swipeDistance > 0 ? "opacity-100" : "opacity-0",
          isCurrentUser ? "right-full mr-2" : "left-full ml-2",
        )}
        style={{
          opacity: Math.min(swipeDistance / swipeThreshold, 1),
        }}
      >
        <Reply className="w-5 h-5" />
      </div>

      {/* Message content with swipe transform */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="touch-pan-y"
        style={{
          transform: `translateX(${isCurrentUser ? -swipeDistance : swipeDistance}px)`,
          transition: isSwiping ? "none" : "transform 0.2s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  )
}
