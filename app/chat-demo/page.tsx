import { ChatDemo } from "@/components/chat-demo"

export default function ChatDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Chat Interface Demo</h1>
          <p className="text-muted-foreground">A responsive chat interface with real-time messaging features</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Mobile View */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Mobile View</h2>
            <div className="w-full max-w-sm mx-auto">
              <ChatDemo />
            </div>
          </div>

          {/* Desktop View */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Desktop View</h2>
            <div className="w-full h-[600px] border border-border rounded-lg overflow-hidden bg-background shadow-lg">
              <ChatDemo />
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border border-border rounded-lg bg-background/50">
            <h3 className="font-semibold mb-2">📱 Mobile-First Design</h3>
            <p className="text-sm text-muted-foreground">
              Optimized for mobile devices with responsive layout that adapts to desktop screens.
            </p>
          </div>

          <div className="p-6 border border-border rounded-lg bg-background/50">
            <h3 className="font-semibold mb-2">💬 Real-time Features</h3>
            <p className="text-sm text-muted-foreground">
              Typing indicators, message status updates, and auto-scroll functionality.
            </p>
          </div>

          <div className="p-6 border border-border rounded-lg bg-background/50">
            <h3 className="font-semibold mb-2">🎨 Modern UI</h3>
            <p className="text-sm text-muted-foreground">
              Clean design with avatars, timestamps, emoji support, and smooth animations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
