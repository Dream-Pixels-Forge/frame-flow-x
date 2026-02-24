import { useState } from 'react'
import { Modal, Button, Badge } from '@/components'
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

  const handlePrev = () => {
    navigateFrames('prev')
  }

  const handleNext = () => {
    navigateFrames('next')
  }

  // Keyboard navigation
  useState(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  if (!frame) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      isDismissable
      isKeyboardDismissDisabled={false}
    >
      <div className="flex flex-col h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-lg">
              Frame #{frameIndex + 1}
            </h3>
            <Badge color="default" size="sm">
              {frame.width} x {frame.height}
            </Badge>
            <Badge color="default" size="sm">
              {(frame.timestamp / 1000).toFixed(3)}s
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="flat"
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
            <Button variant="flat" size="sm" onClick={onClose}>
              ✕ Close
            </Button>
          </div>
        </div>

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
            <div>
              <label className="text-sm font-medium mb-2 block">Info</label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frame #</span>
                  <span>{frameIndex + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timestamp</span>
                  <span>{(frame.timestamp / 1000).toFixed(3)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolution</span>
                  <span>{frame.width} x {frame.height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format</span>
                  <span className="uppercase">{frame.format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size</span>
                  <span>{(frame.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-auto">
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handlePrev}
                  isDisabled={frameIndex === 0}
                >
                  ← Prev
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleNext}
                  isDisabled={frameIndex === frames.length - 1}
                >
                  Next →
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {frameIndex + 1} of {frames.length} frames
              </p>
            </div>
          </div>
        </div>

        {/* Footer with navigation hints */}
        <div className="p-4 border-t text-center text-sm text-muted-foreground">
          Use ← → arrow keys to navigate • ESC to close
        </div>
      </div>
    </Modal>
  )
}
