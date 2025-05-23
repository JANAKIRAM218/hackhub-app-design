import { MainNav } from "@/components/main-nav"
import { Sidebar } from "@/components/sidebar"
import { AIChatInterface } from "@/components/ai-chat-interface"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Volume2, Sparkles } from "lucide-react"

export default function SonixChatPage() {
  // Mock current user
  const currentUser = {
    id: "user-1",
    name: "Sarah Connor",
    avatar: "/placeholder.svg?height=40&width=40",
  }

  return (
    <div className="min-h-screen">
      <MainNav />
      <div className="container grid grid-cols-1 md:grid-cols-12 gap-6 py-6">
        <aside className="hidden md:block md:col-span-3">
          <Sidebar className="sticky top-20" />
        </aside>

        <main className="md:col-span-9 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-2xl font-bold font-mono glow-text">Sonix AI Assistant</h1>
            <div className="px-2 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 text-xs">
              Beta
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-border/40 bg-background/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mic className="h-5 w-5 text-neon-blue" />
                  <span>Voice Messages</span>
                </CardTitle>
                <CardDescription>Send voice messages to Sonix</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Click the microphone icon to record and send voice messages. Sonix can listen and respond with text or
                  voice.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-background/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-neon-blue" />
                  <span>Audio Playback</span>
                </CardTitle>
                <CardDescription>Listen to voice responses</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sonix may respond with voice messages. Use the built-in audio player to listen to responses.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-background/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-neon-blue" />
                  <span>Smart Responses</span>
                </CardTitle>
                <CardDescription>Context-aware AI</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sonix understands both text and voice inputs, providing intelligent responses based on context.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="border border-border/40 rounded-lg overflow-hidden h-[calc(100vh-20rem)]">
            <AIChatInterface currentUser={currentUser} />
          </div>
        </main>
      </div>
    </div>
  )
}
