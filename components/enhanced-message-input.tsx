"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, Smile, Paperclip, Mic, MicOff, ImageIcon, File, X, Loader2, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { VoiceRecorder } from "@/components/voice-recorder"
import { speechToTextService } from "@/services/speech-to-text-service"
import { fileUploadService, type FileUploadResult } from "@/services/file-upload-service"
import { voiceService, VOICE_PROFILES } from "@/services/voice-service"

interface EnhancedMessageInputProps {
  onSendMessage: (content: string, type?: "text" | "image" | "file" | "voice") => void
  onSendFile: (file: FileUploadResult) => void
  onSendVoice: (audioBlob: Blob) => void
  suggestions?: string[]
  onSuggestionClick?: (suggestion: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function EnhancedMessageInput({
  onSendMessage,
  onSendFile,
  onSendVoice,
  suggestions = [],
  onSuggestionClick,
  placeholder = "Type a message...",
  disabled = false,
  className,
}: EnhancedMessageInputProps) {
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
      inputRef.current?.focus()
    }
  }

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion)
    onSuggestionClick?.(suggestion)
    inputRef.current?.focus()
  }

  // Handle voice recording
  const handleVoiceRecordingComplete = (audioBlob: Blob) => {
    onSendVoice(audioBlob)
    setIsRecording(false)
  }

  // Handle speech-to-text
  const toggleSpeechToText = () => {
    if (!speechToTextService.isSupported()) {
      alert("Speech recognition is not supported in your browser")
      return
    }

    if (isListening) {
      speechToTextService.stopListening()
      setIsListening(false)
    } else {
      speechToTextService.setCallbacks({
        onResult: (result) => {
          if (result.isFinal) {
            setMessage((prev) => prev + result.transcript + " ")
          }
        },
        onError: (error) => {
          console.error("Speech recognition error:", error)
          setIsListening(false)
        },
        onStart: () => setIsListening(true),
        onEnd: () => setIsListening(false),
      })

      speechToTextService.startListening({
        language: "en-US",
        continuous: true,
        interimResults: true,
      })
    }
  }

  // Handle file upload
  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    setUploadingFiles(fileArray)

    for (const file of fileArray) {
      try {
        const result = await fileUploadService.uploadFile(file)
        if (result.success) {
          onSendFile(result)
        } else {
          alert(result.error || "Failed to upload file")
        }
      } catch (error) {
        console.error("Upload error:", error)
        alert("Failed to upload file")
      }
    }

    setUploadingFiles([])
  }

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [])

  // Handle voice settings
  const handleVoiceChange = (voiceId: string) => {
    voiceService.setVoiceProfile(voiceId)
    setShowVoiceSettings(false)
  }

  const previewVoice = (voiceId: string) => {
    voiceService.previewVoice(voiceId)
  }

  return (
    <div
      className={cn(
        "p-4 border-t border-border/40 bg-background/80 backdrop-blur-sm",
        dragOver && "bg-blue-500/10 border-blue-500/50",
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Message Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="whitespace-nowrap text-xs"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="mb-3 space-y-2">
          {uploadingFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm truncate">{file.name}</span>
              <Badge variant="secondary" className="text-xs">
                {fileUploadService.formatFileSize(file.size)}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Voice Recording Interface */}
      {isRecording ? (
        <VoiceRecorder
          onRecordingComplete={handleVoiceRecordingComplete}
          onCancel={() => setIsRecording(false)}
          maxDuration={60}
          className="mb-3"
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Main Input Area */}
          <div className="flex items-end gap-2">
            {/* File Upload Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Image Upload Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 flex-shrink-0"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = "image/*"
                  fileInputRef.current.click()
                }
              }}
              disabled={disabled}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>

            {/* Voice Recording Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 flex-shrink-0 text-neon-blue hover:bg-blue-500/10"
              onClick={() => setIsRecording(true)}
              disabled={disabled}
            >
              <Mic className="h-4 w-4" />
            </Button>

            {/* Message Input */}
            <div className="flex-1 relative">
              <Textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={placeholder}
                className="min-h-[40px] max-h-32 resize-none pr-20 bg-muted/50 border-muted focus:border-primary focus:ring-1 focus:ring-primary"
                disabled={disabled}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />

              {/* Input Controls */}
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {/* Speech-to-Text Button */}
                {speechToTextService.isSupported() && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8", isListening && "bg-red-500/20 text-red-500")}
                    onClick={toggleSpeechToText}
                    disabled={disabled}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                )}

                {/* Emoji Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  disabled={disabled}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 bg-background border border-border rounded-lg p-2 shadow-lg z-10">
                  <div className="grid grid-cols-6 gap-1">
                    {["😀", "😂", "😍", "🤔", "😢", "😡", "👍", "👎", "❤️", "🔥", "💯", "🎉"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className="p-2 hover:bg-muted rounded text-lg"
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Voice Settings Button */}
            {voiceService.isSupported() && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 flex-shrink-0"
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                disabled={disabled}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}

            {/* Send Button */}
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={!message.trim() || disabled}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Voice Settings Panel */}
          {showVoiceSettings && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Voice Settings</h4>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowVoiceSettings(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {VOICE_PROFILES.map((voice) => (
                  <div
                    key={voice.id}
                    className={cn(
                      "p-2 rounded border cursor-pointer transition-colors",
                      voiceService.getCurrentVoice().id === voice.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-muted/50",
                    )}
                    onClick={() => handleVoiceChange(voice.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{voice.name}</p>
                        <p className="text-xs text-muted-foreground">{voice.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          previewVoice(voice.id)
                        }}
                      >
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleFileUpload(e.target.files)
          }
        }}
      />

      {/* Drag and Drop Overlay */}
      {dragOver && (
        <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <File className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-sm font-medium text-blue-500">Drop files here to upload</p>
          </div>
        </div>
      )}
    </div>
  )
}
