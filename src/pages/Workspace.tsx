import { useState, useEffect } from 'react'
import { Button, Card } from '@/components'
import { VideoDropZone, VideoPreview, ExtractionProgress } from '@/components/video'
import { FrameGallery } from '@/components/frames'
import { UpscalePanel, EnhancementPanel, BeforeAfterComparison } from '@/components/ai'
import { 
  ArrowLeftIcon, 
  ArrowRightIcon,
  SparklesIcon, 
  PaletteIcon, 
  SearchIcon,
  CameraIcon,
  RefreshIcon,
  DownloadIcon,
} from '@/components/icons'
import { useVideoImportStore } from '@/stores/videoImportStore'
import { useFrameExtractionStore } from '@/stores/frameExtractionStore'
import { useFrameGalleryStore } from '@/stores/frameGalleryStore'
import { useAIStore } from '@/stores/aiStore'
import { ExtractedFrame } from '@/utils/frameExtractor'
import { Link } from 'react-router-dom'

type WorkspaceTab = 'gallery' | 'upscale' | 'enhance' | 'compare'

export function WorkspacePage() {
  const [showGallery, setShowGallery] = useState(false)
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('gallery')
  const [selectedFrame, setSelectedFrame] = useState<ExtractedFrame | null>(null)
  const [originalFrame, setOriginalFrame] = useState<Blob | null>(null)
  const [processedFrame, setProcessedFrame] = useState<Blob | null>(null)
  
  const file = useVideoImportStore((state) => state.file)
  const isExtracting = useFrameExtractionStore((state) => state.isExtracting)
  const extractionComplete = useFrameExtractionStore((state) => 
    state.progress.status === 'completed'
  )
  
  const frames = useFrameGalleryStore((state) => state.frames)
  const selectedFrameIds = useFrameGalleryStore((state) => state.selectedFrameIds)
  
  const startExtraction = useFrameExtractionStore((state) => state.startExtraction)
  const pauseExtraction = useFrameExtractionStore((state) => state.pauseExtraction)
  const resumeExtraction = useFrameExtractionStore((state) => state.resumeExtraction)
  const cancelExtraction = useFrameExtractionStore((state) => state.cancelExtraction)

  // Initialize AI service
  const initializeAI = useAIStore((state) => state.initialize)
  useEffect(() => {
    initializeAI()
  }, [initializeAI])

  // Update selected frame when gallery selection changes
  useEffect(() => {
    if (selectedFrameIds.length > 0 && frames.length > 0) {
      const selectedId = selectedFrameIds[0]
      const frame = frames.find(f => f.id === selectedId)
      if (frame) {
        setSelectedFrame(frame)
        // Store original frame data for comparison
        if (!originalFrame && frame.data) {
          setOriginalFrame(frame.data)
        }
      }
    }
  }, [selectedFrameIds, frames])

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

  const handleUpscaleResult = (result: Blob | string) => {
    const blob = result instanceof Blob ? result : new Blob([result])
    setProcessedFrame(blob)
    setActiveTab('compare')
  }

  const handleEnhanceResult = (result: Blob | string) => {
    const blob = result instanceof Blob ? result : new Blob([result])
    setProcessedFrame(blob)
    setActiveTab('compare')
  }

  const handleResetProcessing = () => {
    setProcessedFrame(null)
    setOriginalFrame(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="flat" size="sm" as={Link} to="/">
              <ArrowLeftIcon size={16} /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Workspace</h1>
              <p className="text-sm text-muted-foreground">
                Import videos, extract frames, and apply AI enhancements
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
                        <SparklesIcon size={18} className="mr-2" /> Start Extraction
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
                    View Frames <ArrowRightIcon size={18} className="ml-2" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Gallery + AI Tools View */
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex gap-2 border-b pb-2">
                <Button
                  variant={activeTab === 'gallery' ? 'solid' : 'bordered'}
                  size="sm"
                  onClick={() => setActiveTab('gallery')}
                >
                  <CameraIcon size={16} className="mr-2" /> Gallery
                </Button>
                <Button
                  variant={activeTab === 'upscale' ? 'solid' : 'bordered'}
                  size="sm"
                  onClick={() => setActiveTab('upscale')}
                >
                  <SparklesIcon size={16} className="mr-2" /> AI Upscale
                </Button>
                <Button
                  variant={activeTab === 'enhance' ? 'solid' : 'bordered'}
                  size="sm"
                  onClick={() => setActiveTab('enhance')}
                >
                  <PaletteIcon size={16} className="mr-2" /> Enhance
                </Button>
                <Button
                  variant={activeTab === 'compare' ? 'solid' : 'bordered'}
                  size="sm"
                  onClick={() => setActiveTab('compare')}
                  disabled={!processedFrame}
                >
                  <SearchIcon size={16} className="mr-2" /> Compare
                </Button>
              </div>

              {/* Tab Content */}
              {activeTab === 'gallery' && (
                <div className="h-[70vh]">
                  <FrameGallery />
                </div>
              )}

              {activeTab === 'upscale' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <UpscalePanel 
                    image={selectedFrame?.data || null}
                    onResult={handleUpscaleResult}
                  />
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Instructions</h3>
                    <ol className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">1.</span>
                        Select a frame from the gallery
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">2.</span>
                        Choose upscale factor (2x or 4x)
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">3.</span>
                        Select quality preset
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">4.</span>
                        Click "Upscale" to process
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">5.</span>
                        View result in Compare tab
                      </li>
                    </ol>
                    {selectedFrame ? (
                      <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
                        <p className="text-sm text-success">
                          ✅ Frame #{frames.findIndex(f => f.id === selectedFrame.id) + 1} selected
                        </p>
                      </div>
                    ) : (
                      <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                        <p className="text-sm text-warning">
                          ⚠️ No frame selected. Please select a frame from the gallery.
                        </p>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {activeTab === 'enhance' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <EnhancementPanel 
                    image={selectedFrame?.data || null}
                    onResult={handleEnhanceResult}
                  />
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Enhancement Guide</h3>
                    <ol className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">1.</span>
                        Select a frame from the gallery
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">2.</span>
                        Adjust noise reduction (0-100%)
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">3.</span>
                        Adjust sharpening (0-100%)
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">4.</span>
                        Fine-tune brightness, contrast, saturation
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">5.</span>
                        Click "Apply Enhancements"
                      </li>
                    </ol>
                    {selectedFrame ? (
                      <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
                        <p className="text-sm text-success">
                          ✅ Frame #{frames.findIndex(f => f.id === selectedFrame.id) + 1} selected
                        </p>
                      </div>
                    ) : (
                      <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                        <p className="text-sm text-warning">
                          ⚠️ No frame selected. Please select a frame from the gallery.
                        </p>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {activeTab === 'compare' && processedFrame && originalFrame && (
                <div className="space-y-6">
                  <BeforeAfterComparison
                    beforeImage={originalFrame}
                    afterImage={processedFrame}
                  />
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="bordered"
                      onClick={handleResetProcessing}
                    >
                      <RefreshIcon size={16} className="mr-2" /> Reset
                    </Button>
                    <Button
                      color="primary"
                      onClick={() => {
                        // Download processed frame
                        const link = document.createElement('a')
                        link.href = URL.createObjectURL(processedFrame)
                        link.download = `frame-flow-x-processed-${Date.now()}.png`
                        link.click()
                      }}
                    >
                      <DownloadIcon size={16} className="mr-2" /> Download Result
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'compare' && !processedFrame && (
                <Card className="p-12 text-center">
                  <div className="text-6xl mb-4"><SearchIcon size={64} className="mx-auto" /></div>
                  <h3 className="text-xl font-semibold mb-2">No Processed Frame</h3>
                  <p className="text-muted-foreground mb-4">
                    Upscale or enhance a frame first to see the comparison
                  </p>
                  <Button
                    color="primary"
                    onClick={() => setActiveTab('upscale')}
                  >
                    Go to Upscale <ArrowRightIcon size={16} className="ml-2" />
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
