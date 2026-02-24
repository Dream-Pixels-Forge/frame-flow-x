import { Card, Button, Badge, Progress } from '@/components'
import { cn } from '@/utils'
import { useVideoImportStore } from '@/stores/videoImportStore'
import { formatVideoDuration, formatVideoResolution, getVideoIcon } from '@/types/video'

interface VideoPreviewProps {
  onRemove?: () => void
  onEdit?: () => void
  className?: string
}

export function VideoPreview({ onRemove, onEdit, className }: VideoPreviewProps) {
  const file = useVideoImportStore((state) => state.file)
  const isUploading = useVideoImportStore((state) => state.isUploading)
  const uploadProgress = useVideoImportStore((state) => state.uploadProgress)
  const error = useVideoImportStore((state) => state.error)
  const clearFile = useVideoImportStore((state) => state.clearFile)

  if (!file) {
    return null
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const handleRemove = () => {
    clearFile()
    onRemove?.()
  }

  return (
    <Card className={cn('p-6', className)} isHoverable shadow="md">
      <div className="flex gap-6">
        {/* Thumbnail */}
        <div className="relative w-48 h-32 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
          {file.thumbnail ? (
            <img
              src={file.thumbnail}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              {getVideoIcon(file.format)}
            </div>
          )}

          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
            {formatVideoDuration(file.duration)}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-lg truncate">{file.name}</h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span>{formatVideoResolution(file.width, file.height)}</span>
                <span>•</span>
                <span className="uppercase">{file.format}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="flat" size="sm" onClick={onEdit}>
                  Edit
                </Button>
              )}
              <Button variant="flat" color="danger" size="sm" onClick={handleRemove}>
                Remove
              </Button>
            </div>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Duration</p>
              <p className="font-medium">{formatVideoDuration(file.duration)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Resolution</p>
              <p className="font-medium">{file.width} x {file.height}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Format</p>
              <p className="font-medium uppercase">{file.format}</p>
            </div>
          </div>

          {/* Upload progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Loading...</span>
                <span className="text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} size="sm" />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-3 p-3 bg-danger/10 border border-danger/20 rounded-lg">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {/* Success badge */}
          {!isUploading && !error && (
            <Badge color="success" size="sm">
              Ready for processing
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}
