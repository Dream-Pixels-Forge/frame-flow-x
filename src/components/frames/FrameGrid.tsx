import { useMemo } from 'react'
import { Button, Badge, Checkbox } from '@/components'
import { cn } from '@/utils'
import { useFrameGalleryStore } from '@/stores/frameGalleryStore'
import { ExtractedFrame } from '@/utils/frameExtractor'

interface FrameGridProps {
  onFrameClick?: (frame: ExtractedFrame, index: number) => void
  className?: string
}

export function FrameGrid({ onFrameClick, className }: FrameGridProps) {
  const frames = useFrameGalleryStore((state) => state.frames)
  const selectedFrameIds = useFrameGalleryStore((state) => state.selectedFrameIds)
  const favoriteFrameIds = useFrameGalleryStore((state) => state.favoriteFrameIds)
  const zoomLevel = useFrameGalleryStore((state) => state.zoomLevel)
  const toggleFrameSelection = useFrameGalleryStore((state) => state.toggleFrameSelection)
  const toggleFavorite = useFrameGalleryStore((state) => state.toggleFavorite)

  // Calculate grid columns based on zoom level
  const gridColumns = useMemo(() => {
    if (zoomLevel >= 150) return 'grid-cols-2'
    if (zoomLevel >= 120) return 'grid-cols-3'
    if (zoomLevel >= 80) return 'grid-cols-4'
    return 'grid-cols-5'
  }, [zoomLevel])

  if (frames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-xl font-semibold mb-2">No frames yet</h3>
        <p className="text-muted-foreground">
          Extract frames from a video to see them here
        </p>
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4', gridColumns, className)}>
      {frames.map((frame, index) => {
        const isSelected = selectedFrameIds.includes(frame.id)
        const isFavorite = favoriteFrameIds.includes(frame.id)

        return (
          <div
            key={frame.id}
            className={cn(
              'group relative aspect-video rounded-lg overflow-hidden cursor-pointer',
              'transition-all duration-200',
              isSelected
                ? 'ring-2 ring-primary ring-offset-2'
                : 'hover:ring-2 hover:ring-primary/50 hover:ring-offset-2'
            )}
            onClick={() => onFrameClick?.(frame, index)}
          >
            {/* Frame thumbnail */}
            <div
              className="w-full h-full bg-secondary"
              style={{
                backgroundImage: `url(${frame.data ? URL.createObjectURL(frame.data) : ''})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {!frame.data && (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <span className="text-2xl">📷</span>
                </div>
              )}
            </div>

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
                <Badge color="warning" size="sm">
                  ⭐
                </Badge>
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
                onCheckedChange={() => toggleFrameSelection(frame.id)}
                className="bg-white rounded"
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
                className="bg-white/90 hover:bg-white"
                onClick={() => toggleFavorite(frame.id)}
              >
                {isFavorite ? '⭐' : '☆'}
              </Button>
            </div>

            {/* Selection overlay */}
            {isSelected && (
              <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
            )}
          </div>
        )
      })}
    </div>
  )
}
