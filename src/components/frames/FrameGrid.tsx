import { useCallback } from 'react'
import { Card, Button, Badge, Checkbox } from '@/components'
import { cn } from '@/lib/utils'
import { useFrameGalleryStore } from '@/stores/frameGalleryStore'
import { ExtractedFrame } from '@/utils/frameExtractor'

interface FrameGridProps {
  onFrameClick?: (frame: ExtractedFrame, index: number) => void
}

export function FrameGrid({ onFrameClick }: FrameGridProps) {
  const frames = useFrameGalleryStore((state) => state.frames)
  const selectedFrameIds = useFrameGalleryStore((state) => state.selectedFrameIds)
  const favoriteFrameIds = useFrameGalleryStore((state) => state.favoriteFrameIds)
  const toggleFrameSelection = useFrameGalleryStore((state) => state.toggleFrameSelection)
  const toggleFavorite = useFrameGalleryStore((state) => state.toggleFavorite)
  const zoomLevel = useFrameGalleryStore((state) => state.zoomLevel)

  // Calculate grid columns based on zoom level
  const getColumnsCount = useCallback(() => {
    if (zoomLevel <= 75) return 12
    if (zoomLevel <= 100) return 8
    if (zoomLevel <= 125) return 6
    if (zoomLevel <= 150) return 4
    return 3
  }, [zoomLevel])

  const columnsCount = getColumnsCount()

  if (frames.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">📷</div>
          <h3 className="text-lg font-semibold mb-2">No Frames Yet</h3>
          <p className="text-muted-foreground">
            Import a video and extract frames to see them here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))`,
      }}
    >
      {frames.map((frame, index) => {
        const isSelected = selectedFrameIds.includes(frame.id)
        const isFavorite = favoriteFrameIds.includes(frame.id)

        return (
          <Card
            key={frame.id}
            className={cn(
              'group relative overflow-hidden cursor-pointer transition-all duration-200',
              isSelected && 'ring-2 ring-primary ring-offset-2',
              isFavorite && 'border-warning/50'
            )}
            isHoverable
            onClick={() => onFrameClick?.(frame, index)}
          >
            {/* Frame thumbnail */}
            <div className="aspect-video bg-secondary relative overflow-hidden">
              {frame.data ? (
                <img
                  src={URL.createObjectURL(frame.data)}
                  alt={`Frame ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl">🎬</span>
                </div>
              )}

              {/* Frame number overlay */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                #{index + 1}
              </div>

              {/* Timestamp overlay */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                {(frame.timestamp / 1000).toFixed(2)}s
              </div>

              {/* Favorite badge */}
              {isFavorite && (
                <div className="absolute top-2 right-2">
                  <Badge>⭐</Badge>
                </div>
              )}

              {/* Selection checkbox (shown on hover) */}
              <div
                className={cn(
                  'absolute top-2 right-2 transition-opacity',
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFrameSelection(frame.id)
                }}
              >
                <Checkbox
                  checked={isSelected}
                  onChange={() => toggleFrameSelection(frame.id)}
                  className="bg-white/90"
                />
              </div>

              {/* Quick actions (shown on hover) */}
              <div
                className={cn(
                  'absolute bottom-2 right-2 flex gap-1 transition-opacity',
                  'opacity-0 group-hover:opacity-100'
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="sm"
                  variant="flat"
                  className="bg-white/90 hover:bg-white h-7 w-7 p-0 min-w-auto"
                  onClick={() => toggleFavorite(frame.id)}
                >
                  {isFavorite ? '⭐' : '☆'}
                </Button>
              </div>
            </div>

            {/* Frame info */}
            <div className="p-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  {frame.width}x{frame.height}
                </span>
                <span className="text-muted-foreground">
                  {(frame.size / 1024).toFixed(0)} KB
                </span>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
