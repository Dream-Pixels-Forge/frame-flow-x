import { useState, useEffect, useCallback } from 'react'
import { FrameGrid, FramePreviewModal, FrameGalleryToolbar, TimelineScrubber } from '@/components/frames'
import { useFrameExtractionStore } from '@/stores/frameExtractionStore'
import { useFrameGalleryStore } from '@/stores/frameGalleryStore'
import { ExtractedFrame } from '@/utils/frameExtractor'

export function FrameGallery() {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(-1)

  const viewMode = useFrameGalleryStore((state) => state.viewMode)
  const frames = useFrameGalleryStore((state) => state.frames)
  const selectedFrameIds = useFrameGalleryStore((state) => state.selectedFrameIds)

  const extractionFrames = useFrameExtractionStore((state) => state.frames)
  const setFrames = useFrameGalleryStore((state) => state.setFrames)
  const navigateFrames = useFrameGalleryStore((state) => state.navigateFrames)
  const selectAllFrames = useFrameGalleryStore((state) => state.selectAllFrames)
  const clearSelection = useFrameGalleryStore((state) => state.clearSelection)

  // Sync frames from extraction store
  useEffect(() => {
    if (extractionFrames.length > 0) {
      setFrames(extractionFrames)
    }
  }, [extractionFrames, setFrames])

  const handleFrameClick = useCallback((_frame: ExtractedFrame, index: number) => {
    setCurrentFrameIndex(index)
    setPreviewOpen(true)
  }, [])

  const handleClosePreview = useCallback(() => {
    setPreviewOpen(false)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Navigation shortcuts
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigateFrames('next')
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateFrames('prev')
      }
      // Selection shortcuts
      else if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        selectAllFrames()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        clearSelection()
        if (previewOpen) {
          handleClosePreview()
        }
      }
      // View shortcuts
      else if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        // Could toggle grid view
      } else if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        // Focus search input (would need ref)
      }
      // Delete shortcut
      else if (e.key === 'Delete' && selectedFrameIds.length > 0) {
        e.preventDefault()
        clearSelection()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [frames.length, previewOpen, handleClosePreview, navigateFrames, selectAllFrames, clearSelection, selectedFrameIds.length])

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
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-2">List View</h3>
            <p>List view coming soon</p>
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
          <div className="flex justify-between items-center">
            <span>{frames.length} frames extracted</span>
            <span className="text-xs">
              Keyboard: ← → Navigate • Ctrl+A Select All • Esc Deselect
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
