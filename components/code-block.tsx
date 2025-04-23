"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, Code2 } from "lucide-react"

interface CodeBlockProps {
  language: string
  code: string
  showLineNumbers?: boolean
}

export function CodeBlock({ language, code, showLineNumbers = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const codeLines = code.split("\n")

  return (
    <div className="relative rounded-md overflow-hidden border border-border/40 bg-muted/30">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-neon-green" />
          <span className="text-xs font-mono text-muted-foreground">{language}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <div className="p-4 overflow-x-auto font-mono text-sm">
        <pre className="whitespace-pre">
          {showLineNumbers ? (
            <code>
              {codeLines.map((line, i) => (
                <div key={i} className="table-row">
                  <span className="table-cell pr-4 text-right text-muted-foreground select-none">{i + 1}</span>
                  <span className="table-cell">{line}</span>
                </div>
              ))}
            </code>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </div>
  )
}
