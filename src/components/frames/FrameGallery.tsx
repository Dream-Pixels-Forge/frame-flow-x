import { useState, useEffect } from 'react'
import { FrameGrid, FramePreviewModal, FrameGalleryToolbar, TimelineScrubber } from '@/components/frames'
import { useFrameExtractionStore } from '@/stores/frameExtractionStore'
import { useFrameGalleryStore } from '@/stores/frameGalleryStore'
import { ExtractedFrame } from '@/utils/frameExtractor'

export function FrameGallery() {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(-1)
  
  const viewMode = useFrameGalleryStore((state) => state.viewMode)
  const frames = useFrameGalleryStore((state) => state.frames)
  
  const extractionFrames = useFrameExtractionStore((state) => state.frames)
  const setFrames = useFrameGalleryStore((state) => state.setFrames)

  // Sync frames from extraction store
  useEffect(() => {
    if (extractionFrames.length > 0) {
      setFrames(extractionFrames)
    }
  }, [extractionFrames, setFrames])

  const handleFrameClick = (_frame: ExtractedFrame, index: number) => {
    setCurrentFrameIndex(index)
    setPreviewOpen(true)
  }

  const handleClosePreview = () => {
    setPreviewOpen(false)
  }

  const currentFrame = currentFrameIndex >= 0 && currentFrameIndex < frames.length 
    ? frames[currentFrameIndex] 
    : null

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <FrameGalleryToolbar />

      {/* Main content */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'grid' && (
          <FrameGrid onFrameClick={handleFrameClick} />
        )}

        {viewMode === 'list' && (
          <div className="text-center py-20 text-muted-foreground">
            List view coming soon
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="space-y-6">
            <TimelineScrubber />
            <FrameGrid onFrameClick={handleFrameClick} />
          </div>
        )}
      </div>

      {/* Preview modal */}
      <FramePreviewModal
        isOpen={previewOpen}
        onClose={handleClosePreview}
        frame={currentFrame}
        frameIndex={currentFrameIndex}
      />

      {/* Frame count footer */}
      {frames.length > 0 && (
        <div className="border-t p-3 text-center text-sm text-muted-foreground">
          {frames.length} frames extracted
        </div>
      )}
    </div>
  )
}
