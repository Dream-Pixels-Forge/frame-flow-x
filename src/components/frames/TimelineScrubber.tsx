import { Card, Button } from '@/components'
import { cn } from '@/utils'
import { useFrameGalleryStore } from '@/stores/frameGalleryStore'

interface TimelineScrubberProps {
  className?: string
}

export function TimelineScrubber({ className }: TimelineScrubberProps) {
  const frames = useFrameGalleryStore((state) => state.frames)
  const selectedFrameIds = useFrameGalleryStore((state) => state.selectedFrameIds)
  const selectedFrameIndex = useFrameGalleryStore((state) => state.selectedFrameIndex)
  const setSelectedFrameIndex = useFrameGalleryStore((state) => state.setSelectedFrameIndex)
  const toggleFrameSelection = useFrameGalleryStore((state) => state.toggleFrameSelection)

  if (frames.length === 0) {
    return null
  }

  // Calculate timeline duration
  const totalDuration = frames[frames.length - 1]?.timestamp || 0

  // Get visible frames (sample for performance with many frames)
  const visibleFrames = frames.length > 100
    ? frames.filter((_, i) => i % Math.ceil(frames.length / 100) === 0)
    : frames

  return (
    <Card className={cn('p-4', className)}>
      {/* Timeline header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm">Timeline</h4>
        <span className="text-xs text-muted-foreground">
          {frames.length} frames • {(totalDuration / 1000).toFixed(2)}s
        </span>
      </div>

      {/* Timeline track */}
      <div className="relative h-16 bg-secondary rounded-lg overflow-hidden">
        {/* Frame thumbnails */}
        <div className="absolute inset-0 flex">
          {visibleFrames.map((frame) => {
            const originalIndex = frames.indexOf(frame)
            const isSelected = selectedFrameIds.includes(frame.id)
            const isCurrent = originalIndex === selectedFrameIndex

            return (
              <div
                key={frame.id}
                className={cn(
                  'flex-1 min-w-[4px] h-full cursor-pointer border-r border-background/50',
                  isCurrent && 'ring-2 ring-primary ring-inset',
                  isSelected && 'bg-primary/30',
                  !isSelected && 'hover:bg-secondary-foreground/10'
                )}
                onClick={() => {
                  setSelectedFrameIndex(originalIndex)
                  toggleFrameSelection(frame.id)
                }}
                title={`Frame ${originalIndex + 1} - ${(frame.timestamp / 1000).toFixed(2)}s`}
              >
                {frame.data && (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${URL.createObjectURL(frame.data)})` }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Playhead */}
        {selectedFrameIndex >= 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary pointer-events-none"
            style={{
              left: `${(selectedFrameIndex / (frames.length - 1)) * 100}%`,
            }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full" />
          </div>
        )}
      </div>

      {/* Time markers */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>0:00</span>
        <span>{(totalDuration / 60000).toFixed(1)}m</span>
        <span>{(totalDuration / 1000).toFixed(0)}s</span>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <Button
          size="sm"
          variant="bordered"
          onClick={() => setSelectedFrameIndex(Math.max(0, selectedFrameIndex - 10))}
          disabled={selectedFrameIndex < 10}
        >
          ← -10
        </Button>
        <Button
          size="sm"
          variant="bordered"
          onClick={() => setSelectedFrameIndex(selectedFrameIndex - 1)}
          disabled={selectedFrameIndex < 1}
        >
          ← -1
        </Button>
        <span className="text-sm font-medium w-32 text-center">
          {selectedFrameIndex >= 0 ? `Frame ${selectedFrameIndex + 1}` : 'No selection'}
        </span>
        <Button
          size="sm"
          variant="bordered"
          onClick={() => setSelectedFrameIndex(selectedFrameIndex + 1)}
          disabled={selectedFrameIndex >= frames.length - 1}
        >
          +1 →
        </Button>
        <Button
          size="sm"
          variant="bordered"
          onClick={() => setSelectedFrameIndex(selectedFrameIndex + 10)}
          disabled={selectedFrameIndex >= frames.length - 10}
        >
          +10 →
        </Button>
      </div>
    </Card>
  )
}
