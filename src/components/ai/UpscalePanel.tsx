import { useState, useEffect, useRef } from 'react'
import { Card, Button, Slider } from '@/components'
import { cn } from '@/utils'
import { useAIStore } from '@/stores/aiStore'
import { UpscaleOptions } from '@/services/aiService'

interface UpscalePanelProps {
  image: Blob | string | null
  onResult?: (result: Blob | string) => void
  className?: string
}

export function UpscalePanel({ image, onResult, className }: UpscalePanelProps) {
  const [scale, setScale] = useState<2 | 4>(2)
  const [quality, setQuality] = useState<'fast' | 'balanced' | 'quality'>('balanced')
  
  const isProcessing = useAIStore((state) => state.isProcessing)
  const progress = useAIStore((state) => state.progress)
  const result = useAIStore((state) => state.result)
  const isAvailable = useAIStore((state) => state.isAvailable)
  
  const upscale = useAIStore((state) => state.upscale)
  const cancel = useAIStore((state) => state.cancel)
  const initialize = useAIStore((state) => state.initialize)

  const resultImageRef = useRef<string | null>(null)

  // Initialize AI service on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  const handleUpscale = async () => {
    if (!image) return

    const options: UpscaleOptions = { scale, quality }
    const result = await upscale(image, options)

    if (result.success && result.data) {
      const imageUrl = result.data instanceof Blob 
        ? URL.createObjectURL(result.data)
        : result.data
      
      resultImageRef.current = imageUrl
      onResult?.(result.data)
    }
  }

  const handleCancel = () => {
    cancel()
  }

  const handleReset = () => {
    resultImageRef.current = null
    setScale(2)
    setQuality('balanced')
  }

  if (!image) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center py-8 text-muted-foreground">
          <p>Select a frame to upscale</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('p-6', className)}>
      <h3 className="font-semibold text-lg mb-4">AI Upscaling</h3>

      {/* Service status */}
      {!isAvailable && (
        <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <p className="text-sm text-warning">
            ⚠️ AI service not configured. Using simulated upscaling.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Add VITE_REPLICATE_API_KEY to .env for real AI upscaling
          </p>
        </div>
      )}

      {/* Settings */}
      <div className="space-y-4 mb-6">
        {/* Scale selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Upscale Factor
          </label>
          <div className="flex gap-2">
            <Button
              variant={scale === 2 ? 'solid' : 'bordered'}
              size="sm"
              onClick={() => setScale(2)}
              disabled={isProcessing}
            >
              2x
            </Button>
            <Button
              variant={scale === 4 ? 'solid' : 'bordered'}
              size="sm"
              onClick={() => setScale(4)}
              disabled={isProcessing}
            >
              4x
            </Button>
          </div>
        </div>

        {/* Quality selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Quality: {quality.charAt(0).toUpperCase() + quality.slice(1)}
          </label>
          <div className="flex gap-2">
            {(['fast', 'balanced', 'quality'] as const).map((q) => (
              <Button
                key={q}
                variant={quality === q ? 'solid' : 'bordered'}
                size="sm"
                onClick={() => setQuality(q)}
                disabled={isProcessing}
              >
                {q.charAt(0).toUpperCase() + q.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress */}
      {isProcessing && (
        <div className="mb-6 space-y-3">
          <Slider
            minValue={0}
            maxValue={100}
            value={progress.percentage}
            disabled
            className="w-full"
          />
          <div className="flex justify-between text-sm">
            <span>{progress.message}</span>
            <span>{progress.percentage.toFixed(0)}%</span>
          </div>
        </div>
      )}

      {/* Result preview */}
      {result && result.success && result.data && (
        <div className="mb-6">
          <div className="aspect-video bg-secondary rounded-lg overflow-hidden mb-3">
            {result.data instanceof Blob ? (
              <img
                src={URL.createObjectURL(result.data)}
                alt="Upscaled"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={result.data}
                alt="Upscaled"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <p className="text-sm text-success text-center">
            ✅ Upscaling complete!
          </p>
          {result.metadata && (
            <p className="text-xs text-muted-foreground text-center mt-1">
              {result.metadata.originalSize?.width}x{result.metadata.originalSize?.height}
              {' → '}
              {result.metadata.newSize?.width}x{result.metadata.newSize?.height}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!isProcessing ? (
          <>
            <Button
              color="primary"
              onClick={handleUpscale}
              className="flex-1"
              disabled={!image}
            >
              ✨ Upscale {scale}x
            </Button>
            {result && (
              <Button variant="flat" onClick={handleReset}>
                Reset
              </Button>
            )}
          </>
        ) : (
          <Button color="danger" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
        )}
      </div>
    </Card>
  )
}
