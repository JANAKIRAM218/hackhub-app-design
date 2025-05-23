"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { usePosts } from "@/hooks/use-posts"

// Define search result types
export interface SearchUser {
  id: string
  name: string
  username: string
  avatar: string
  type: "user"
}

export interface SearchPost {
  id: string
  content: string
  user: {
    name: string
    username: string
  }
  type: "post"
}

export interface SearchTopic {
  id: string
  name: string
  posts: number
  type: "topic"
}

export type SearchResult = SearchUser | SearchPost | SearchTopic

// Define search history item type
export interface SearchHistoryItem {
  query: string
  timestamp: number
  image?: string
  category?: "user" | "code" | "topic" | "general"
}

// Maximum number of search history items to store
const MAX_SEARCH_HISTORY = 5

// Categories and their associated keywords
const CATEGORY_KEYWORDS = {
  user: ["user", "profile", "name", "alex", "sarah", "sophia", "marcus", "aria", "adrian"],
  code: ["code", "python", "javascript", "java", "c++", "html", "css", "react", "node", "function", "class", "api"],
  topic: ["topic", "cybersecurity", "ai", "blockchain", "quantum", "ethical", "machine", "learning", "hack"],
}

export function useSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const router = useRouter()

  // Get posts for searching
  const { posts } = usePosts()

  // Load search history from localStorage on mount
  useEffect(() => {
    const storedHistory = localStorage.getItem("hackhub-search-history")
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory)
        if (Array.isArray(parsedHistory)) {
          setSearchHistory(parsedHistory)
        }
      } catch (error) {
        console.error("Failed to parse search history:", error)
      }
    }
  }, [])

  // Mock users for search
  const mockUsers = [
    {
      id: "user-1",
      name: "Sarah Connor",
      username: "techrebel",
      avatar: "/placeholder.svg?height=40&width=40",
      type: "user" as const,
    },
    {
      id: "user-2",
      name: "Alex Chen",
      username: "alexc0der",
      avatar: "/placeholder.svg?height=40&width=40",
      type: "user" as const,
    },
    {
      id: "user-3",
      name: "Sophia Kim",
      username: "sophiadev",
      avatar: "/placeholder.svg?height=40&width=40",
      type: "user" as const,
    },
    {
      id: "user-4",
      name: "Marcus Johnson",
      username: "mjhacker",
      avatar: "/placeholder.svg?height=40&width=40",
      type: "user" as const,
    },
    {
      id: "user-5",
      name: "Tech Innovator",
      username: "techinnovator",
      avatar: "/placeholder.svg?height=40&width=40",
      type: "user" as const,
    },
    {
      id: "user-6",
      name: "AI Research Lab",
      username: "airesearchlab",
      avatar: "/placeholder.svg?height=40&width=40",
      type: "user" as const,
    },
    {
      id: "user-7",
      name: "Aria Johnson",
      username: "aria_dev",
      avatar: "/placeholder.svg?height=40&width=40",
      type: "user" as const,
    },
    {
      id: "user-8",
      name: "Adrian Smith",
      username: "adrian_hack",
      avatar: "/placeholder.svg?height=40&width=40",
      type: "user" as const,
    },
  ]

  // Mock topics for search
  const mockTopics = [
    { id: "topic-1", name: "cybersecurity", posts: 1243, type: "topic" as const },
    { id: "topic-2", name: "AI", posts: 982, type: "topic" as const },
    { id: "topic-3", name: "blockchain", posts: 754, type: "topic" as const },
    { id: "topic-4", name: "quantumcomputing", posts: 521, type: "topic" as const },
    { id: "topic-5", name: "ethicalhacking", posts: 498, type: "topic" as const },
    { id: "topic-6", name: "machinelearning", posts: 432, type: "topic" as const },
    { id: "topic-7", name: "python", posts: 387, type: "topic" as const },
    { id: "topic-8", name: "javascript", posts: 356, type: "topic" as const },
  ]

  // Determine the category of a search query
  const determineCategory = (searchQuery: string): "user" | "code" | "topic" | "general" => {
    const normalizedQuery = searchQuery.toLowerCase()

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (normalizedQuery.includes(keyword)) {
          return category as "user" | "code" | "topic"
        }
      }
    }

    return "general"
  }

  // Generate an image for a search query based on its category
  const generateImageForSearch = (searchQuery: string, category: "user" | "code" | "topic" | "general"): string => {
    // Check if the query matches a user
    const matchedUser = mockUsers.find(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    if (matchedUser) {
      return matchedUser.avatar
    }

    // Check if the query matches a topic
    const matchedTopic = mockTopics.find((topic) => topic.name.toLowerCase().includes(searchQuery.toLowerCase()))

    if (matchedTopic) {
      return `/placeholder.svg?height=40&width=40&text=${encodeURIComponent(matchedTopic.name)}`
    }

    // Generate category-based placeholder
    switch (category) {
      case "user":
        return "/placeholder.svg?height=40&width=40&text=User"
      case "code":
        return "/placeholder.svg?height=40&width=40&text=Code"
      case "topic":
        return "/placeholder.svg?height=40&width=40&text=Topic"
      default:
        // Generate a unique color based on the first character of the search
        const firstChar = searchQuery.charAt(0).toUpperCase()
        const charCode = firstChar.charCodeAt(0)
        return `/placeholder.svg?height=40&width=40&text=${encodeURIComponent(firstChar)}`
    }
  }

  // Add search to history
  const addToSearchHistory = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return

      const category = determineCategory(searchQuery)
      const image = generateImageForSearch(searchQuery, category)

      // Create new history item
      const newHistoryItem: SearchHistoryItem = {
        query: searchQuery,
        timestamp: Date.now(),
        image,
        category,
      }

      // Create new history array with the current search at the beginning
      // and remove any duplicates of the current search
      const updatedHistory = [
        newHistoryItem,
        ...searchHistory.filter((item) => item.query.toLowerCase() !== searchQuery.toLowerCase()),
      ].slice(0, MAX_SEARCH_HISTORY)

      setSearchHistory(updatedHistory)
      localStorage.setItem("hackhub-search-history", JSON.stringify(updatedHistory))
    },
    [searchHistory],
  )

  // Remove item from search history
  const removeFromSearchHistory = useCallback(
    (searchQuery: string) => {
      const updatedHistory = searchHistory.filter((item) => item.query.toLowerCase() !== searchQuery.toLowerCase())
      setSearchHistory(updatedHistory)
      localStorage.setItem("hackhub-search-history", JSON.stringify(updatedHistory))
    },
    [searchHistory],
  )

  // Clear entire search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([])
    localStorage.removeItem("hackhub-search-history")
  }, [])

  // Search function
  const performSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)

      // Simulate API delay
      setTimeout(() => {
        const normalizedQuery = searchQuery.toLowerCase().trim()

        // Search users
        const matchedUsers = mockUsers
          .filter(
            (user) =>
              user.name.toLowerCase().includes(normalizedQuery) ||
              user.username.toLowerCase().includes(normalizedQuery),
          )
          .slice(0, 3)

        // Search posts
        const matchedPosts = posts
          .filter(
            (post) =>
              post.content.toLowerCase().includes(normalizedQuery) ||
              post.user.name.toLowerCase().includes(normalizedQuery) ||
              post.user.username.toLowerCase().includes(normalizedQuery),
          )
          .map((post) => ({
            id: post.id,
            content: post.content,
            user: {
              name: post.user.name,
              username: post.user.username,
            },
            type: "post" as const,
          }))
          .slice(0, 3)

        // Search topics
        const matchedTopics = mockTopics
          .filter((topic) => topic.name.toLowerCase().includes(normalizedQuery))
          .slice(0, 3)

        // Combine results
        const combinedResults = [...matchedUsers, ...matchedPosts, ...matchedTopics]
        setResults(combinedResults)
        setIsLoading(false)
      }, 300)
    },
    [posts],
  )

  // Handle search query changes
  useEffect(() => {
    if (query.trim()) {
      performSearch(query)
      setIsOpen(true)
    } else {
      setResults([])
      // Keep dropdown open if empty to show search history
      // but only if it's already open (user has focused the input)
      if (!isOpen) {
        setIsOpen(false)
      }
    }
  }, [query, performSearch, isOpen])

  // Navigate to result
  const navigateToResult = (result: SearchResult) => {
    switch (result.type) {
      case "user":
        router.push(`/profile/${result.username}`)
        break
      case "post":
        router.push(`/post/${result.id}`)
        break
      case "topic":
        router.push(`/topic/${result.name}`)
        break
    }
    setQuery("")
    setIsOpen(false)
  }

  // Navigate to search page with current query
  const navigateToSearchPage = () => {
    if (query.trim()) {
      // Add to search history before navigating
      addToSearchHistory(query.trim())

      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery("")
      setIsOpen(false)
    }
  }

  // Use a search from history
  const useHistoryItem = (historyItem: SearchHistoryItem) => {
    setQuery(historyItem.query)
    performSearch(historyItem.query)
  }

  return {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen,
    searchHistory,
    addToSearchHistory,
    removeFromSearchHistory,
    clearSearchHistory,
    useHistoryItem,
    navigateToResult,
    navigateToSearchPage,
  }
}
