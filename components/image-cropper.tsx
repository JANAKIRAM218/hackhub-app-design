"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { RotateCcw, RotateCw, ZoomIn, Move, Crop } from "lucide-react"
import { cn } from "@/lib/utils"

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

interface ImageCropperProps {
  imageSrc: string
  onCropComplete: (croppedImageBlob: Blob) => void
  onCancel: () => void
  aspectRatio?: number // width/height ratio, default 1 for square
  className?: string
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel, aspectRatio = 1, className }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string>("")
  const [containerSize, setContainerSize] = useState({ width: 400, height: 400 })

  // Load image
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImage(img)

      // Calculate initial crop area
      const minDimension = Math.min(img.width, img.height)
      const cropSize = Math.min(minDimension, 200)
      const cropWidth = aspectRatio >= 1 ? cropSize : cropSize * aspectRatio
      const cropHeight = aspectRatio >= 1 ? cropSize / aspectRatio : cropSize

      setCropArea({
        x: (containerSize.width - cropWidth) / 2,
        y: (containerSize.height - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
      })

      // Center the image
      setPosition({
        x: (containerSize.width - img.width) / 2,
        y: (containerSize.height - img.height) / 2,
      })
    }
    img.src = imageSrc
  }, [imageSrc, aspectRatio, containerSize])

  // Update container size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({ width: rect.width, height: rect.height })
      }
    }

    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  // Draw the image and crop overlay
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx || !image) return

    // Set canvas size
    canvas.width = containerSize.width
    canvas.height = containerSize.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save context
    ctx.save()

    // Apply transformations
    ctx.translate(position.x + image.width / 2, position.y + image.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(scale, scale)

    // Draw image
    ctx.drawImage(image, -image.width / 2, -image.height / 2)

    // Restore context
    ctx.restore()

    // Draw crop overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Clear crop area
    ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)

    // Draw crop border
    ctx.strokeStyle = "#00ff9d"
    ctx.lineWidth = 2
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)

    // Draw grid lines
    ctx.strokeStyle = "rgba(0, 255, 157, 0.3)"
    ctx.lineWidth = 1

    // Vertical lines
    ctx.beginPath()
    ctx.moveTo(cropArea.x + cropArea.width / 3, cropArea.y)
    ctx.lineTo(cropArea.x + cropArea.width / 3, cropArea.y + cropArea.height)
    ctx.moveTo(cropArea.x + (cropArea.width * 2) / 3, cropArea.y)
    ctx.lineTo(cropArea.x + (cropArea.width * 2) / 3, cropArea.y + cropArea.height)
    ctx.stroke()

    // Horizontal lines
    ctx.beginPath()
    ctx.moveTo(cropArea.x, cropArea.y + cropArea.height / 3)
    ctx.lineTo(cropArea.x + cropArea.width, cropArea.y + cropArea.height / 3)
    ctx.moveTo(cropArea.x, cropArea.y + (cropArea.height * 2) / 3)
    ctx.lineTo(cropArea.x + cropArea.width, cropArea.y + (cropArea.height * 2) / 3)
    ctx.stroke()

    // Draw resize handles
    const handleSize = 8
    const handles = [
      { x: cropArea.x - handleSize / 2, y: cropArea.y - handleSize / 2, cursor: "nw-resize" },
      { x: cropArea.x + cropArea.width - handleSize / 2, y: cropArea.y - handleSize / 2, cursor: "ne-resize" },
      { x: cropArea.x - handleSize / 2, y: cropArea.y + cropArea.height - handleSize / 2, cursor: "sw-resize" },
      {
        x: cropArea.x + cropArea.width - handleSize / 2,
        y: cropArea.y + cropArea.height - handleSize / 2,
        cursor: "se-resize",
      },
    ]

    ctx.fillStyle = "#00ff9d"
    handles.forEach((handle) => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize)
    })
  }, [image, position, scale, rotation, cropArea, containerSize])

  // Redraw canvas when dependencies change
  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Check if clicking on resize handles
      const handleSize = 8
      const handles = [
        { x: cropArea.x - handleSize / 2, y: cropArea.y - handleSize / 2, type: "nw" },
        { x: cropArea.x + cropArea.width - handleSize / 2, y: cropArea.y - handleSize / 2, type: "ne" },
        { x: cropArea.x - handleSize / 2, y: cropArea.y + cropArea.height - handleSize / 2, type: "sw" },
        {
          x: cropArea.x + cropArea.width - handleSize / 2,
          y: cropArea.y + cropArea.height - handleSize / 2,
          type: "se",
        },
      ]

      for (const handle of handles) {
        if (x >= handle.x && x <= handle.x + handleSize && y >= handle.y && y <= handle.y + handleSize) {
          setIsResizing(true)
          setResizeHandle(handle.type)
          setDragStart({ x, y })
          return
        }
      }

      // Check if clicking inside crop area (for moving)
      if (x >= cropArea.x && x <= cropArea.x + cropArea.width && y >= cropArea.y && y <= cropArea.y + cropArea.height) {
        setIsDragging(true)
        setDragStart({ x: x - cropArea.x, y: y - cropArea.y })
      }
    },
    [cropArea],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (isResizing) {
        const deltaX = x - dragStart.x
        const deltaY = y - dragStart.y

        setCropArea((prev) => {
          const newArea = { ...prev }

          switch (resizeHandle) {
            case "nw":
              newArea.x = Math.max(0, prev.x + deltaX)
              newArea.y = Math.max(0, prev.y + deltaY)
              newArea.width = Math.max(50, prev.width - deltaX)
              newArea.height = Math.max(50, prev.height - deltaY)
              break
            case "ne":
              newArea.y = Math.max(0, prev.y + deltaY)
              newArea.width = Math.max(50, prev.width + deltaX)
              newArea.height = Math.max(50, prev.height - deltaY)
              break
            case "sw":
              newArea.x = Math.max(0, prev.x + deltaX)
              newArea.width = Math.max(50, prev.width - deltaX)
              newArea.height = Math.max(50, prev.height + deltaY)
              break
            case "se":
              newArea.width = Math.max(50, prev.width + deltaX)
              newArea.height = Math.max(50, prev.height + deltaY)
              break
          }

          // Maintain aspect ratio
          if (aspectRatio !== 1) {
            if (newArea.width / newArea.height > aspectRatio) {
              newArea.width = newArea.height * aspectRatio
            } else {
              newArea.height = newArea.width / aspectRatio
            }
          } else {
            // For square crops, maintain square aspect ratio
            const size = Math.min(newArea.width, newArea.height)
            newArea.width = size
            newArea.height = size
          }

          // Keep within bounds
          newArea.x = Math.max(0, Math.min(containerSize.width - newArea.width, newArea.x))
          newArea.y = Math.max(0, Math.min(containerSize.height - newArea.height, newArea.y))

          return newArea
        })

        setDragStart({ x, y })
      } else if (isDragging) {
        setCropArea((prev) => ({
          ...prev,
          x: Math.max(0, Math.min(containerSize.width - prev.width, x - dragStart.x)),
          y: Math.max(0, Math.min(containerSize.height - prev.height, y - dragStart.y)),
        }))
      }
    },
    [isDragging, isResizing, dragStart, resizeHandle, aspectRatio, containerSize],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle("")
  }, [])

  // Crop the image
  const cropImage = useCallback(async () => {
    if (!image || !canvasRef.current) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set output size (you can adjust this for different output resolutions)
    const outputSize = 300
    canvas.width = outputSize
    canvas.height = aspectRatio >= 1 ? outputSize / aspectRatio : outputSize * aspectRatio

    // Calculate the source rectangle in the original image coordinates
    const scaleX = image.width / (containerSize.width * scale)
    const scaleY = image.height / (containerSize.height * scale)

    const sourceX = (cropArea.x - position.x) * scaleX
    const sourceY = (cropArea.y - position.y) * scaleY
    const sourceWidth = cropArea.width * scaleX
    const sourceHeight = cropArea.height * scaleY

    // Apply rotation if needed
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-canvas.width / 2, -canvas.height / 2)
    }

    // Draw the cropped portion
    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob)
        }
      },
      "image/jpeg",
      0.9,
    )
  }, [image, cropArea, position, scale, rotation, aspectRatio, containerSize, onCropComplete])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full h-96 border border-border rounded-lg overflow-hidden bg-black/10"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Zoom Control */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <ZoomIn className="h-4 w-4" />
            Zoom: {Math.round(scale * 100)}%
          </Label>
          <Slider
            value={[scale]}
            onValueChange={(value) => setScale(value[0])}
            min={0.1}
            max={3}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Rotation Control */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <RotateCw className="h-4 w-4" />
            Rotation: {rotation}°
          </Label>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setRotation((prev) => prev - 90)}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Slider
              value={[rotation]}
              onValueChange={(value) => setRotation(value[0])}
              min={-180}
              max={180}
              step={1}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={() => setRotation((prev) => prev + 90)}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Position Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">X Position</Label>
            <Slider
              value={[position.x]}
              onValueChange={(value) => setPosition((prev) => ({ ...prev, x: value[0] }))}
              min={-image?.width || 0}
              max={containerSize.width}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Y Position</Label>
            <Slider
              value={[position.y]}
              onValueChange={(value) => setPosition((prev) => ({ ...prev, y: value[0] }))}
              min={-image?.height || 0}
              max={containerSize.height}
              step={1}
            />
          </div>
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={() => {
            setScale(1)
            setRotation(0)
            if (image) {
              setPosition({
                x: (containerSize.width - image.width) / 2,
                y: (containerSize.height - image.height) / 2,
              })
            }
          }}
          className="w-full"
        >
          <Move className="mr-2 h-4 w-4" />
          Reset Position & Zoom
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={cropImage} className="flex-1 glow">
          <Crop className="mr-2 h-4 w-4" />
          Apply Crop
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Drag the crop area to move it</p>
        <p>• Drag the corner handles to resize</p>
        <p>• Use the controls below to zoom and rotate</p>
        <p>• The grid lines help with composition</p>
      </div>
    </div>
  )
}
