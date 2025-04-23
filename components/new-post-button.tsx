"use client"

import { Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { NewPostModal } from "@/components/new-post-modal"

export function NewPostButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Add keyboard shortcut (press 'n' to open new post modal)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not in an input, textarea, etc.
      if (e.key === "n" && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
        setIsModalOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  return (
    <>
      <button
        onClick={() => {
          setIsModalOpen(true)
          // Add a small "click" animation
          const btn = document.getElementById("new-post-btn")
          if (btn) {
            btn.classList.add("scale-90")
            setTimeout(() => btn.classList.remove("scale-90"), 150)
          }
        }}
        id="new-post-btn"
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 h-14 w-14 rounded-full 
    bg-neon-green text-black flex items-center justify-center shadow-lg animate-pulse-glow
    hover:scale-110 hover:bg-neon-green/90 hover:shadow-xl
    active:scale-90 transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-neon-green focus:ring-offset-2 focus:ring-offset-background"
        aria-label="Create new post"
        title="Create new post (Press N to open)"
        data-tooltip="Create a new post"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
        <span className="sr-only">Create new post</span>
      </button>

      <NewPostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
