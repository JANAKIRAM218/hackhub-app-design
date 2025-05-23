"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Camera, Upload, X, Save, Loader2, User, MapPin, Twitter, Linkedin, Globe, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageCropper } from "./image-cropper"

interface UserProfile {
  id: string
  name: string
  username: string
  email: string
  bio: string
  location: string
  avatar: string
  socialLinks: {
    website: string
    twitter: string
    linkedin: string
  }
}

interface ProfileSettingsProps {
  user: UserProfile
  onSave: (updatedProfile: Partial<UserProfile>) => Promise<void>
  className?: string
}

interface ImageValidationResult {
  isValid: boolean
  error?: string
}

export function ProfileSettings({ user, onSave, className }: ProfileSettingsProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [originalImage, setOriginalImage] = useState<string>("")

  // Form state
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio,
    location: user.location,
    website: user.socialLinks.website,
    twitter: user.socialLinks.twitter,
    linkedin: user.socialLinks.linkedin,
  })

  // Photo upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [imageError, setImageError] = useState<string>("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Image validation
  const validateImage = useCallback((file: File): ImageValidationResult => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: "Please select a valid image file (JPEG, PNG, or WebP)",
      }
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: "Image size must be less than 5MB",
      }
    }

    return { isValid: true }
  }, [])

  // Handle image selection
  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const validation = validateImage(file)
      if (!validation.isValid) {
        setImageError(validation.error || "Invalid image")
        return
      }

      setImageError("")
      setSelectedImage(file)

      // Create preview and show cropper
      const reader = new FileReader()
      reader.onloadend = () => {
        setOriginalImage(reader.result as string)
        setShowCropper(true)
      }
      reader.readAsDataURL(file)
    },
    [validateImage],
  )

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (!file) return

      const validation = validateImage(file)
      if (!validation.isValid) {
        setImageError(validation.error || "Invalid image")
        return
      }

      setImageError("")
      setSelectedImage(file)

      const reader = new FileReader()
      reader.onloadend = () => {
        setOriginalImage(reader.result as string)
        setShowCropper(true)
      }
      reader.readAsDataURL(file)
    },
    [validateImage],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  // Upload image (placeholder function)
  const uploadImage = async (file: File): Promise<string> => {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real app, you would upload to your server/cloud storage
    // and return the URL of the uploaded image
    return URL.createObjectURL(file)
  }

  // Handle crop completion
  const handleCropComplete = useCallback(
    (croppedBlob: Blob) => {
      const croppedUrl = URL.createObjectURL(croppedBlob)
      setImagePreview(croppedUrl)
      setShowCropper(false)

      // Convert blob back to file for upload
      const croppedFile = new File([croppedBlob], selectedImage?.name || "cropped-image.jpg", {
        type: "image/jpeg",
      })
      setSelectedImage(croppedFile)
    },
    [selectedImage],
  )

  // Handle crop cancel
  const handleCropCancel = useCallback(() => {
    setShowCropper(false)
    setOriginalImage("")
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  // Handle photo save
  const handlePhotoSave = async () => {
    if (!selectedImage) return

    setIsUploading(true)
    try {
      const imageUrl = await uploadImage(selectedImage)

      await onSave({ avatar: imageUrl })

      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been updated successfully.",
      })

      setShowPhotoDialog(false)
      setSelectedImage(null)
      setImagePreview("")
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to update profile photo. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle photo cancel
  const handlePhotoCancel = () => {
    setShowPhotoDialog(false)
    setSelectedImage(null)
    setImagePreview("")
    setImageError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Handle form save
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave({
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        socialLinks: {
          website: formData.website,
          twitter: formData.twitter,
          linkedin: formData.linkedin,
        },
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      name: user.name,
      bio: user.bio,
      location: user.location,
      website: user.socialLinks.website,
      twitter: user.socialLinks.twitter,
      linkedin: user.socialLinks.linkedin,
    })
    setIsEditing(false)
  }

  return (
    <>
      <Card className={cn("border-border/40 bg-background/80 backdrop-blur-sm", className)}>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-neon-green" />
            Profile Settings
          </CardTitle>
          <CardDescription>Manage your profile information and social links</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Profile Photo Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-neon-green glow">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <button
                onClick={() => setShowPhotoDialog(true)}
                className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowPhotoDialog(true)}>
                <Camera className="mr-2 h-4 w-4" />
                Change Photo
              </Button>
            </div>
          </div>

          <Separator />

          {/* Profile Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Profile Information</h3>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="bg-muted/50 border-muted focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                  />
                ) : (
                  <p className="text-sm py-2">{user.name}</p>
                )}
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <p className="text-sm py-2 text-muted-foreground">{user.email}</p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="bg-muted/50 border-muted focus:border-neon-green focus:ring-1 focus:ring-neon-green min-h-[100px]"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-sm py-2">{user.bio || "No bio added yet"}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="bg-muted/50 border-muted focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                    placeholder="City, Country"
                  />
                ) : (
                  <p className="text-sm py-2">{user.location || "No location added"}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Social Links</h3>

            <div className="grid gap-4">
              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-medium flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  Website
                </Label>
                {isEditing ? (
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    className="bg-muted/50 border-muted focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                    placeholder="https://yourwebsite.com"
                  />
                ) : (
                  <p className="text-sm py-2">
                    {user.socialLinks.website ? (
                      <a
                        href={user.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-green hover:underline"
                      >
                        {user.socialLinks.website}
                      </a>
                    ) : (
                      "No website added"
                    )}
                  </p>
                )}
              </div>

              {/* Twitter */}
              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-sm font-medium flex items-center gap-1">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Label>
                {isEditing ? (
                  <Input
                    id="twitter"
                    value={formData.twitter}
                    onChange={(e) => handleInputChange("twitter", e.target.value)}
                    className="bg-muted/50 border-muted focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                    placeholder="@username"
                  />
                ) : (
                  <p className="text-sm py-2">
                    {user.socialLinks.twitter ? (
                      <a
                        href={`https://twitter.com/${user.socialLinks.twitter.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-green hover:underline"
                      >
                        {user.socialLinks.twitter}
                      </a>
                    ) : (
                      "No Twitter added"
                    )}
                  </p>
                )}
              </div>

              {/* LinkedIn */}
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-sm font-medium flex items-center gap-1">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Label>
                {isEditing ? (
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange("linkedin", e.target.value)}
                    className="bg-muted/50 border-muted focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                    placeholder="linkedin.com/in/username"
                  />
                ) : (
                  <p className="text-sm py-2">
                    {user.socialLinks.linkedin ? (
                      <a
                        href={user.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-green hover:underline"
                      >
                        {user.socialLinks.linkedin}
                      </a>
                    ) : (
                      "No LinkedIn added"
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button onClick={handleSave} disabled={isSaving} className="flex-1 glow">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="flex-1">
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Profile Photo Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="sm:max-w-4xl border-border/40 bg-background/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>{showCropper ? "Crop Your Photo" : "Change Profile Photo"}</DialogTitle>
            <DialogDescription>
              {showCropper
                ? "Adjust the crop area, zoom, and rotation to get the perfect profile photo."
                : "Upload a new profile photo. Maximum file size is 5MB."}
            </DialogDescription>
          </DialogHeader>

          {showCropper ? (
            <ImageCropper
              imageSrc={originalImage}
              onCropComplete={handleCropComplete}
              onCancel={handleCropCancel}
              aspectRatio={1} // Square crop for profile photos
            />
          ) : (
            <div className="space-y-4">
              {/* Upload Area */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                  imageError ? "border-red-500 bg-red-50/10" : "border-border hover:border-neon-green",
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="space-y-4">
                    <div className="relative mx-auto w-32 h-32">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-full border-2 border-neon-green"
                      />
                      <button
                        onClick={() => {
                          setImagePreview("")
                          setSelectedImage(null)
                          if (fileInputRef.current) fileInputRef.current.value = ""
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">Click Save to update your profile photo</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Drop your image here, or click to browse</p>
                      <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, or WebP up to 5MB</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="hover:border-neon-green"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </Button>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {imageError && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {imageError}
                </div>
              )}
            </div>
          )}

          {!showCropper && (
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handlePhotoCancel} disabled={isUploading} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handlePhotoSave} disabled={!selectedImage || isUploading} className="flex-1 glow">
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Photo
                  </>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
