import { useState } from 'react'
import { Card, Button, Slider } from '@/components'
import { cn } from '@/utils'
import { useAIStore } from '@/stores/aiStore'
import { EnhancementOptions } from '@/services/aiService'

interface EnhancementPanelProps {
  image: Blob | string | null
  onResult?: (result: Blob | string) => void
  className?: string
}

export function EnhancementPanel({ image, onResult, className }: EnhancementPanelProps) {
  const [options, setOptions] = useState<EnhancementOptions>({
    noiseReduction: 0,
    sharpening: 0,
    brightness: 0,
    contrast: 0,
    saturation: 0,
  })

  const isProcessing = useAIStore((state) => state.isProcessing)
  const progress = useAIStore((state) => state.progress)
  const result = useAIStore((state) => state.result)
  
  const enhance = useAIStore((state) => state.enhance)
  const cancel = useAIStore((state) => state.cancel)

  const handleEnhance = async () => {
    if (!image) return

    const result = await enhance(image, options)

    if (result.success && result.data) {
      onResult?.(result.data)
    }
  }

  const handleCancel = () => {
    cancel()
  }

  const handleReset = () => {
    setOptions({
      noiseReduction: 0,
      sharpening: 0,
      brightness: 0,
      contrast: 0,
      saturation: 0,
    })
  }

  const updateOption = (key: keyof EnhancementOptions, value: number) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  if (!image) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center py-8 text-muted-foreground">
          <p>Select a frame to enhance</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('p-6', className)}>
      <h3 className="font-semibold text-lg mb-4">Frame Enhancement</h3>

      {/* Enhancement controls */}
      <div className="space-y-4 mb-6">
        {/* Noise Reduction */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Noise Reduction</label>
            <span className="text-sm text-muted-foreground">{options.noiseReduction}%</span>
          </div>
          <Slider
            minValue={0}
            maxValue={100}
            value={options.noiseReduction}
            onChange={(v) => updateOption('noiseReduction', v as number)}
            disabled={isProcessing}
          />
        </div>

        {/* Sharpening */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Sharpening</label>
            <span className="text-sm text-muted-foreground">{options.sharpening}%</span>
          </div>
          <Slider
            minValue={0}
            maxValue={100}
            value={options.sharpening}
            onChange={(v) => updateOption('sharpening', v as number)}
            disabled={isProcessing}
          />
        </div>

        {/* Brightness */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Brightness</label>
            <span className="text-sm text-muted-foreground">{options.brightness}%</span>
          </div>
          <Slider
            minValue={-50}
            maxValue={50}
            value={options.brightness}
            onChange={(v) => updateOption('brightness', v as number)}
            disabled={isProcessing}
          />
        </div>

        {/* Contrast */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Contrast</label>
            <span className="text-sm text-muted-foreground">{options.contrast}%</span>
          </div>
          <Slider
            minValue={-50}
            maxValue={50}
            value={options.contrast}
            onChange={(v) => updateOption('contrast', v as number)}
            disabled={isProcessing}
          />
        </div>

        {/* Saturation */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Saturation</label>
            <span className="text-sm text-muted-foreground">{options.saturation}%</span>
          </div>
          <Slider
            minValue={-100}
            maxValue={100}
            value={options.saturation}
            onChange={(v) => updateOption('saturation', v as number)}
            disabled={isProcessing}
          />
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

      {/* Result */}
      {result && result.success && (
        <div className="mb-6 p-3 bg-success/10 border border-success/20 rounded-lg">
          <p className="text-sm text-success text-center">
            ✅ Enhancement applied!
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!isProcessing ? (
          <>
            <Button
              color="primary"
              onClick={handleEnhance}
              className="flex-1"
            >
              🎨 Apply Enhancements
            </Button>
            <Button variant="flat" onClick={handleReset}>
              Reset
            </Button>
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
