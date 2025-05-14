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

export function useSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  // Get posts for searching
  const { posts } = usePosts()

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
      setIsOpen(false)
    }
  }, [query, performSearch])

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
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery("")
      setIsOpen(false)
    }
  }

  return {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen,
    navigateToResult,
    navigateToSearchPage,
  }
}
