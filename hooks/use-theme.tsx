"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Theme = "dark" | "light"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")

  // Load theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("hackhub-theme") as Theme | null
    if (storedTheme) {
      setTheme(storedTheme)
      document.documentElement.classList.toggle("light-theme", storedTheme === "light")
    }
  }, [])

  // Update localStorage and apply theme when it changes
  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem("hackhub-theme", newTheme)
    document.documentElement.classList.toggle("light-theme", newTheme === "light")
  }

  return <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
