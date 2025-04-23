"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Mock user data
const defaultUser = {
  id: "user-1",
  name: "Sarah Connor",
  username: "techrebel",
  avatar: "/placeholder.svg?height=100&width=100",
  email: "sarah@hackhub.network",
  bio: "Cybersecurity specialist | Ethical hacker | AI researcher | Building the resistance against Skynet",
  location: "Los Angeles, CA",
  website: "https://sarahconnor.tech",
  joinedDate: "Joined March 2023",
  following: 245,
  followers: 1024,
}

interface User {
  id: string
  name: string
  username: string
  avatar: string
  email: string
  bio: string
  location: string
  website: string
  joinedDate: string
  following: number
  followers: number
}

interface ProfileUpdateData {
  username?: string
  bio?: string
  location?: string
  website?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: () => void
  logout: () => void
  updateProfile: (data: ProfileUpdateData) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem("hackhub-auth")
    if (storedAuth) {
      try {
        // Try to get stored user data
        const storedUser = localStorage.getItem("hackhub-user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        } else {
          setUser(defaultUser)
        }
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Failed to parse user data:", error)
        setUser(defaultUser)
        setIsAuthenticated(true)
      }
    }
  }, [])

  const login = () => {
    localStorage.setItem("hackhub-auth", "true")

    // Check if we have stored user data
    const storedUser = localStorage.getItem("hackhub-user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse user data:", error)
        setUser(defaultUser)
      }
    } else {
      setUser(defaultUser)
    }

    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem("hackhub-auth")
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateProfile = (data: ProfileUpdateData) => {
    if (!user) return

    const updatedUser = {
      ...user,
      ...data,
    }

    setUser(updatedUser)
    localStorage.setItem("hackhub-user", JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
