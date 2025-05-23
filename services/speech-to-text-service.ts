export interface SpeechToTextResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export interface SpeechToTextOptions {
  language: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
}

class SpeechToTextService {
  private recognition: any = null
  private isListening = false
  private callbacks: {
    onResult?: (result: SpeechToTextResult) => void
    onError?: (error: string) => void
    onStart?: () => void
    onEnd?: () => void
  } = {}

  constructor() {
    // Initialize speech recognition if available
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.setupRecognition()
      }
    }
  }

  // Check if speech recognition is supported
  isSupported(): boolean {
    return this.recognition !== null
  }

  // Setup speech recognition
  private setupRecognition() {
    if (!this.recognition) return

    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = "en-US"
    this.recognition.maxAlternatives = 1

    this.recognition.onstart = () => {
      this.isListening = true
      this.callbacks.onStart?.()
    }

    this.recognition.onresult = (event: any) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        const confidence = event.results[i][0].confidence

        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }

        this.callbacks.onResult?.({
          transcript: finalTranscript || interimTranscript,
          confidence: confidence || 0.5,
          isFinal: event.results[i].isFinal,
        })
      }
    }

    this.recognition.onerror = (event: any) => {
      this.isListening = false
      this.callbacks.onError?.(event.error)
    }

    this.recognition.onend = () => {
      this.isListening = false
      this.callbacks.onEnd?.()
    }
  }

  // Start listening
  startListening(options: Partial<SpeechToTextOptions> = {}) {
    if (!this.recognition || this.isListening) return

    // Apply options
    if (options.language) this.recognition.lang = options.language
    if (options.continuous !== undefined) this.recognition.continuous = options.continuous
    if (options.interimResults !== undefined) this.recognition.interimResults = options.interimResults
    if (options.maxAlternatives) this.recognition.maxAlternatives = options.maxAlternatives

    try {
      this.recognition.start()
    } catch (error) {
      this.callbacks.onError?.("Failed to start speech recognition")
    }
  }

  // Stop listening
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  // Set callbacks
  setCallbacks(callbacks: typeof this.callbacks) {
    this.callbacks = callbacks
  }

  // Get listening status
  getIsListening(): boolean {
    return this.isListening
  }
}

export const speechToTextService = new SpeechToTextService()
