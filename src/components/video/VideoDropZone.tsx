'use client'

import { useCallback, useState, useRef } from 'react'
import { Card, Button } from '@/components'
import { cn } from '@/utils'
import { useVideoImportStore } from '@/stores/videoImportStore'
import { VIDEO_CONFIG } from '@/config'

interface VideoDropZoneProps {
  onFileSelected?: (file: File) => void
  className?: string
}

export function VideoDropZone({ onFileSelected, className }: VideoDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const setFile = useVideoImportStore((state) => state.setFile)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (file.type.startsWith('video/')) {
          await setFile(file)
          onFileSelected?.(file)
        }
      }
    },
    [setFile, onFileSelected]
  )

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        await setFile(files[0])
        onFileSelected?.(files[0])
      }
    },
    [setFile, onFileSelected]
  )

  const maxFileSizeMB = (VIDEO_CONFIG.maxFileSize / (1024 * 1024)).toFixed(0)

  return (
    <div
      className={cn(
        'w-full',
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={VIDEO_CONFIG.supportedFormats.map((f) => `.${f}`).join(',')}
        onChange={handleFileChange}
        className="hidden"
      />

      <Card
        isHoverable
        className={cn(
          'p-12 cursor-pointer transition-all duration-300 border-2 border-dashed',
          isDragOver
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center justify-center text-center">
          {/* Icon */}
          <div className="text-6xl mb-6">📁</div>

          {/* Title */}
          <h3 className="text-xl font-semibold mb-2">Drop your video here</h3>

          {/* Description */}
          <p className="text-muted-foreground mb-4 max-w-md">
            Support for {VIDEO_CONFIG.supportedFormats.join(', ')} up to {maxFileSizeMB}MB
          </p>

          {/* Supported formats */}
          <div className="flex gap-2 mb-6 flex-wrap justify-center">
            {VIDEO_CONFIG.supportedFormats.map((format) => (
              <span
                key={format}
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
              >
                .{format.toUpperCase()}
              </span>
            ))}
          </div>

          {/* Button */}
          <Button size="lg" color="primary" onClick={(e) => {
            e.stopPropagation()
            handleClick()
          }}>
            Select Video
          </Button>

          {/* Or divider */}
          <div className="flex items-center gap-4 my-6 w-full max-w-xs">
            <div className="h-px bg-border flex-1" />
            <span className="text-muted-foreground text-sm">or drag and drop</span>
            <div className="h-px bg-border flex-1" />
          </div>

          {/* Info */}
          <p className="text-sm text-muted-foreground">
            Maximum file size: {maxFileSizeMB}MB
          </p>
        </div>
      </Card>
    </div>
  )
}
