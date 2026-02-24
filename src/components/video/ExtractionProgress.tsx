import { Button, Card, Progress } from '@/components'
import { cn } from '@/utils'
import { useFrameExtractionStore } from '@/stores/frameExtractionStore'

interface ExtractionProgressProps {
  onCancel?: () => void
  onPause?: () => void
  onResume?: () => void
  className?: string
}

export function ExtractionProgress({ onCancel, onPause, onResume, className }: ExtractionProgressProps) {
  const progress = useFrameExtractionStore((state) => state.progress)
  const isExtracting = useFrameExtractionStore((state) => state.isExtracting)
  const isPaused = useFrameExtractionStore((state) => state.isPaused)

  if (!isExtracting && progress.status === 'idle') {
    return null
  }

  // Calculate ETA
  const getETA = () => {
    if (progress.percentage === 0 || !progress.current) return null
    const elapsed = Date.now()
    const rate = progress.current / (elapsed - (progress as any).startTime || elapsed)
    const remaining = progress.total - progress.current
    const etaSeconds = Math.floor(remaining / rate)
    
    if (etaSeconds < 60) return `${etaSeconds}s`
    if (etaSeconds < 3600) return `${Math.floor(etaSeconds / 60)}m ${etaSeconds % 60}s`
    return `${Math.floor(etaSeconds / 3600)}h ${Math.floor((etaSeconds % 3600) / 60)}m`
  }

  const eta = getETA()

  return (
    <Card className={cn('p-6', className)} shadow="md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">
          {isPaused ? 'Extraction Paused' : 
           progress.status === 'completed' ? 'Extraction Complete' :
           progress.status === 'cancelled' ? 'Extraction Cancelled' :
           'Extracting Frames...'}
        </h3>
        
        {/* Status badge */}
        <span className={cn(
          'px-3 py-1 rounded-full text-sm font-medium',
          progress.status === 'completed' ? 'bg-success/10 text-success' :
          progress.status === 'error' ? 'bg-danger/10 text-danger' :
          progress.status === 'cancelled' ? 'bg-warning/10 text-warning' :
          'bg-primary/10 text-primary'
        )}>
          {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <Progress 
          value={progress.percentage} 
          size="lg"
          color={
            progress.status === 'error' ? 'danger' :
            progress.status === 'completed' ? 'success' :
            'primary'
          }
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Progress</p>
          <p className="font-medium">{progress.current} / {progress.total} frames</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Percentage</p>
          <p className="font-medium">{progress.percentage.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            {eta ? 'Estimated Time' : 'Status'}
          </p>
          <p className="font-medium">{eta || progress.message || '-'}</p>
        </div>
      </div>

      {/* Message */}
      {progress.message && (
        <p className="text-sm text-muted-foreground mb-4">{progress.message}</p>
      )}

      {/* Actions */}
      {isExtracting && !progress.status.match(/completed|error|cancelled/) && (
        <div className="flex gap-2">
          {isPaused ? (
            <Button onClick={onResume} color="success">
              ▶ Resume
            </Button>
          ) : (
            <Button onClick={onPause} variant="bordered">
              ⏸ Pause
            </Button>
          )}
          <Button onClick={onCancel} variant="flat" color="danger">
            ✕ Cancel
          </Button>
        </div>
      )}

      {/* Error message */}
      {progress.status === 'error' && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg">
          <p className="text-sm text-danger">{progress.message || 'An error occurred during extraction'}</p>
        </div>
      )}
    </Card>
  )
}
