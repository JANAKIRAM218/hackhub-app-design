"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, Search, User, FileText, Hash, Clock, X, Trash2, Code, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SearchResult, SearchHistoryItem } from "@/hooks/use-search"

interface SearchResultsProps {
  results: SearchResult[]
  isLoading: boolean
  query: string
  searchHistory: SearchHistoryItem[]
  onSelect: (result: SearchResult) => void
  onSearchAll: () => void
  onUseHistoryItem: (historyItem: SearchHistoryItem) => void
  onRemoveHistoryItem: (query: string) => void
  onClearHistory: () => void
}

export function SearchResults({
  results,
  isLoading,
  query,
  searchHistory,
  onSelect,
  onSearchAll,
  onUseHistoryItem,
  onRemoveHistoryItem,
  onClearHistory,
}: SearchResultsProps) {
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
      if (!results.length && !searchHistory.length) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          if (results.length > 0) {
            setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
          }
          break
        case "ArrowUp":
          e.preventDefault()
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case "Enter":
          e.preventDefault()
          if (activeIndex >= 0 && results.length > 0) {
            onSelect(results[activeIndex])
          } else if (query.trim()) {
            onSearchAll()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [results, activeIndex, onSelect, onSearchAll, query, searchHistory.length])

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && resultRefs.current[activeIndex]) {
      resultRefs.current[activeIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }
  }, [activeIndex])

  // Get icon for category
  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "user":
        return <User className="h-4 w-4 text-neon-green" />
      case "code":
        return <Code className="h-4 w-4 text-neon-blue" />
      case "topic":
        return <Hash className="h-4 w-4 text-neon-green" />
      default:
        return <Globe className="h-4 w-4 text-neon-blue" />
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    // Less than a minute
    if (diff < 60 * 1000) {
      return "Just now"
    }

    // Less than an hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000))
      return `${minutes}m ago`
    }

    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000))
      return `${hours}h ago`
    }

    // Less than a week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000))
      return `${days}d ago`
    }

    // Format as date
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-neon-green" />
        <span className="ml-2 text-sm">Searching...</span>
      </div>
    )
  }

  // Show search history when query is empty
  if (query.trim() === "" && searchHistory.length > 0) {
    return (
      <div className="py-2 max-h-[60vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Recent Searches
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-red-400"
            onClick={onClearHistory}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Clear All
          </Button>
        </div>
        <div className="mt-1">
          {searchHistory.map((item) => (
            <div key={item.query} className="flex items-center px-4 py-2 hover:bg-muted/50 transition-colors">
              <button className="flex items-center flex-1 text-left" onClick={() => onUseHistoryItem(item)}>
                <div className="mr-3 flex-shrink-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={item.image || "/placeholder.svg"} alt={item.query} />
                    <AvatarFallback className="bg-muted/50 text-foreground">
                      {getCategoryIcon(item.category)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{item.query}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {getCategoryIcon(item.category)}
                    <span className="ml-1 capitalize">{item.category || "Search"}</span>
                    <span className="mx-1">•</span>
                    <span>{formatTimestamp(item.timestamp)}</span>
                  </div>
                </div>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveHistoryItem(item.query)
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Show no results message
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

  // Show search results
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
