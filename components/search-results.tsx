"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Search, User, FileText, Hash } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SearchResult } from "@/hooks/use-search"

interface SearchResultsProps {
  results: SearchResult[]
  isLoading: boolean
  query: string
  onSelect: (result: SearchResult) => void
  onSearchAll: () => void
}

export function SearchResults({ results, isLoading, query, onSelect, onSearchAll }: SearchResultsProps) {
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const resultRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1)
    resultRefs.current = resultRefs.current.slice(0, results.length)
  }, [results])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!results.length) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
          break
        case "ArrowUp":
          e.preventDefault()
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case "Enter":
          e.preventDefault()
          if (activeIndex >= 0) {
            onSelect(results[activeIndex])
          } else if (query.trim()) {
            onSearchAll()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [results, activeIndex, onSelect, onSearchAll, query])

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && resultRefs.current[activeIndex]) {
      resultRefs.current[activeIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }
  }, [activeIndex])

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-neon-green" />
        <span className="ml-2 text-sm">Searching...</span>
      </div>
    )
  }

  if (results.length === 0 && query.trim()) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="mb-2">No results found for "{query}"</p>
        <button className="text-sm text-neon-green hover:underline" onClick={onSearchAll}>
          Search all content
        </button>
      </div>
    )
  }

  return (
    <div className="py-2 max-h-[60vh] overflow-y-auto">
      {results.length > 0 && (
        <>
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.id}`}
              ref={(el) => (resultRefs.current[index] = el)}
              className={cn(
                "w-full text-left px-4 py-2 flex items-start gap-3 hover:bg-muted/50 transition-colors",
                activeIndex === index && "bg-muted/50",
              )}
              onClick={() => onSelect(result)}
            >
              {result.type === "user" && (
                <>
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={result.avatar || "/placeholder.svg"} alt={result.name} />
                    <AvatarFallback>{result.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-neon-green" />
                      <p className="font-medium truncate">{result.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">@{result.username}</p>
                  </div>
                </>
              )}

              {result.type === "post" && (
                <>
                  <div className="h-8 w-8 flex-shrink-0 bg-muted/50 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-neon-blue" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm line-clamp-2">{result.content}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      by {result.user.name} @{result.user.username}
                    </p>
                  </div>
                </>
              )}

              {result.type === "topic" && (
                <>
                  <div className="h-8 w-8 flex-shrink-0 bg-muted/50 rounded-full flex items-center justify-center">
                    <Hash className="h-4 w-4 text-neon-green" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium">#{result.name}</p>
                    <p className="text-xs text-muted-foreground">{result.posts} posts</p>
                  </div>
                </>
              )}
            </button>
          ))}

          <div className="px-4 py-2 mt-2 border-t border-border/40">
            <button
              className="w-full text-left text-sm text-neon-green hover:underline flex items-center gap-2"
              onClick={onSearchAll}
            >
              <Search className="h-3 w-3" />
              Search all results for "{query}"
            </button>
          </div>
        </>
      )}
    </div>
  )
}
