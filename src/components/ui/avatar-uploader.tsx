import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Upload, X, RotateCcw, RotateCw, ZoomIn, ZoomOut, FlipVertical2Icon as Flip2, Move, Crop } from "lucide-react"

interface AvatarUploaderProps {
  currentAvatar: string;
  onAvatarChange: (newAvatarDataUrl: string) => void;
  size?: number
  className?: string
}

export default function AvatarUploader({ currentAvatar, onAvatarChange, size = 120, className = "" }: AvatarUploaderProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [showCropDialog, setShowCropDialog] = useState(false)
    const [tempImage, setTempImage] = useState<string | null>(null)
    const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [imageScale, setImageScale] = useState(1)
    const [imageRotation, setImageRotation] = useState(0)
    const [imageFlipped, setImageFlipped] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const cropCanvasRef = useRef<HTMLCanvasElement>(null)

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
      const pasteDiv = document.createElement("div")
      pasteDiv.contentEditable = "true"
      pasteDiv.style.position = "fixed"
      pasteDiv.style.left = "-9999px"
      document.body.appendChild(pasteDiv)
      pasteDiv.focus()
      document.execCommand("paste")
      setTimeout(() => {
        const child = pasteDiv.children[0] as HTMLImageElement
        if (child && child.src) {
            handleFileSelectFromUrl(child.src)
        }
        document.body.removeChild(pasteDiv)
      }, 0)
    }
    
    const handleFileSelectFromUrl = async (url: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const file = new File([blob], "pasted-image.png", { type: blob.type });
            handleFileSelect(file);
        } catch (error) {
            console.error("Error fetching pasted image:", error);
        }
    };

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
        canvas.width = size
        canvas.height = size

        ctx.save()
        ctx.translate(size / 2, size / 2)
        ctx.rotate((imageRotation * Math.PI) / 180)
        ctx.scale(imageFlipped ? -1 : 1, 1)
        ctx.scale(imageScale, imageScale)
        
        ctx.drawImage(
          img,
          -img.width / 2,
          -img.height / 2
        )
        ctx.restore()

        const croppedDataUrl = canvas.toDataURL("image/png")
        onAvatarChange(croppedDataUrl)
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
          <div
            className="w-full h-full rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300 flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            {currentAvatar ? (
              <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400 text-2xl">👤</div>
            )}
          </div>

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

        <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
          <DialogContent className="max-w-4xl w-full h-[80vh] bg-black text-white border-gray-700">
            <div className="flex flex-col h-full">
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

              <div
                className="flex-1 relative overflow-hidden flex items-center justify-center"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {tempImage && (
                  <>
                    <img
                      src={tempImage}
                      alt="Crop preview"
                      className="max-w-full max-h-full object-contain"
                      style={{
                        transform: `scale(${imageScale}) rotate(${imageRotation}deg) scaleX(${imageFlipped ? -1 : 1})`,
                        left: cropArea.x,
                        top: cropArea.y,
                        position: 'absolute'
                      }}
                      onMouseDown={handleMouseDown}
                    />
                  </>
                )}
              </div>

              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center justify-center gap-4">
                  <Button onClick={handleCrop} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
                    <Crop className="w-4 h-4 mr-2" />
                    Crop
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <canvas ref={cropCanvasRef} className="hidden" />
      </>
    )
}
