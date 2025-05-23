"use client"

import { useState } from "react"
import { ProfileSettings } from "./profile-settings"
import { useToast } from "@/components/ui/use-toast"

// Mock user data
const mockUser = {
  id: "user-1",
  name: "Sarah Connor",
  username: "techrebel",
  email: "sarah@hackhub.network",
  bio: "Cybersecurity specialist | Ethical hacker | AI researcher | Building the resistance against Skynet",
  location: "Los Angeles, CA",
  avatar: "/placeholder.svg?height=100&width=100&text=SC",
  socialLinks: {
    website: "https://sarahconnor.tech",
    twitter: "@techrebel",
    linkedin: "linkedin.com/in/sarahconnor",
  },
}

export function ProfileSettingsDemo() {
  const [user, setUser] = useState(mockUser)
  const { toast } = useToast()

  // Placeholder save function
  const handleSave = async (updatedProfile: Partial<typeof user>) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Update user state
    setUser((prev) => ({
      ...prev,
      ...updatedProfile,
      socialLinks: {
        ...prev.socialLinks,
        ...updatedProfile.socialLinks,
      },
    }))

    // In a real app, you would make an API call here
    console.log("Saving profile:", updatedProfile)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Profile Settings Demo</h1>
        <p className="text-muted-foreground">
          A comprehensive profile settings component with photo upload and social links
        </p>
      </div>

      <ProfileSettings user={user} onSave={handleSave} />

      {/* Current Profile Data Display */}
      <div className="mt-8 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-semibold mb-2">Current Profile Data:</h3>
        <pre className="text-xs overflow-auto">{JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  )
}
