import type { EnhancedMessage } from "@/types/conversation"

export interface AIContext {
  conversationId: string
  messages: EnhancedMessage[]
  userPreferences: {
    responseStyle: "casual" | "professional" | "technical" | "creative"
    preferredLanguage: string
    topics: string[]
  }
  systemPrompt?: string
}

export interface AIResponse {
  content: string
  type: "text" | "voice" | "image"
  timestamp: Date
  audioUrl?: string
  imageUrl?: string
  metadata?: {
    confidence: number
    processingTime: number
    model: string
    error?: string
  }
}

// Enhanced AI service with context management
class EnhancedAIService {
  private contexts: Map<string, AIContext> = new Map()
  private readonly MAX_CONTEXT_MESSAGES = 20
  private readonly DEFAULT_SYSTEM_PROMPT =
    "You are Sonix, an AI assistant for the HackHub platform. " +
    "You are helpful, concise, and knowledgeable about technology topics. " +
    "Respond in a friendly, conversational manner. " +
    "If you don't know something, admit it rather than making up information."

  private readonly RESPONSE_TIMEOUT = 15000 // 15 seconds timeout
  private readonly MAX_RETRIES = 2

  // Initialize or update conversation context
  updateContext(conversationId: string, messages: EnhancedMessage[], userPreferences?: any, systemPrompt?: string) {
    const context: AIContext = {
      conversationId,
      messages: messages.slice(-this.MAX_CONTEXT_MESSAGES), // Keep last 20 messages
      userPreferences: userPreferences || {
        responseStyle: "casual",
        preferredLanguage: "en",
        topics: [],
      },
      systemPrompt: systemPrompt || this.DEFAULT_SYSTEM_PROMPT,
    }
    this.contexts.set(conversationId, context)
  }

  // Get conversation context
  getContext(conversationId: string): AIContext | null {
    return this.contexts.get(conversationId) || null
  }

  // Format messages for the AI model
  private formatMessagesForModel(messages: EnhancedMessage[], systemPrompt: string): any[] {
    const formattedMessages = [{ role: "system", content: systemPrompt }]

    // Add recent message history for context
    messages.forEach((msg) => {
      const role = msg.senderId === "sonix" ? "assistant" : "user"
      let content = msg.content

      // Handle special message types
      if (msg.type === "image") {
        content = `[Shared an image${msg.content ? `: ${msg.content}` : ""}]`
      } else if (msg.type === "voice") {
        content = `[Shared a voice message]`
      } else if (msg.type === "file") {
        content = `[Shared a file: ${msg.fileName || "unnamed file"}]`
      }

      formattedMessages.push({ role, content })
    })

    return formattedMessages
  }

  // Analyze message intent
  private analyzeIntent(message: string): {
    type: "question" | "request" | "image_generation" | "general" | "code" | "greeting"
    confidence: number
    keywords: string[]
  } {
    const lowerMessage = message.toLowerCase()

    // Image generation patterns
    const imagePatterns = [
      /generate.*image/i,
      /create.*picture/i,
      /draw.*for me/i,
      /make.*image/i,
      /show me.*picture/i,
      /generate.*photo/i,
    ]

    if (imagePatterns.some((pattern) => pattern.test(message))) {
      return {
        type: "image_generation",
        confidence: 0.9,
        keywords: this.extractImageKeywords(message),
      }
    }

    // Code patterns
    if (lowerMessage.includes("code") || lowerMessage.includes("function") || lowerMessage.includes("algorithm")) {
      return {
        type: "code",
        confidence: 0.8,
        keywords: ["programming", "development"],
      }
    }

    // Question patterns
    if (lowerMessage.includes("?") || lowerMessage.startsWith("how") || lowerMessage.startsWith("what")) {
      return {
        type: "question",
        confidence: 0.7,
        keywords: [],
      }
    }

    // Greeting patterns
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      return {
        type: "greeting",
        confidence: 0.9,
        keywords: [],
      }
    }

