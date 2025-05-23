"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"

interface AudioPlayerProps {
  src: string
  className?: string
  small?: boolean
}

export function AudioPlayer({ src, className, small = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isLoaded, setIsLoaded] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationRef = useRef<number>()

  // Initialize audio element
  useEffect(() => {
    if (!src) {
      setIsLoaded(false)
      return
    }

    const audio = new Audio()

    // Set up event listeners before setting the src
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration)
      setIsLoaded(true)
    })

    audio.addEventListener("ended", () => {
      setIsPlaying(false)
      setCurrentTime(0)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    })

    audio.addEventListener("error", (e) => {
      console.error("Error loading audio:", e)
      setIsLoaded(false)
    })

    // Set crossOrigin to avoid CORS issues
    audio.crossOrigin = "anonymous"

    // Set the src after adding event listeners
    audio.src = src

    // Store the audio element in ref
    audioRef.current = audio

    return () => {
      // Clean up properly
      audio.pause()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      // Remove event listeners
      audio.removeEventListener("loadedmetadata", () => {})
      audio.removeEventListener("ended", () => {})
      audio.removeEventListener("error", () => {})

      // Clear src and nullify ref
      audio.src = ""
      audioRef.current = null
    }
  }, [src])

  // Format time as MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Update progress bar
  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      animationRef.current = requestAnimationFrame(updateProgress)
    }
  }

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current || !isLoaded) return

    if (isPlaying) {
      audioRef.current.pause()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    } else {
      // Wrap in try/catch to handle potential play() errors
      try {
        const playPromise = audioRef.current.play()

        // Modern browsers return a promise from play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              animationRef.current = requestAnimationFrame(updateProgress)
            })
            .catch((error) => {
              console.error("Error playing audio:", error)
              setIsPlaying(false)
            })
        } else {
          // Fallback for older browsers
          animationRef.current = requestAnimationFrame(updateProgress)
        }
      } catch (error) {
        console.error("Error playing audio:", error)
        setIsPlaying(false)
      }
    }

    setIsPlaying(!isPlaying)
  }

  // Seek to position
  const seek = (value: number[]) => {
    if (!audioRef.current) return

    const newTime = value[0]
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  // Toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return

    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  // Change volume
  const changeVolume = (value: number[]) => {
    if (!audioRef.current) return

    const newVolume = value[0]
    audioRef.current.volume = newVolume
    setVolume(newVolume)

    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  // Compact player for chat messages
  if (small) {
    return (
      <div className={cn("flex items-center gap-2 max-w-full", className)}>
        {!isLoaded ? (
          <div className="w-full flex items-center justify-between gap-2 px-2 py-1 bg-muted/30 rounded text-muted-foreground">
            <span className="text-xs">Audio unavailable</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full",
                isPlaying ? "bg-blue-500/20 text-blue-500" : "bg-muted/50 hover:bg-muted",
              )}
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <div className="flex-1 flex items-center gap-2">
              <Slider value={[currentTime]} max={duration || 100} step={0.01} onValueChange={seek} className="flex-1" />
              <span className="text-xs text-muted-foreground min-w-[40px] text-right">{formatTime(currentTime)}</span>
            </div>
          </>
        )}
      </div>
    )
  }

  // Full-featured player
  return (
    <div className={cn("space-y-2 w-full", className)}>
      {!isLoaded ? (
        <div className="w-full flex items-center justify-between gap-2 p-3 bg-muted/30 rounded text-muted-foreground">
          <span className="text-sm">Audio failed to load</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full",
                isPlaying ? "bg-blue-500/20 text-blue-500" : "bg-muted/50 hover:bg-muted",
              )}
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs text-muted-foreground min-w-[40px]">{formatTime(currentTime)}</span>
              <Slider value={[currentTime]} max={duration || 100} step={0.01} onValueChange={seek} className="flex-1" />
              <span className="text-xs text-muted-foreground min-w-[40px] text-right">{formatTime(duration)}</span>
            </div>

            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={toggleMute}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          <Slider value={[isMuted ? 0 : volume]} max={1} step={0.01} onValueChange={changeVolume} className="w-full" />
        </>
      )}
    </div>
  )
}
