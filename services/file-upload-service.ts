export interface FileUploadResult {
  success: boolean
  fileUrl?: string
  fileName: string
  fileSize: number
  mimeType: string
  error?: string
  metadata?: {
    width?: number
    height?: number
    duration?: number
  }
}

export interface FileValidationRules {
  maxSize: number // in bytes
  allowedTypes: string[]
  maxWidth?: number
  maxHeight?: number
}

class FileUploadService {
  private readonly defaultRules: FileValidationRules = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "audio/mp3",
      "audio/wav",
      "audio/webm",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxWidth: 4096,
    maxHeight: 4096,
  }

  // Validate file before upload
  validateFile(file: File, rules: Partial<FileValidationRules> = {}): { valid: boolean; error?: string } {
    const validationRules = { ...this.defaultRules, ...rules }

    // Check file size
    if (file.size > validationRules.maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${this.formatFileSize(validationRules.maxSize)} limit`,
      }
    }

    // Check file type
    if (!validationRules.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not supported`,
      }
    }

    return { valid: true }
  }

  // Upload file (simulated)
  async uploadFile(file: File, rules?: Partial<FileValidationRules>): Promise<FileUploadResult> {
    // Validate file
    const validation = this.validateFile(file, rules)
    if (!validation.valid) {
      return {
        success: false,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        error: validation.error,
      }
    }

    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

      // Create object URL for preview (in real app, upload to server/cloud)
      const fileUrl = URL.createObjectURL(file)

      // Get metadata for images/videos
      const metadata = await this.extractMetadata(file)

      return {
        success: true,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        metadata,
      }
    } catch (error) {
      return {
        success: false,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        error: "Upload failed. Please try again.",
      }
    }
  }

  // Extract metadata from files
  private async extractMetadata(file: File): Promise<{ width?: number; height?: number; duration?: number }> {
    if (file.type.startsWith("image/")) {
      return this.getImageMetadata(file)
    }

    if (file.type.startsWith("video/") || file.type.startsWith("audio/")) {
      return this.getMediaMetadata(file)
    }

    return {}
  }

  // Get image dimensions
  private getImageMetadata(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.onerror = () => {
        resolve({ width: 0, height: 0 })
      }
      img.src = URL.createObjectURL(file)
    })
  }

  // Get media duration
  private getMediaMetadata(file: File): Promise<{ duration: number }> {
    return new Promise((resolve) => {
      const media = file.type.startsWith("video/") ? document.createElement("video") : document.createElement("audio")

      media.onloadedmetadata = () => {
        resolve({ duration: media.duration })
      }

      media.onerror = () => {
        resolve({ duration: 0 })
      }

      media.src = URL.createObjectURL(file)
    })
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Get file icon based on type
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith("image/")) return "🖼️"
    if (mimeType.startsWith("video/")) return "🎥"
    if (mimeType.startsWith("audio/")) return "🎵"
    if (mimeType.includes("pdf")) return "📄"
    if (mimeType.includes("word")) return "📝"
    if (mimeType.includes("text")) return "📄"
    return "📎"
  }
}

export const fileUploadService = new FileUploadService()
