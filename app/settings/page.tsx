"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { Sidebar } from "@/components/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useTheme } from "@/hooks/use-theme"
import { Terminal, User, Shield, LogOut, Save, Upload, RefreshCw } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, updateProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form states
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [website, setWebsite] = useState("")
  const [avatarPreview, setAvatarPreview] = useState("")

  // Password form states
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setUsername(user.username)
      setBio(user.bio)
      setLocation(user.location || "")
      setWebsite(user.website || "")
      setAvatarPreview(user.avatar)
    }
  }, [user])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    updateProfile({
      username,
      bio,
      location,
      website,
      avatar: avatarPreview,
    })

    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    })
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirm password must match.",
        variant: "destructive",
      })
      return
    }

    // Simulate password change
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    })

    // Reset form
    setOldPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!isAuthenticated || !user) {
    return null // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen">
      <MainNav />
      <div className="container grid grid-cols-1 md:grid-cols-12 gap-6 py-6">
        <aside className="hidden md:block md:col-span-3">
          <Sidebar className="sticky top-20" />
        </aside>

        <main className="md:col-span-9 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold font-mono glow-text">Settings</h1>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6 bg-muted/30">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green"
              >
                <Terminal className="mr-2 h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green"
              >
                <Shield className="mr-2 h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-0 space-y-4">
              <Card className="border-border/40 bg-background/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-neon-green" />
                    <span>Edit Profile</span>
                  </CardTitle>
                  <CardDescription>Update your profile information visible to other users</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
                        <Avatar className="h-24 w-24 border-2 border-neon-green glow">
                          <AvatarImage src={avatarPreview || "/placeholder.svg"} alt={username} />
                          <AvatarFallback className="text-2xl">{username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Upload className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <span className="text-sm text-muted-foreground">Click to upload new avatar</span>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-mono">
                          &gt; Username
                        </Label>
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="bg-muted/50 border-muted focus:border-neon-green focus:ring-1 focus:ring-neon-green font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-sm font-mono">
                          &gt; Bio
                        </Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="bg-muted/50 border-muted focus:border-neon-green focus:ring-1 focus:ring-neon-green font-mono min-h-[100px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-mono">
                          &gt; Location
                        </Label>
                        <Input
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="bg-muted/50 border-muted focus:border-neon-green focus:ring-1 focus:ring-neon-green font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-sm font-mono">
                          &gt; Website
                        </Label>
                        <Input
                          id="website"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="bg-muted/50 border-muted focus:border-neon-green focus:ring-1 focus:ring-neon-green font-mono"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full glow">
                      <Save className="mr-2 h-4 w-4" />
                      <span className="mr-1">&gt;</span> Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="mt-0 space-y-4">
              <Card className="border-border/40 bg-background/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-neon-green" />
                    <span>Appearance</span>
                  </CardTitle>
                  <CardDescription>Customize how HackHub looks and feels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-mono">Hacker Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable neon glows, glitch effects and terminal-style UI
                      </p>
                    </div>
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                      className="data-[state=checked]:bg-neon-green"
                    />
                  </div>

                  <Separator className="bg-border/40" />

                  <div className="space-y-4">
                    <Label className="text-base font-mono">Preview</Label>
                    <div
                      className={`p-6 rounded-md border transition-all duration-300 ${
                        theme === "dark" ? "border-neon-green bg-background/80 glow" : "border-gray-200 bg-white"
                      }`}
                    >
                      <p className={`mb-4 ${theme === "dark" ? "font-mono" : "font-sans"}`}>
                        This is how your content will look with the current theme.
                      </p>
                      <Button
                        className={
                          theme === "dark"
                            ? "bg-background border border-neon-green text-neon-green hover:bg-neon-green/10 glow font-mono"
                            : "bg-gray-900 text-white hover:bg-gray-800 font-sans"
                        }
                      >
                        {theme === "dark" && <span className="mr-1">&gt;</span>} Sample Button
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-0 space-y-4">
              <Card className="border-border/40 bg-background/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-neon-green" />
                    <span>Change Password</span>
                  </CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password" className="text-sm font-mono">
                          &gt; Current Password
                        </Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="bg-muted/50 border-muted focus:border-neon-green focus:ring-1 focus:ring-neon-green font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-sm font-mono">
                          &gt; New Password
                        </Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-muted/50 border-muted focus:border-neon-green focus:ring-1 focus:ring-neon-green font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-sm font-mono">
                          &gt; Confirm New Password
                        </Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-muted/50 border-muted focus:border-neon-green focus:ring-1 focus:ring-neon-green font-mono"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full glow">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      <span className="mr-1">&gt;</span> Update Password
                    </Button>
                  </form>

                  <Separator className="my-6 bg-border/40" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold font-mono">Account Actions</h3>
                    <Button
                      variant="destructive"
                      className="w-full bg-red-900/30 hover:bg-red-900/50 border border-red-500/50"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span className="mr-1">&gt;</span> Logout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
