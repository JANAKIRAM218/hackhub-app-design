"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Terminal, UserPlus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const [typedText, setTypedText] = useState("")
  const welcomeText = "Welcome to HackHub - Social Network for Hackers"
  const [typingComplete, setTypingComplete] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  // Typewriter effect
  useEffect(() => {
    if (typedText.length < welcomeText.length) {
      const timeout = setTimeout(() => {
        setTypedText(welcomeText.slice(0, typedText.length + 1))
      }, 100)
      return () => clearTimeout(timeout)
    } else {
      setTypingComplete(true)
    }
  }, [typedText])

  const handleLogin = () => {
    login()
    router.push("/")
  }

  const handleSignUp = () => {
    login()
    router.push("/")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 code-rain">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Logo size="lg" />
          <div className="h-16 flex items-center justify-center">
            <h1 className="text-xl md:text-2xl font-mono font-bold text-center">
              <span className="inline-block">{typedText}</span>
              <span
                className={`inline-block w-2 h-5 bg-neon-green ml-1 ${typingComplete ? "animate-pulse" : "opacity-0"}`}
              ></span>
            </h1>
          </div>
        </div>

        <div className="space-y-4 mt-8">
          <Button
            onClick={handleLogin}
            className="w-full h-12 bg-background border border-neon-green text-neon-green hover:bg-neon-green/10 glow font-mono text-lg"
          >
            <Terminal className="mr-2 h-5 w-5" />
            <span className="mr-1">&gt;</span> Login
          </Button>

          <Button
            onClick={handleSignUp}
            className="w-full h-12 bg-background border border-neon-blue text-neon-blue hover:bg-neon-blue/10 glow-blue font-mono text-lg"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            <span className="mr-1">&gt;</span> Sign Up
          </Button>
        </div>

        <div className="mt-8">
          <div className="matrix-bg rounded-md p-6 border border-border/40 bg-background/80 backdrop-blur-sm">
            <h2 className="text-lg font-mono font-bold mb-4 glow-text">Terminal Access</h2>
            <div className="font-mono text-sm space-y-2">
              <p className="text-neon-green">$ ssh user@hackhub.network</p>
              <p className="text-white">Connecting to HackHub network...</p>
              <p className="text-white">Connection established.</p>
              <p className="text-neon-green">$ sudo access --grant-all</p>
              <p className="text-white">Bypassing authentication...</p>
              <p className="text-neon-green">$ echo "No credentials required. Click login to continue."</p>
              <p className="text-white">No credentials required. Click login to continue.</p>
              <p className="flex items-center">
                <span className="inline-block w-2 h-4 bg-neon-green mr-1 animate-pulse"></span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Matrix code rain animation */}
      <canvas id="matrix" className="fixed top-0 left-0 w-full h-full -z-10"></canvas>
    </div>
  )
}