    return {
      type: "general",
      confidence: 0.5,
      keywords: [],
    }
  }

  // Extract keywords for image generation
  private extractImageKeywords(message: string): string[] {
    const keywords: string[] = []
    const words = message.toLowerCase().split(/\s+/)

    // Common image descriptors
    const descriptors = [
      "sunset",
      "sunrise",
      "landscape",
      "portrait",
      "abstract",
      "realistic",
      "cartoon",
      "anime",
      "photorealistic",
      "digital art",
      "painting",
      "cat",
      "dog",
      "person",
      "building",
      "nature",
      "ocean",
      "mountain",
      "city",
      "forest",
      "space",
      "galaxy",
      "robot",
      "futuristic",
    ]

    words.forEach((word) => {
      if (descriptors.includes(word)) {
        keywords.push(word)
      }
    })

    return keywords
  }

  // Generate contextual AI response with improved error handling
  async generateResponse(conversationId: string, message: string, isVoiceMessage = false): Promise<AIResponse> {
    const context = this.getContext(conversationId) || {
      conversationId,
      messages: [],
      userPreferences: {
        responseStyle: "casual",
        preferredLanguage: "en",
        topics: [],
      },
      systemPrompt: this.DEFAULT_SYSTEM_PROMPT,
    }

    const intent = this.analyzeIntent(message)
    let retries = 0

    // Handle image generation requests
    if (intent.type === "image_generation") {
      return this.generateImageResponse(intent.keywords, message)
    }

    while (retries <= this.MAX_RETRIES) {
      try {
        // In a real implementation, this would call an actual AI API
        // Here we're simulating the API call with a timeout
        const formattedMessages = this.formatMessagesForModel(
          [
            ...context.messages,
            {
              id: `temp-user-${Date.now()}`,
              content: message,
              senderId: "user-1",
              senderName: "User",
              timestamp: new Date(),
              status: "sent",
              type: isVoiceMessage ? "voice" : "text",
            },
          ],
          context.systemPrompt || this.DEFAULT_SYSTEM_PROMPT,
        )

        // Simulate API call with timeout
        const responsePromise = new Promise<string>((resolve, reject) => {
          // Simulate processing delay
          const delay = 1000 + Math.random() * 2000
          setTimeout(() => {
            // 10% chance of error for testing
            if (Math.random() < 0.1 && retries === 0) {
              reject(new Error("AI service temporarily unavailable"))
            } else {
              resolve(this.generateContextualTextResponse(message, intent, context))
            }
          }, delay)
        })

        // Add timeout to the promise
        const response = await Promise.race([
          responsePromise,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Response timeout")), this.RESPONSE_TIMEOUT),
          ),
        ])

        // Decide if response should be voice (30% chance for voice messages)
        const shouldRespondWithVoice = isVoiceMessage && Math.random() > 0.7

        return {
          content: response,
          type: shouldRespondWithVoice ? "voice" : "text",
          timestamp: new Date(),
          audioUrl: shouldRespondWithVoice ? this.getRandomVoiceUrl() : undefined,
          metadata: {
            confidence: intent.confidence,
            processingTime: Date.now(),
            model: "sonix-v2",
          },
        }
      } catch (error) {
        retries++
        console.error(`AI response error (attempt ${retries}/${this.MAX_RETRIES + 1}):`, error)

        // If we've exhausted retries, return a fallback response
        if (retries > this.MAX_RETRIES) {
          return {
            content: "I'm having trouble processing your request right now. Please try again in a moment.",
            type: "text",
            timestamp: new Date(),
            metadata: {
              confidence: 0.1,
              processingTime: Date.now(),
              model: "sonix-fallback",
              error: error instanceof Error ? error.message : "Unknown error",
            },
          }
        }

        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries))
      }
    }

    // This should never be reached due to the return in the catch block
    // but TypeScript needs it for type safety
    throw new Error("Failed to generate AI response after retries")
  }

  // Generate image using AI (simulated)
  private async generateImageResponse(keywords: string[], originalMessage: string): Promise<AIResponse> {
    try {
      // Simulate image generation delay
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 10% chance of error for testing
          if (Math.random() < 0.1) {
            reject(new Error("Image generation failed"))
          } else {
            resolve(null)
          }
        }, 3000)
      })

      // In a real implementation, this would call DALL-E or similar API
      const imagePrompt = keywords.length > 0 ? keywords.join(", ") : "abstract digital art"
      const imageUrl = `/placeholder.svg?height=512&width=512&text=${encodeURIComponent(imagePrompt)}`

      return {
        content: `I've generated an image based on your request: "${originalMessage}". Here's what I created:`,
        type: "image",
        timestamp: new Date(),
        imageUrl,
        metadata: {
          confidence: 0.85,
          processingTime: 3000,
          model: "sonix-image-v1",
        },
      }
    } catch (error) {
      console.error("Image generation error:", error)

      return {
        content:
          "I wasn't able to generate that image. There might be an issue with the image service or your request. Could you try again with a different description?",
        type: "text",
        timestamp: new Date(),
        metadata: {
          confidence: 0.1,
          processingTime: 3000,
          model: "sonix-fallback",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }
    }
  }

  // Generate contextual text response
  private generateContextualTextResponse(message: string, intent: any, context: AIContext | null): string {
    const responses = {
      greeting: [
        "Hello! I'm Sonix, your AI assistant. How can I help you today?",
        "Hey there! Ready to assist with whatever you need.",
        "Hi! I'm here to help. What's on your mind?",
      ],
      question: [
        "That's a great question! Let me help you with that.",
        "I'd be happy to answer that for you.",
        "Interesting question! Here's what I know:",
      ],
      code: [
        "I can help you with that coding challenge!",
        "Let me assist you with the technical implementation.",
        "Great! I love helping with programming questions.",
      ],
      general: [
        "I understand what you're asking about.",
        "That's an interesting topic to explore.",
        "I can definitely help you with that.",
      ],
    }

    const baseResponses = responses[intent.type as keyof typeof responses] || responses.general
    const baseResponse = baseResponses[Math.floor(Math.random() * baseResponses.length)]

    // Add context-aware elements
    let contextualResponse = baseResponse

    if (context && context.messages.length > 0) {
      const recentTopics = this.extractTopicsFromContext(context)
      if (recentTopics.length > 0) {
        contextualResponse += ` I notice we've been discussing ${recentTopics.join(", ")}. `
      }
    }

    // Add helpful follow-up
    const followUps = [
      "Is there anything specific you'd like to know more about?",
      "Would you like me to elaborate on any particular aspect?",
      "Feel free to ask if you need more details!",
    ]

    contextualResponse += " " + followUps[Math.floor(Math.random() * followUps.length)]

    return contextualResponse
  }

  // Extract topics from conversation context
  private extractTopicsFromContext(context: AIContext): string[] {
    const topics: string[] = []
    const recentMessages = context.messages.slice(-5) // Last 5 messages

    recentMessages.forEach((msg) => {
      const words = msg.content.toLowerCase().split(/\s+/)
      // Simple topic extraction (in real app, use NLP)
      const topicWords = words.filter(
        (word) => word.length > 4 && !["that", "this", "with", "from", "they", "have", "been"].includes(word),
      )
      topics.push(...topicWords.slice(0, 2)) // Take first 2 relevant words
    })

    return [...new Set(topics)].slice(0, 3) // Return unique topics, max 3
  }

  // Get random voice URL for voice responses
  private getRandomVoiceUrl(): string {
    const voiceUrls = ["/placeholder-audio-1.mp3", "/placeholder-audio-2.mp3", "/placeholder-audio-3.mp3"]
    return voiceUrls[Math.floor(Math.random() * voiceUrls.length)]
  }

  // Generate message suggestions based on context
  generateMessageSuggestions(conversationId: string, lastMessage?: string): string[] {
    const context = this.getContext(conversationId)

    if (!lastMessage) {
      return ["Hello Sonix!", "Can you help me with something?", "Generate an image for me", "What can you do?"]
    }

    const lowerMessage = lastMessage.toLowerCase()

    // Context-aware suggestions
    if (lowerMessage.includes("image") || lowerMessage.includes("picture")) {
      return [
        "Generate a sunset landscape",
        "Create a futuristic city",
        "Make an abstract art piece",
        "Show me a cute cat",
      ]
    }

    if (lowerMessage.includes("code") || lowerMessage.includes("programming")) {
      return ["Explain this algorithm", "Help me debug this code", "Show me best practices", "Optimize this function"]
    }

    // General suggestions
    return ["That's interesting!", "Tell me more", "Can you explain further?", "Thanks for the help!"]
  }
}

export const enhancedAIService = new EnhancedAIService()
