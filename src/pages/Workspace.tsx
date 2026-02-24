import { useState } from 'react'
import { Button, Card } from '@/components'
import { VideoDropZone, VideoPreview, ExtractionProgress } from '@/components/video'
import { useVideoImportStore } from '@/stores/videoImportStore'
import { useFrameExtractionStore } from '@/stores/frameExtractionStore'
import { Link } from 'react-router-dom'

export function WorkspacePage() {
  const [extractionStarted, setExtractionStarted] = useState(false)
  const file = useVideoImportStore((state) => state.file)
  const startExtraction = useFrameExtractionStore((state) => state.startExtraction)
  const pauseExtraction = useFrameExtractionStore((state) => state.pauseExtraction)
  const resumeExtraction = useFrameExtractionStore((state) => state.resumeExtraction)
  const cancelExtraction = useFrameExtractionStore((state) => state.cancelExtraction)

  const handleFileSelected = (file: File) => {
    console.log('Video selected:', file.name)
  }

  const handleStartExtraction = async () => {
    if (!file) return
    
    setExtractionStarted(true)
    await startExtraction(file.path, {
      fps: 1,
      outputFormat: 'png',
      quality: 95,
    })
  }

  const handleCancel = () => {
    cancelExtraction()
    setExtractionStarted(false)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="flat" size="sm" as={Link} to="/">
              ← Back
            </Button>
            <h1 className="text-3xl font-bold">Workspace</h1>
          </div>
          <p className="text-muted-foreground">
            Import videos and extract frames
          </p>
        </header>

        {/* Main content */}
        <div className="space-y-6">
          {/* Video Import Section */}
          {!file ? (
            <VideoDropZone onFileSelected={handleFileSelected} />
          ) : (
            <VideoPreview onRemove={() => setExtractionStarted(false)} />
          )}

          {/* Extraction Controls */}
          {file && !extractionStarted && (
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
          {extractionStarted && (
            <ExtractionProgress
              onCancel={handleCancel}
              onPause={pauseExtraction}
              onResume={resumeExtraction}
            />
          )}
        </div>
      </div>
    </div>
  )
}
