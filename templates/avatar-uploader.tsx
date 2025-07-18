import type React from "react"
import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Upload, X, RotateCcw, RotateCw, ZoomIn, ZoomOut, FlipVertical2Icon as Flip2, Move, Crop } from "lucide-react"

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

interface AvatarUploaderRef {
  getImageData: () => string | null
  setImageData: (dataUrl: string) => void
  clearImage: () => void
}

interface AvatarUploaderProps {
  size?: number
  className?: string
  onImageChange?: (dataUrl: string | null) => void
}

const AvatarUploader = forwardRef<AvatarUploaderRef, AvatarUploaderProps>(
  ({ size = 120, className = "", onImageChange }, ref) => {
    const [image, setImage] = useState<string | null>(null)
    const [isHovered, setIsHovered] = useState(false)
    const [showCropDialog, setShowCropDialog] = useState(false)
    const [tempImage, setTempImage] = useState<string | null>(null)
    const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [imageScale, setImageScale] = useState(1)
    const [imageRotation, setImageRotation] = useState(0)
    const [imageFlipped, setImageFlipped] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const cropCanvasRef = useRef<HTMLCanvasElement>(null)

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      getImageData: () => image,
      setImageData: (dataUrl: string) => {
        setImage(dataUrl)
        onImageChange?.(dataUrl)
      },
      clearImage: () => {
        setImage(null)
        onImageChange?.(null)
      },
    }))

    const handleFileSelect = useCallback((file: File) => {
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setTempImage(result)
          setShowCropDialog(true)
          resetCropSettings()
        }
        reader.readAsDataURL(file)
      }
    }, [])

    const handleUpload = () => {
      fileInputRef.current?.click()
    }

    const handlePaste = () => {
      // Create a hidden contenteditable div to capture paste
      const pasteDiv = document.createElement("div")
      pasteDiv.contentEditable = "true"
      pasteDiv.style.position = "fixed"
      pasteDiv.style.left = "-9999px"
      pasteDiv.style.opacity = "0"
      pasteDiv.style.pointerEvents = "none"
      document.body.appendChild(pasteDiv)

      // Focus the div
      pasteDiv.focus()

      // Listen for paste event
      const handlePasteEvent = (e: ClipboardEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (e.clipboardData) {
          const items = Array.from(e.clipboardData.items)
          const imageItem = items.find((item) => item.type.startsWith("image/"))

          if (imageItem) {
            const file = imageItem.getAsFile()
            if (file) {
              handleFileSelect(file)
            }
          }
        }

        // Clean up
        document.body.removeChild(pasteDiv)
        pasteDiv.removeEventListener("paste", handlePasteEvent)
      }

      pasteDiv.addEventListener("paste", handlePasteEvent)

      // Trigger paste programmatically
      setTimeout(() => {
        document.execCommand("paste")

        // Clean up after a delay if nothing happened
        setTimeout(() => {
          if (document.body.contains(pasteDiv)) {
            document.body.removeChild(pasteDiv)
            pasteDiv.removeEventListener("paste", handlePasteEvent)
          }
        }, 100)
      }, 10)
    }

    const resetCropSettings = () => {
      setImageScale(1)
      setImageRotation(0)
      setImageFlipped(false)
      setCropArea({ x: 0, y: 0, width: 200, height: 200 })
    }

    const handleCrop = () => {
      if (!tempImage || !cropCanvasRef.current) return

      const canvas = cropCanvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const img = new Image()
      img.onload = () => {
        // Set canvas size to crop area
        canvas.width = cropArea.width
        canvas.height = cropArea.height

        // Apply transformations
        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.scale(imageFlipped ? -1 : 1, 1)
        ctx.rotate((imageRotation * Math.PI) / 180)
        ctx.scale(imageScale, imageScale)

        // Draw the cropped portion
        const sourceX = cropArea.x / imageScale
        const sourceY = cropArea.y / imageScale
        const sourceWidth = cropArea.width / imageScale
        const sourceHeight = cropArea.height / imageScale

        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          -canvas.width / 2,
          -canvas.height / 2,
          canvas.width,
          canvas.height,
        )
        ctx.restore()

        // Convert to circular avatar
        const finalCanvas = document.createElement("canvas")
        const finalCtx = finalCanvas.getContext("2d")
        if (!finalCtx) return

        finalCanvas.width = size
        finalCanvas.height = size

        // Create circular clipping path
        finalCtx.beginPath()
        finalCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
        finalCtx.clip()

        // Draw the cropped image scaled to avatar size
        finalCtx.drawImage(canvas, 0, 0, size, size)

        const croppedDataUrl = finalCanvas.toDataURL("image/png")
        setImage(croppedDataUrl)
        onImageChange?.(croppedDataUrl)
        setShowCropDialog(false)
        setTempImage(null)
      }
      img.src = tempImage
    }

    const handleMouseDown = (e: React.MouseEvent) => {
      if (!showCropDialog) return
      setIsDragging(true)
      setDragStart({ x: e.clientX - cropArea.x, y: e.clientY - cropArea.y })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return
      setCropArea((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    return (
      <>
        <div
          className={`relative inline-block cursor-pointer ${className}`}
          style={{ width: size, height: size }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Avatar Display */}
          <div
            className="w-full h-full rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300 flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            {image ? (
              <img src={image || "/placeholder.svg"} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400 text-2xl">👤</div>
            )}
          </div>

          {/* Hover Overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="flex flex-col gap-2">
                <Button size="sm" variant="secondary" onClick={handleUpload} className="text-xs px-3 py-1">
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </Button>
                <Button size="sm" variant="secondary" onClick={handlePaste} className="text-xs px-3 py-1">
                  Paste
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileSelect(file)
          }}
          className="hidden"
        />

        {/* Crop Dialog */}
        <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
          <DialogContent className="max-w-4xl w-full h-[80vh] bg-black text-white border-gray-700">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <div></div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCropDialog(false)}
                  className="text-white hover:bg-gray-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>

              {/* Crop Area */}
              <div
                className="flex-1 relative overflow-hidden flex items-center justify-center"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {tempImage && (
                  <>
                    <img
                      src={tempImage || "/placeholder.svg"}
                      alt="Crop preview"
                      className="max-w-full max-h-full object-contain"
                      style={{
                        transform: `scale(${imageScale}) rotate(${imageRotation}deg) scaleX(${imageFlipped ? -1 : 1})`,
                      }}
                    />
                    {/* Crop Frame */}
                    <div
                      className="absolute border-2 border-dashed border-white cursor-move"
                      style={{
                        left: cropArea.x,
                        top: cropArea.y,
                        width: cropArea.width,
                        height: cropArea.height,
                      }}
                      onMouseDown={handleMouseDown}
                    >
                      {/* Corner Handles */}
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-white"></div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white"></div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white"></div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white"></div>
                    </div>
                  </>
                )}
              </div>

              {/* Toolbar */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">ROTATE</span>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700 p-2">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700 p-2">
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">ZOOM</span>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700 p-2">
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700 p-2">
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700 p-2">
                      <Move className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">FLIP</span>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700 p-2">
                      <Flip2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700 p-2">
                      <Move className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700 p-2">
                      <Move className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button onClick={handleCrop} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
                    <Crop className="w-4 h-4 mr-2" />
                    Crop
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Hidden Canvas for Processing */}
        <canvas ref={canvasRef} className="hidden" />
        <canvas ref={cropCanvasRef} className="hidden" />
      </>
    )
  },
)

AvatarUploader.displayName = "AvatarUploader"

export default AvatarUploader
export type { AvatarUploaderRef }
