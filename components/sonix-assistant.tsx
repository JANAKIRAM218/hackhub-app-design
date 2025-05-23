"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface SonixAssistantProps {
  isTyping: boolean
  className?: string
}

export function SonixAssistant({ isTyping, className }: SonixAssistantProps) {
  const [pulseEffect, setPulseEffect] = useState(false)

  // Add pulse effect when typing
  useEffect(() => {
    if (isTyping) {
      setPulseEffect(true)
    } else {
      const timeout = setTimeout(() => setPulseEffect(false), 1000)
      return () => clearTimeout(timeout)
    }
  }, [isTyping])

  return (
    <div className={cn("relative", className)}>
      <Avatar className={cn("border-2", pulseEffect ? "border-neon-blue animate-pulse-glow-blue" : "border-border")}>
        <AvatarImage src="/placeholder.svg?height=40&width=40&text=S" alt="Sonix" />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
          <Bot className="h-5 w-5 text-white" />
        </AvatarFallback>
      </Avatar>
      {isTyping && (
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-neon-blue animate-pulse-glow-blue"></span>
      )}
      <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-background flex items-center justify-center">
        <Sparkles className="h-3 w-3 text-neon-blue" />
      </span>
    </div>
  )
}
