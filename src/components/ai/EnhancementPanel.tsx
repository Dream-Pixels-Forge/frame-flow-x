import { useState } from 'react'
import { Button, Card, Slider, Badge } from '@/components'
import { useAIStore } from '@/stores/aiStore'

interface EnhancementPanelProps {
  image?: Blob | null
  onResult?: (result: Blob | string) => void
}

export function EnhancementPanel({ image, onResult }: EnhancementPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [options, setOptions] = useState({
    noiseReduction: 0,
    sharpening: 0,
    brightness: 0,
    contrast: 0,
    saturation: 0,
  })

  const enhanceImage = useAIStore((state) => state.enhanceImage)

  const updateOption = (key: string, value: number) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  const handleApply = async () => {
    if (!image) return

    setIsProcessing(true)
    try {
      const result = await enhanceImage(image, options)
      if (result && onResult) {
        onResult(result)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="p-6" isHoverable>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Enhancement Controls</h3>
        <Badge>AI Powered</Badge>
      </div>

      <div className="space-y-6">
        {/* Noise Reduction */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Noise Reduction</label>
            <span className="text-sm text-muted-foreground">{options.noiseReduction}%</span>
          </div>
          <Slider
            minValue={0}
            maxValue={100}
            value={[options.noiseReduction]}
            onChange={(v: number[]) => updateOption('noiseReduction', v[0])}
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
            value={[options.sharpening]}
            onChange={(v: number[]) => updateOption('sharpening', v[0])}
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
            minValue={-100}
            maxValue={100}
            value={[options.brightness]}
            onChange={(v: number[]) => updateOption('brightness', v[0])}
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
            minValue={-100}
            maxValue={100}
            value={[options.contrast]}
            onChange={(v: number[]) => updateOption('contrast', v[0])}
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
            value={[options.saturation]}
            onChange={(v: number[]) => updateOption('saturation', v[0])}
            disabled={isProcessing}
          />
        </div>

        {/* Intensity */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Effect Intensity</label>
            <span className="text-sm text-muted-foreground">{options.saturation}%</span>
          </div>
          <Slider
            minValue={50}
            maxValue={200}
            value={[100]}
            onChange={() => {}}
            disabled={isProcessing}
          />
        </div>

        {/* Apply button */}
        <Button
          onClick={handleApply}
          disabled={!image || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? 'Applying...' : 'Apply Enhancements'}
        </Button>

        {!image && (
          <p className="text-sm text-muted-foreground text-center">
            Select a frame from the gallery to enhance
          </p>
        )}
      </div>
    </Card>
  )
}
