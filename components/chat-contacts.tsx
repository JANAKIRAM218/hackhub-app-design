"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Search, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { SonixAssistant } from "@/components/sonix-assistant"

interface ChatContact {
  id: string
  name: string
  username: string
  avatar: string
  lastMessage: string
  time: string
  unread: number
  online: boolean
  isAI?: boolean
}

interface ChatContactsProps {
  contacts: ChatContact[]
  selectedContactId: string
  onSelectContact: (contactId: string) => void
  className?: string
}

export function ChatContacts({ contacts, selectedContactId, onSelectContact, className }: ChatContactsProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Add Sonix AI to the top of the list
  const sonixAI: ChatContact = {
    id: "sonix-ai",
    name: "Sonix",
    username: "ai-assistant",
    avatar: "/placeholder.svg?height=40&width=40&text=S",
    lastMessage: "How can I help you today?",
    time: "Now",
    unread: 0,
    online: true,
    isAI: true,
  }

  const allContacts = [sonixAI, ...filteredContacts]

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
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-8 bg-muted/50 border-muted"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {allContacts.map((contact) => (
          <div key={contact.id}>
            <button
              className={cn(
                "w-full p-4 text-left transition-colors hover:bg-muted/30",
                selectedContactId === contact.id && "bg-muted/50",
              )}
              onClick={() => onSelectContact(contact.id)}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  {contact.isAI ? (
                    <SonixAssistant isTyping={false} />
                  ) : (
                    <Avatar>
                      <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                      <AvatarFallback className="bg-muted">{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  {contact.online && !contact.isAI && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-neon-green border-2 border-background"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold truncate">{contact.name}</span>
                    <span className="text-xs text-muted-foreground">{contact.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                </div>
                {contact.unread > 0 && (
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-neon-green flex items-center justify-center">
                    <span className="text-xs font-semibold text-black">{contact.unread}</span>
                  </div>
                )}
              </div>
            </button>
            <Separator className="bg-border/40" />
          </div>
        ))}
      </div>
    </div>
  )
}
