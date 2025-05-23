"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Volume2, VolumeX, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { AudioPlayer } from "@/components/audio-player"
import { SonixAssistant } from "@/components/sonix-assistant"
import type { EnhancedMessage } from "@/types/conversation"
import { fileUploadService } from "@/services/file-upload-service"
import { voiceService } from "@/services/voice-service"

interface EnhancedMessageDisplayProps {
  message: EnhancedMessage
  isCurrentUser: boolean
  showAvatar: boolean
  showTimestamp: boolean
  className?: string
}

export function EnhancedMessageDisplay({
  message,
  isCurrentUser,
  showAvatar,
  showTimestamp,
  className,
}: EnhancedMessageDisplayProps) {
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isPlayingTTS, setIsPlayingTTS] = useState(false)

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  const handleDownload = () => {
    if (message.fileUrl) {
      const link = document.createElement("a")
      link.href = message.fileUrl
      link.download = message.fileName || "download"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleTextToSpeech = async () => {
    if (!voiceService.isSupported()) return

    if (isPlayingTTS) {
      voiceService.stop()
      setIsPlayingTTS(false)
    } else {
      try {
        setIsPlayingTTS(true)
        await voiceService.speak(message.content)
      } catch (error) {
        console.error("TTS error:", error)
      } finally {
        setIsPlayingTTS(false)
      }
    }
  }

  const renderMessageContent = () => {
    switch (message.type) {
      case "image":
      case "ai-generated-image":
        return (
          <div className="space-y-2">
            {message.content && message.content !== "[Image]" && <p className="text-sm">{message.content}</p>}
            <div className="relative max-w-sm">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              )}
              {imageError ? (
                <div className="flex items-center gap-2 p-4 bg-muted/50 rounded border border-dashed">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Failed to load image</span>
                </div>
              ) : (
                <img
                  src={message.imageUrl || message.fileUrl}
                  alt={message.fileName || "Image"}
                  className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  onClick={() => window.open(message.imageUrl || message.fileUrl, "_blank")}
                />
              )}
              {message.type === "ai-generated-image" && (
                <Badge className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-purple-600">
                  AI Generated
                </Badge>
              )}
            </div>
          </div>
        )

      case "voice":
        return (
          <div className="space-y-2 min-w-[200px]">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <span className="text-sm font-medium">Voice Message</span>
              {message.metadata?.duration && (
                <Badge variant="secondary" className="text-xs">
                  {Math.round(message.metadata.duration)}s
                </Badge>
              )}
            </div>
            {message.audioUrl ? (
              <AudioPlayer src={message.audioUrl} small />
            ) : (
              <div className="w-full p-2 bg-muted/30 rounded text-xs text-muted-foreground">Audio unavailable</div>
            )}
            {message.metadata?.transcription && (
              <div className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2">
                "{message.metadata.transcription}"
              </div>
            )}
          </div>
        )

      case "file":
        return (
          <div className="space-y-2">
            {message.content && message.content !== "[File]" && <p className="text-sm">{message.content}</p>}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded border max-w-sm">
              <div className="text-2xl">{fileUploadService.getFileIcon(message.mimeType || "")}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{message.fileName}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {fileUploadService.formatFileSize(message.fileSize || 0)}
                  </Badge>
                  {message.mimeType && (
                    <Badge variant="outline" className="text-xs">
                      {message.mimeType.split("/")[1]?.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => window.open(message.fileUrl, "_blank")}
                  title="Preview"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload} title="Download">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )

      case "code":
        return (
          <div className="space-y-2">
            <div className="font-mono text-xs overflow-x-auto whitespace-pre bg-background/50 p-3 rounded border border-border/40">
              {message.content.replace(/```\w*\n|```/g, "")}
            </div>
          </div>
        )

      case "text":
      default:
        return (
          <div className="space-y-2">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        )
    }
  }

  return (
    <div
      className={cn(
        "flex gap-2 max-w-[85%] sm:max-w-[70%]",
        isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto",
        className,
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {showAvatar && !isCurrentUser ? (
          message.senderId === "sonix" ? (
            <SonixAssistant isTyping={false} />
          ) : (
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.senderAvatar || "/placeholder.svg"} alt={message.senderName} />
              <AvatarFallback className="text-xs">{message.senderName.charAt(0)}</AvatarFallback>
            </Avatar>
          )
        ) : isCurrentUser && showAvatar ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.senderAvatar || "/placeholder.svg"} alt={message.senderName} />
            <AvatarFallback className="text-xs">{message.senderName.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-8 w-8" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn("flex flex-col", isCurrentUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-3 py-2 rounded-2xl max-w-full break-words relative group",
            isCurrentUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : message.senderId === "sonix"
                ? "bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 rounded-bl-md"
                : "bg-muted rounded-bl-md",
            (message.type === "voice" ||
              message.type === "file" ||
              message.type === "image" ||
              message.type === "ai-generated-image") &&
              "min-w-[200px]",
          )}
        >
          {renderMessageContent()}

          {/* Message Actions */}
          {message.type === "text" && voiceService.isSupported() && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleTextToSpeech}
              title={isPlayingTTS ? "Stop" : "Read aloud"}
            >
              {isPlayingTTS ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            </Button>
          )}
        </div>

        {/* Timestamp and Status */}
        {showTimestamp && (
          <div
            className={cn(
              "flex items-center gap-1 mt-1 text-xs text-muted-foreground",
              isCurrentUser ? "flex-row-reverse" : "",
            )}
          >
            <span>{formatTime(message.timestamp)}</span>
            {isCurrentUser && (
              <span className="text-xs">
                {message.status === "sending" && "⏳"}
                {message.status === "sent" && "✓"}
                {message.status === "delivered" && "✓✓"}
                {message.status === "read" && "✓✓"}
              </span>
            )}
          </div>
        )}

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1">
            {message.reactions.map((reaction, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                {reaction.emoji} {reaction.users.length}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
