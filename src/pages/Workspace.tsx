import { useState, useEffect } from 'react'
import { Button, Card } from '@/components'
import { VideoDropZone, VideoPreview, ExtractionProgress } from '@/components/video'
import { FrameGallery } from '@/components/frames'
import { useVideoImportStore } from '@/stores/videoImportStore'
import { useFrameExtractionStore } from '@/stores/frameExtractionStore'
import { useFrameGalleryStore } from '@/stores/frameGalleryStore'
import { Link } from 'react-router-dom'

export function WorkspacePage() {
  const [showGallery, setShowGallery] = useState(false)
  const file = useVideoImportStore((state) => state.file)
  const isExtracting = useFrameExtractionStore((state) => state.isExtracting)
  const extractionComplete = useFrameExtractionStore((state) => 
    state.progress.status === 'completed'
  )
  
  const startExtraction = useFrameExtractionStore((state) => state.startExtraction)
  const pauseExtraction = useFrameExtractionStore((state) => state.pauseExtraction)
  const resumeExtraction = useFrameExtractionStore((state) => state.resumeExtraction)
  const cancelExtraction = useFrameExtractionStore((state) => state.cancelExtraction)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only if gallery is visible
      if (!showGallery) return
      
      const navigateFrames = useFrameGalleryStore.getState().navigateFrames
      
      if (e.key === 'ArrowLeft') {
        navigateFrames('prev')
      } else if (e.key === 'ArrowRight') {
        navigateFrames('next')
      } else if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        useFrameGalleryStore.getState().selectAllFrames()
      } else if (e.key === 'Escape') {
        useFrameGalleryStore.getState().clearSelection()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showGallery])

  const handleFileSelected = (file: File) => {
    console.log('Video selected:', file.name)
  }

  const handleStartExtraction = async () => {
    if (!file) return
    
    setShowGallery(true)
    await startExtraction(file.path, {
      fps: 1,
      outputFormat: 'png',
      quality: 95,
    })
  }

  const handleCancel = () => {
    cancelExtraction()
    setShowGallery(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="flat" size="sm" as={Link} to="/">
              ← Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Workspace</h1>
              <p className="text-sm text-muted-foreground">
                Import videos and extract frames
              </p>
            </div>
          </div>

          {/* Keyboard shortcuts hint */}
          {showGallery && (
            <div className="text-sm text-muted-foreground">
              <kbd className="px-2 py-1 bg-secondary rounded text-xs">←</kbd>{' '}
              <kbd className="px-2 py-1 bg-secondary rounded text-xs">→</kbd>{' '}
              Navigate •{' '}
              <kbd className="px-2 py-1 bg-secondary rounded text-xs">Ctrl+A</kbd>{' '}
              Select All
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {!showGallery ? (
            /* Import & Extraction View */
            <div className="space-y-6">
              {/* Video Import */}
              {!file ? (
                <VideoDropZone onFileSelected={handleFileSelected} />
              ) : (
                <VideoPreview onRemove={() => setShowGallery(false)} />
              )}

              {/* Extraction Controls */}
              {file && !isExtracting && (
                <Card className="p-6" isHoverable>
                  <h3 className="font-semibold text-lg mb-4">Extraction Settings</h3>
                  
                  <div className="space-y-4">
                    {/* FPS Selection */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Frames per second
                      </label>
                      <div className="flex gap-2">
                        {[0.5, 1, 2, 5, 10].map((fps) => (
                          <Button
                            key={fps}
                            variant={fps === 1 ? 'solid' : 'bordered'}
                            size="sm"
                          >
                            {fps} FPS
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Higher FPS = more frames, larger file size
                      </p>
                    </div>

                    {/* Output Format */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Output format
                      </label>
                      <div className="flex gap-2">
                        {['PNG', 'JPEG', 'WebP'].map((format) => (
                          <Button
                            key={format}
                            variant={format === 'PNG' ? 'solid' : 'bordered'}
                            size="sm"
                          >
                            {format}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG = Best quality, JPEG = Smaller size, WebP = Web optimized
                      </p>
                    </div>

                    {/* Start button */}
                    <div className="pt-4">
                      <Button 
                        size="lg" 
                        color="primary"
                        onClick={handleStartExtraction}
                        className="w-full"
                      >
                        🎬 Start Extraction
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Extraction Progress */}
              {isExtracting && (
                <ExtractionProgress
                  onCancel={handleCancel}
                  onPause={pauseExtraction}
                  onResume={resumeExtraction}
                />
              )}

              {/* Show gallery when complete */}
              {extractionComplete && (
                <div className="text-center py-8">
                  <h3 className="text-xl font-semibold mb-4">Extraction Complete!</h3>
                  <Button 
                    size="lg" 
                    color="primary"
                    onClick={() => setShowGallery(true)}
                  >
                    View Frames →
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Gallery View */
            <FrameGallery />
          )}
        </div>
      </main>
    </div>
  )
}
