import { Terminal } from "lucide-react"
import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  withText?: boolean
}

export function Logo({ size = "md", withText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative">
        <Terminal className={`${sizeClasses[size]} text-neon-green animate-pulse-glow`} strokeWidth={2.5} />
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black font-bold">
          {"_"}
        </span>
      </div>
      {withText && (
        <span className={`font-mono font-bold ${textSizeClasses[size]} tracking-tight glow-text`} data-text="HackHub">
          HackHub
        </span>
      )}
    </Link>
  )
}
