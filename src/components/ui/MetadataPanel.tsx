import { Card, Badge } from '@/components'
import { cn } from '@/lib/utils'

interface MetadataItem {
  label: string
  value: string | number
  icon?: React.ReactNode
}

interface MetadataPanelProps {
  className?: string
  title?: string
  metadata: MetadataItem[]
}

export function MetadataPanel({ className, title = 'Metadata', metadata }: MetadataPanelProps) {
  if (!metadata || metadata.length === 0) {
    return null
  }

  return (
    <Card className={cn('p-4', className)}>
      {title && <h3 className="font-semibold text-lg mb-4">{title}</h3>}

      <div className="space-y-3">
        {metadata.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-2 border-b last:border-0"
          >
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <div className="flex items-center gap-2">
              {item.icon}
              <Badge variant="outline" className="font-mono">
                {item.value}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format bitrate for display
 */
export function formatBitrate(bps: number): string {
  if (bps < 1000) return `${bps} bps`
  if (bps < 1000000) return `${(bps / 1000).toFixed(1)} Kbps`
  return `${(bps / 1000000).toFixed(2)} Mbps`
}

/**
 * Get video metadata display items
 */
export function getVideoMetadataItems(metadata: {
  duration?: number
  width?: number
  height?: number
  fps?: number
  codec?: string
  size?: number
  format?: string
  bitrate?: number
}): MetadataItem[] {
  const items: MetadataItem[] = []

  if (metadata.duration !== undefined) {
    items.push({
      label: 'Duration',
      value: formatDuration(metadata.duration / 1000),
    })
  }

  if (metadata.width && metadata.height) {
    items.push({
      label: 'Resolution',
      value: `${metadata.width}x${metadata.height}`,
    })

    // Add resolution category
    const resolution = `${metadata.width}x${metadata.height}`
    const categories: Record<string, string> = {
      '640x480': 'SD',
      '1280x720': 'HD',
      '1920x1080': 'FHD',
      '2560x1440': 'QHD',
      '3840x2160': '4K',
      '7680x4320': '8K',
    }
    const category = categories[resolution]
    if (category) {
      items.push({
        label: 'Category',
        value: category,
      })
    }
  }

  if (metadata.fps) {
    items.push({
      label: 'Frame Rate',
      value: `${metadata.fps} FPS`,
    })
  }

  if (metadata.codec) {
    items.push({
      label: 'Codec',
      value: metadata.codec.toUpperCase(),
    })
  }

  if (metadata.format) {
    items.push({
      label: 'Format',
      value: metadata.format.toUpperCase(),
    })
  }

  if (metadata.size !== undefined) {
    items.push({
      label: 'File Size',
      value: formatFileSize(metadata.size),
    })
  }

  if (metadata.bitrate) {
    items.push({
      label: 'Bitrate',
      value: formatBitrate(metadata.bitrate),
    })
  }

  return items
}

/**
 * Get frame metadata display items
 */
export function getFrameMetadataItems(metadata: {
  width?: number
  height?: number
  format?: string
  size?: number
  timestamp?: number
  frameNumber?: number
}): MetadataItem[] {
  const items: MetadataItem[] = []

  if (metadata.frameNumber !== undefined) {
    items.push({
      label: 'Frame Number',
      value: `#${metadata.frameNumber + 1}`,
    })
  }

  if (metadata.timestamp !== undefined) {
    items.push({
      label: 'Timestamp',
      value: `${(metadata.timestamp / 1000).toFixed(3)}s`,
    })
  }

  if (metadata.width && metadata.height) {
    items.push({
      label: 'Resolution',
      value: `${metadata.width}x${metadata.height}`,
    })
  }

  if (metadata.format) {
    items.push({
      label: 'Format',
      value: metadata.format.toUpperCase(),
    })
  }

  if (metadata.size !== undefined) {
    items.push({
      label: 'File Size',
      value: formatFileSize(metadata.size),
    })
  }

  return items
}
