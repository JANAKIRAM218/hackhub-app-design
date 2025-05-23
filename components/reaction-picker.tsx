"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ReactionPickerProps {
  isVisible: boolean
  position: { x: number; y: number }
  onReactionSelect: (emoji: string) => void
  onClose: () => void
  existingReactions?: string[]
}

const QUICK_REACTIONS = ["❤️", "😂", "😮", "😢", "😡", "👍"]

export function ReactionPicker({
  isVisible,
  position,
  onReactionSelect,
  onClose,
  existingReactions = [],
}: ReactionPickerProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  useEffect(() => {
    const handleClickOutside = () => {
      onClose()
    }

    if (isVisible) {
      document.addEventListener("click", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside)
    }

    return () => {
      document.removeEventListener("click", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [isVisible, onClose])

  if (!isAnimating && !isVisible) return null

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none"
      style={{
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div
        className={cn(
          "absolute bg-background/95 backdrop-blur-sm border border-border/40 rounded-full shadow-lg",
          "flex items-center gap-1 px-2 py-1.5 transition-all duration-200 ease-out",
          isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 translate-y-2",
        )}
        style={{
          left: Math.max(8, Math.min(position.x - 120, window.innerWidth - 248)),
          top: Math.max(8, position.y - 60),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {QUICK_REACTIONS.map((emoji, index) => {
          const hasReaction = existingReactions.includes(emoji)
          return (
            <button
              key={emoji}
              className={cn(
                "relative flex items-center justify-center w-10 h-10 rounded-full",
                "transition-all duration-150 ease-out hover:scale-110 active:scale-95",
                "hover:bg-muted/50",
                hasReaction && "bg-primary/10 ring-2 ring-primary/20",
              )}
              style={{
                animationDelay: `${index * 50}ms`,
                animation: isVisible ? "reactionBounceIn 0.3s ease-out" : undefined,
              }}
              onClick={() => {
                onReactionSelect(emoji)
                onClose()
              }}
            >
              <span className="text-xl">{emoji}</span>
              {hasReaction && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-primary-foreground font-bold">✓</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <style jsx>{`
        @keyframes reactionBounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(10px);
          }
          50% {
            opacity: 1;
            transform: scale(1.1) translateY(-2px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
