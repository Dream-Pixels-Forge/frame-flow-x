import { useState } from 'react'
import { Card, Button } from '@/components'
import { cn } from '@/utils'

interface BeforeAfterComparisonProps {
  beforeImage: Blob | string | null
  afterImage: Blob | string | null
  className?: string
}

export function BeforeAfterComparison({ 
  beforeImage, 
  afterImage, 
  className 
}: BeforeAfterComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'toggle'>('slider')
  const [showAfter, setShowAfter] = useState(true)

  if (!beforeImage) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center py-8 text-muted-foreground">
          <p>No image to compare</p>
        </div>
      </Card>
    )
  }

  const beforeUrl = beforeImage instanceof Blob 
    ? URL.createObjectURL(beforeImage) 
    : beforeImage
    
  const afterUrl = afterImage instanceof Blob 
    ? URL.createObjectURL(afterImage) 
    : afterImage

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Comparison</h3>
        
        {/* View mode toggle */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={viewMode === 'slider' ? 'solid' : 'bordered'}
            onClick={() => setViewMode('slider')}
          >
            Slider
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'side-by-side' ? 'solid' : 'bordered'}
            onClick={() => setViewMode('side-by-side')}
          >
            Side by Side
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'toggle' ? 'solid' : 'bordered'}
            onClick={() => setViewMode('toggle')}
          >
            Toggle
          </Button>
        </div>
      </div>

      {/* Comparison view */}
      <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden mb-4">
        {viewMode === 'slider' && beforeUrl && afterUrl && (
          <>
            {/* After image (full) */}
            <img
              src={afterUrl}
              alt="After"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Before image (clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={beforeUrl}
                alt="Before"
                className="w-full h-full object-cover"
                style={{ width: `${100 / sliderPosition * 100}%` }}
              />
            </div>

            {/* Slider handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={(e) => {
                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const rect = e.currentTarget.parentElement?.getBoundingClientRect()
                  if (rect) {
                    const x = moveEvent.clientX - rect.left
                    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100))
                    setSliderPosition(pos)
                  }
                }
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove)
                  document.removeEventListener('mouseup', handleMouseUp)
                }
                
                document.addEventListener('mousemove', handleMouseMove)
                document.addEventListener('mouseup', handleMouseUp)
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                <span className="text-gray-600">↔</span>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
              Before
            </div>
            <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
              After
            </div>
          </>
        )}

        {viewMode === 'side-by-side' && (
          <div className="flex h-full">
            <div className="w-1/2 h-full border-r">
              {beforeUrl && (
                <>
                  <img
                    src={beforeUrl}
                    alt="Before"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    Before
                  </div>
                </>
              )}
            </div>
            <div className="w-1/2 h-full">
              {afterUrl && (
                <>
                  <img
                    src={afterUrl}
                    alt="After"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    After
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {viewMode === 'toggle' && (
          <>
            <img
              src={showAfter && afterUrl ? afterUrl : beforeUrl}
              alt={showAfter ? 'After' : 'Before'}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white text-sm rounded-full">
              {showAfter ? 'After' : 'Before'}
            </div>
          </>
        )}
      </div>

      {/* Toggle button for toggle mode */}
      {viewMode === 'toggle' && (
        <div className="flex justify-center">
          <Button onClick={() => setShowAfter(!showAfter)}>
            {showAfter ? '👁️ Show Before' : '👁️ Show After'}
          </Button>
        </div>
      )}

      {/* Slider position indicator */}
      {viewMode === 'slider' && (
        <div className="flex justify-center text-sm text-muted-foreground">
          Drag the slider to compare
        </div>
      )}
    </Card>
  )
}
