'use client'

import { Card, Button, Progress } from '@/components'
import { cn, formatDuration, formatFileSize } from '@/utils'
import { useBatchQueueStore, BatchQueueItem, getQueueStats } from '@/stores/batchQueueStore'
import {
  TrashIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  FilmIcon,
} from '@/components/icons'

interface BatchQueuePanelProps {
  className?: string
}

export function BatchQueuePanel({ className }: BatchQueuePanelProps) {
  const queue = useBatchQueueStore((state) => state.queue)
  const currentItemId = useBatchQueueStore((state) => state.currentItemId)
  const autoStart = useBatchQueueStore((state) => state.autoStart)

  const removeFromQueue = useBatchQueueStore((state) => state.removeFromQueue)
  const cancelItem = useBatchQueueStore((state) => state.cancelItem)
  const clearCompleted = useBatchQueueStore((state) => state.clearCompleted)
  const pauseProcessing = useBatchQueueStore((state) => state.pauseProcessing)
  const resumeProcessing = useBatchQueueStore((state) => state.resumeProcessing)
  const setAutoStart = useBatchQueueStore((state) => state.setAutoStart)

  const stats = getQueueStats(queue)

  if (queue.length === 0) {
    return null
  }

  return (
    <Card className={cn('p-4', className)} shadow="md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FilmIcon size={20} className="text-primary" />
          <h3 className="font-semibold text-lg">Batch Queue</h3>
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
            {stats.total} items
          </span>
        </div>

        <div className="flex gap-2">
          {/* Auto-start toggle */}
          <Button
            variant={autoStart ? 'solid' : 'bordered'}
            size="sm"
            onClick={() => setAutoStart(!autoStart)}
          >
            Auto: {autoStart ? 'ON' : 'OFF'}
          </Button>

          {/* Clear completed */}
          {stats.completed > 0 && (
            <Button variant="bordered" size="sm" onClick={clearCompleted}>
              <TrashIcon size={16} className="mr-1" /> Clear Done
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
        <div className="text-center p-2 bg-secondary/50 rounded">
          <div className="text-muted-foreground text-xs">Pending</div>
          <div className="font-semibold">{stats.pending}</div>
        </div>
        <div className="text-center p-2 bg-primary/10 rounded">
          <div className="text-primary text-xs">Processing</div>
          <div className="font-semibold">{stats.processing}</div>
        </div>
        <div className="text-center p-2 bg-success/10 rounded">
          <div className="text-success text-xs">Completed</div>
          <div className="font-semibold">{stats.completed}</div>
        </div>
        <div className="text-center p-2 bg-danger/10 rounded">
          <div className="text-danger text-xs">Failed</div>
          <div className="font-semibold">{stats.failed}</div>
        </div>
      </div>

      {/* Queue items */}
      <div className="space-y-2 max-h-96 overflow-auto">
        {queue.map((item) => (
          <QueueItem
            key={item.id}
            item={item}
            isCurrent={item.id === currentItemId}
            onRemove={() => removeFromQueue(item.id)}
            onCancel={() => cancelItem(item.id)}
            onPause={pauseProcessing}
            onResume={resumeProcessing}
          />
        ))}
      </div>

      {/* Footer stats */}
      {stats.totalFrames > 0 && (
        <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
          Total frames extracted: <span className="font-semibold text-foreground">{stats.totalFrames}</span>
        </div>
      )}
    </Card>
  )
}

interface QueueItemProps {
  item: BatchQueueItem
  isCurrent: boolean
  onRemove: () => void
  onCancel: () => void
  onPause: () => void
  onResume?: () => void
}

function QueueItem({ item, isCurrent, onRemove, onCancel, onPause }: QueueItemProps) {
  const isProcessing = item.status === 'processing'
  const isCompleted = item.status === 'completed'
  const isFailed = item.status === 'error' || item.status === 'cancelled'

  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-all',
        isCurrent ? 'border-primary bg-primary/5' : 'border-border',
        isCompleted && 'border-success/50 bg-success/5',
        isFailed && 'border-danger/50 bg-danger/5'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Status icon */}
          <span className="flex-shrink-0">
            {isCompleted && <CheckCircleIcon size={16} className="text-success" />}
            {item.status === 'error' && <XCircleIcon size={16} className="text-danger" />}
            {item.status === 'cancelled' && <XCircleIcon size={16} className="text-warning" />}
            {isProcessing && <FilmIcon size={16} className="text-primary animate-spin" />}
            {item.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-border" />}
          </span>

          {/* Video info */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{item.video.name}</div>
            <div className="text-xs text-muted-foreground">
              {formatFileSize(item.video.size)} • {formatDuration(item.video.duration / 1000)} •{' '}
              {item.video.width}x{item.video.height}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {isProcessing && (
            <Button size="sm" variant="bordered" onClick={onPause}>
              <PauseIcon size={14} />
            </Button>
          )}
          {(isCompleted || item.status === 'cancelled') && (
            <Button size="sm" variant="flat" onClick={onRemove}>
              <TrashIcon size={14} />
            </Button>
          )}
          {!isProcessing && !isCompleted && item.status !== 'cancelled' && (
            <Button size="sm" variant="flat" color="danger" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      {(isProcessing || isCompleted) && (
        <div className="space-y-1">
          <Progress value={item.progress.percentage} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{item.progress.message || 'Processing...'}</span>
            <span>{item.progress.percentage.toFixed(0)}%</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {item.status === 'error' && item.error && (
        <div className="mt-2 text-xs text-danger">{item.error}</div>
      )}

      {/* Completed info */}
      {isCompleted && item.frameCount && (
        <div className="mt-2 text-xs text-success">
          ✓ Extracted {item.frameCount} frames
        </div>
      )}
    </div>
  )
}
