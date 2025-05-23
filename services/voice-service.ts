export interface VoiceProfile {
  id: string
  name: string
  description: string
  language: string
  gender: "male" | "female" | "neutral"
  style: "casual" | "professional" | "robotic" | "character"
  preview: string // Sample text for preview
}

export const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: "hacker-robert",
    name: "Hacker Robert",
    description: "Cool, tech-savvy voice with a slight edge",
    language: "en-US",
    gender: "male",
    style: "casual",
    preview: "Hey there, ready to hack the matrix?",
  },
  {
    id: "cat-meow",
    name: "Cat Meow",
    description: "Playful, cute voice with cat-like inflections",
    language: "en-US",
    gender: "neutral",
    style: "character",
    preview: "Meow! I'm here to help you, nya~",
  },
  {
    id: "professional-sarah",
    name: "Professional Sarah",
    description: "Clear, professional voice for business contexts",
    language: "en-US",
    gender: "female",
    style: "professional",
    preview: "Good day! I'm here to assist you professionally.",
  },
  {
    id: "robot-zx",
    name: "Robot ZX",
    description: "Futuristic robotic voice with digital effects",
    language: "en-US",
    gender: "neutral",
    style: "robotic",
    preview: "BEEP BOOP. INITIALIZING ASSISTANCE PROTOCOL.",
  },
  {
    id: "friendly-alex",
    name: "Friendly Alex",
    description: "Warm, friendly voice for casual conversations",
    language: "en-US",
    gender: "neutral",
    style: "casual",
    preview: "Hi friend! How can I help you today?",
  },
]

class VoiceService {
  private currentVoice: VoiceProfile = VOICE_PROFILES[0]
  private synthesis: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []

  constructor() {
    if (typeof window !== "undefined") {
      this.synthesis = window.speechSynthesis
      this.loadVoices()
    }
  }

  // Load available system voices
  private loadVoices() {
    if (!this.synthesis) return

    const loadVoicesCallback = () => {
      this.voices = this.synthesis!.getVoices()
    }

    // Load voices immediately if available
    this.voices = this.synthesis.getVoices()

    // Some browsers load voices asynchronously
    if (this.voices.length === 0) {
      this.synthesis.onvoiceschanged = loadVoicesCallback
    }
  }

  // Check if text-to-speech is supported
  isSupported(): boolean {
    return this.synthesis !== null
  }

  // Set current voice profile
  setVoiceProfile(voiceId: string) {
    const voice = VOICE_PROFILES.find((v) => v.id === voiceId)
    if (voice) {
      this.currentVoice = voice
    }
  }

  // Get current voice profile
  getCurrentVoice(): VoiceProfile {
    return this.currentVoice
  }

  // Get all available voice profiles
  getVoiceProfiles(): VoiceProfile[] {
    return VOICE_PROFILES
  }

  // Speak text with current voice profile
  speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        console.warn("Speech synthesis not supported in this browser")
        reject(new Error("Speech synthesis not supported"))
        return
      }

      // Cancel any ongoing speech
      this.synthesis.cancel()

      // Don't try to speak empty text
      if (!text || text.trim() === "") {
        resolve()
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)

      // Apply voice profile settings
      this.applyVoiceProfile(utterance)

      utterance.onend = () => resolve()
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event)
        reject(new Error(`Speech synthesis error: ${event.error || "unknown error"}`))
      }

      try {
        this.synthesis.speak(utterance)
      } catch (error) {
        console.error("Failed to start speech synthesis:", error)
        reject(error)
      }
    })
  }

  // Apply voice profile settings to utterance
  private applyVoiceProfile(utterance: SpeechSynthesisUtterance) {
    const profile = this.currentVoice

    // Find best matching system voice
    const systemVoice = this.findBestVoice(profile)
    if (systemVoice) {
      utterance.voice = systemVoice
    }

    // Apply style-specific settings
    switch (profile.style) {
      case "robotic":
        utterance.rate = 0.8
        utterance.pitch = 0.7
        utterance.volume = 0.9
        break
      case "professional":
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 0.8
        break
      case "character":
        utterance.rate = 1.1
        utterance.pitch = 1.3
        utterance.volume = 0.9
        break
      case "casual":
      default:
        utterance.rate = 1.0
        utterance.pitch = 1.0
        utterance.volume = 0.8
        break
    }

    // Special handling for character voices
    if (profile.id === "cat-meow") {
      // Add cat-like inflections (simplified)
      utterance.text = utterance.text.replace(/\./g, ", nya.")
      utterance.pitch = 1.4
      utterance.rate = 1.2
    } else if (profile.id === "hacker-robert") {
      utterance.pitch = 0.8
      utterance.rate = 0.95
    }
  }

  // Find best matching system voice for profile
  private findBestVoice(profile: VoiceProfile): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) return null

    // Filter by language
    const languageVoices = this.voices.filter((voice) => voice.lang.startsWith(profile.language.split("-")[0]))

    if (languageVoices.length === 0) return this.voices[0]

    // Try to match gender
    const genderKeywords = {
      male: ["male", "man", "david", "mark", "alex"],
      female: ["female", "woman", "sarah", "emma", "anna"],
      neutral: [],
    }

    const keywords = genderKeywords[profile.gender] || []

    for (const keyword of keywords) {
      const match = languageVoices.find((voice) => voice.name.toLowerCase().includes(keyword))
      if (match) return match
    }

    return languageVoices[0]
  }

  // Preview voice profile
  async previewVoice(voiceId: string): Promise<void> {
    const voice = VOICE_PROFILES.find((v) => v.id === voiceId)
    if (!voice) return

    const previousVoice = this.currentVoice
    this.setVoiceProfile(voiceId)

    try {
      await this.speak(voice.preview)
    } finally {
      this.currentVoice = previousVoice
    }
  }

  // Stop current speech
  stop() {
    if (this.synthesis) {
      this.synthesis.cancel()
    }
  }
}

export const voiceService = new VoiceService()
