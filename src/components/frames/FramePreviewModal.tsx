import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Badge } from '@/components'
import { useFrameGalleryStore } from '@/stores/frameGalleryStore'
import { ExtractedFrame } from '@/utils/frameExtractor'

interface FramePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  frame: ExtractedFrame | null
  frameIndex: number
}

export function FramePreviewModal({
  isOpen,
  onClose,
  frame,
  frameIndex,
}: FramePreviewModalProps) {
  const [zoom, setZoom] = useState(100)
  const frames = useFrameGalleryStore((state) => state.frames)
  const selectedFrameIds = useFrameGalleryStore((state) => state.selectedFrameIds)
  const favoriteFrameIds = useFrameGalleryStore((state) => state.favoriteFrameIds)
  const toggleFrameSelection = useFrameGalleryStore((state) => state.toggleFrameSelection)
  const toggleFavorite = useFrameGalleryStore((state) => state.toggleFavorite)
  const navigateFrames = useFrameGalleryStore((state) => state.navigateFrames)

  const isSelected = frame ? selectedFrameIds.includes(frame.id) : false
  const isFavorite = frame ? favoriteFrameIds.includes(frame.id) : false

  const handlePrev = () => navigateFrames('prev')
  const handleNext = () => navigateFrames('next')

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      else if (e.key === 'ArrowRight') handleNext()
      else if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!frame) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0">
        <DialogHeader className="border-b p-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <DialogTitle>Frame #{frameIndex + 1}</DialogTitle>
              <Badge>{frame.width} x {frame.height}</Badge>
              <Badge variant="outline">{(frame.timestamp / 1000).toFixed(3)}s</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isFavorite ? 'solid' : 'bordered'}
                size="sm"
                onClick={() => toggleFavorite(frame.id)}
              >
                {isFavorite ? '⭐ Favorite' : '☆ Favorite'}
              </Button>
              <Button
                variant={isSelected ? 'solid' : 'bordered'}
                size="sm"
                onClick={() => toggleFrameSelection(frame.id)}
              >
                {isSelected ? '✓ Selected' : 'Select'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕ Close
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Image area */}
          <div className="flex-1 flex items-center justify-center bg-black/50 overflow-auto p-8">
            <div
              className="relative transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              {frame.data ? (
                <img
                  src={URL.createObjectURL(frame.data)}
                  alt={`Frame ${frameIndex + 1}`}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              ) : (
                <div className="w-[800px] h-[450px] bg-secondary flex items-center justify-center">
                  <span className="text-6xl">📷</span>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-64 border-l p-4 flex flex-col gap-4 bg-background">
            {/* Zoom controls */}
            <div>
              <label className="text-sm font-medium mb-2 block">Zoom</label>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="bordered"
                  onClick={() => setZoom(Math.max(50, zoom - 25))}
                >
                  −
                </Button>
                <span className="text-center flex-1">{zoom}%</span>
                <Button
                  size="sm"
                  variant="bordered"
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                >
                  +
                </Button>
              </div>
              <Button
                size="sm"
                variant="flat"
                className="w-full mt-2"
                onClick={() => setZoom(100)}
              >
                Reset Zoom
              </Button>
            </div>

            {/* Frame info */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Frame Info</h4>
              <div className="text-xs space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="text-foreground">{frame.format.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span className="text-foreground">{(frame.size / 1024).toFixed(1)} KB</span>
                </div>
                <div className="flex justify-between">
                  <span>Timestamp:</span>
                  <span className="text-foreground">{(frame.timestamp / 1000).toFixed(3)}s</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-2 mt-auto">
              <Button
                variant="bordered"
                size="sm"
                className="flex-1"
                onClick={handlePrev}
                disabled={frameIndex === 0}
              >
                ← Prev
              </Button>
              <Button
                variant="bordered"
                size="sm"
                className="flex-1"
                onClick={handleNext}
                disabled={frameIndex >= frames.length - 1}
              >
                Next →
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
