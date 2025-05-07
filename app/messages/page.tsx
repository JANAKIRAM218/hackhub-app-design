"use client"

import { MainNav } from "@/components/main-nav"
import { Sidebar } from "@/components/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Search, Send, PlusCircle, Paperclip, Code } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState("1")

  // Mock data for chats
  const chats = [
    {
      id: "1",
      user: {
        name: "Alex Chen",
        username: "alexc0der",
        avatar: "/placeholder.svg?height=40&width=40",
        online: true,
      },
      lastMessage: "Did you check out that new encryption library?",
      time: "10:42 AM",
      unread: 2,
    },
    {
      id: "2",
      user: {
        name: "Sophia Kim",
        username: "sophiadev",
        avatar: "/placeholder.svg?height=40&width=40",
        online: false,
      },
      lastMessage: "I found a vulnerability in the code you sent",
      time: "Yesterday",
      unread: 0,
    },
    {
      id: "3",
      user: {
        name: "Marcus Johnson",
        username: "mjhacker",
        avatar: "/placeholder.svg?height=40&width=40",
        online: true,
      },
      lastMessage: "Let's collaborate on the new project",
      time: "2d ago",
      unread: 0,
    },
  ]

  // Mock data for messages
  const messages = [
    {
      id: "1",
      sender: "user",
      content: "Hey, did you check out that new encryption library I mentioned?",
      time: "10:30 AM",
    },
    {
      id: "2",
      sender: "other",
      content: "Not yet, what's it called?",
      time: "10:32 AM",
    },
    {
      id: "3",
      sender: "user",
      content: "It's called CryptoShield. Here's a code snippet showing how to use it:",
      time: "10:35 AM",
    },
    {
      id: "4",
      sender: "user",
      content:
        "```javascript\nimport { CryptoShield } from 'cryptoshield';\n\nconst shield = new CryptoShield();\n\n// Generate a secure key pair\nconst keyPair = shield.generateKeyPair();\n\n// Encrypt data\nconst encrypted = shield.encrypt(sensitiveData, keyPair.publicKey);\n\n// Decrypt data\nconst decrypted = shield.decrypt(encrypted, keyPair.privateKey);\n```",
      time: "10:36 AM",
      isCode: true,
    },
    {
      id: "5",
      sender: "other",
      content: "That looks interesting! Is it quantum-resistant?",
      time: "10:40 AM",
    },
    {
      id: "6",
      sender: "user",
      content: "Yes, it uses post-quantum cryptography algorithms. It's also much faster than traditional methods.",
      time: "10:42 AM",
    },
  ]

  return (
    <div className="min-h-screen">
      <MainNav />
      <div className="container grid grid-cols-1 md:grid-cols-12 gap-6 py-6">
        <aside className="hidden md:block md:col-span-3">
          <Sidebar className="sticky top-20" />
        </aside>

        <main className="md:col-span-9">
          <Card className="border-border/40 bg-background/80 backdrop-blur-sm h-[calc(100vh-10rem)]">
            <div className="grid md:grid-cols-3 h-full">
              {/* Chat list */}
              <div className="border-r border-border/40">
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold font-mono glow-text">Messages</h2>
                    <Button variant="ghost" size="icon" className="text-neon-green">
                      <PlusCircle className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="relative mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search messages..." className="pl-8 bg-muted/50 border-muted" />
                  </div>
                </CardHeader>
                <div className="overflow-y-auto h-[calc(100%-5rem)]">
                  {chats.map((chat) => (
                    <div key={chat.id}>
                      <button
                        className={cn(
                          "w-full p-4 text-left transition-colors hover:bg-muted/30",
                          selectedChat === chat.id && "bg-muted/50",
                        )}
                        onClick={() => setSelectedChat(chat.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={chat.user.avatar || "/placeholder.svg"} alt={chat.user.name} />
                              <AvatarFallback className="bg-muted">{chat.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {chat.user.online && (
                              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-neon-green border-2 border-background"></span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold truncate">{chat.user.name}</span>
                              <span className="text-xs text-muted-foreground">{chat.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                          </div>
                          {chat.unread > 0 && (
                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-neon-green flex items-center justify-center">
                              <span className="text-xs font-semibold text-black">{chat.unread}</span>
                            </div>
                          )}
                        </div>
                      </button>
                      <Separator className="bg-border/40" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat content */}
              <div className="md:col-span-2 flex flex-col h-full">
                {/* Chat header */}
                <div className="p-4 border-b border-border/40 flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={chats.find((c) => c.id === selectedChat)?.user.avatar || "/placeholder.svg"}
                      alt={chats.find((c) => c.id === selectedChat)?.user.name}
                    />
                    <AvatarFallback className="bg-muted">
                      {chats.find((c) => c.id === selectedChat)?.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{chats.find((c) => c.id === selectedChat)?.user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      @{chats.find((c) => c.id === selectedChat)?.user.username}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg p-3",
                          message.sender === "user"
                            ? "bg-primary/20 border border-primary/30"
                            : "bg-muted/50 border border-muted",
                        )}
                      >
                        {message.isCode ? (
                          <div className="font-mono text-xs overflow-x-auto whitespace-pre bg-background/50 p-2 rounded border border-border/40">
                            {message.content.replace(/```\w*\n|```/g, "")}
                          </div>
                        ) : (
                          <p>{message.content}</p>
                        )}
                        <div
                          className={cn(
                            "text-xs mt-1",
                            message.sender === "user" ? "text-right" : "text-left",
                            "text-muted-foreground",
                          )}
                        >
                          {message.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message input */}
                <div className="p-4 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <Code className="h-5 w-5" />
                    </Button>
                    <Input placeholder="Type a message..." className="flex-1 bg-muted/50 border-muted" />
                    <Button size="icon" className="glow">
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
