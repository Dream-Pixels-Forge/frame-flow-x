import { useState } from 'react'
import { Button, Slider, Tabs } from '@/components'
import { cn } from '@/utils'
import { useFrameGalleryStore } from '@/stores/frameGalleryStore'
import { ExportDialog } from '@/components/frames/export'

interface FrameGalleryToolbarProps {
  className?: string
}

export function FrameGalleryToolbar({ className }: FrameGalleryToolbarProps) {
  const [exportOpen, setExportOpen] = useState(false)
  
  const viewMode = useFrameGalleryStore((state) => state.viewMode)
  const zoomLevel = useFrameGalleryStore((state) => state.zoomLevel)
  const selectedFrameIds = useFrameGalleryStore((state) => state.selectedFrameIds)
  const frames = useFrameGalleryStore((state) => state.frames)
  const setViewMode = useFrameGalleryStore((state) => state.setViewMode)
  const setZoomLevel = useFrameGalleryStore((state) => state.setZoomLevel)
  const selectAllFrames = useFrameGalleryStore((state) => state.selectAllFrames)
  const clearSelection = useFrameGalleryStore((state) => state.clearSelection)
  const clearFrames = useFrameGalleryStore((state) => state.clearFrames)

  return (
    <div className={cn('flex items-center justify-between p-4 border-b bg-background', className)}>
      {/* Left section - View modes */}
      <div className="flex items-center gap-4">
        <Tabs
          items={[
            { key: 'grid', title: 'Grid' },
            { key: 'list', title: 'List' },
            { key: 'timeline', title: 'Timeline' },
          ]}
          selectedKey={viewMode}
          onSelectionChange={(key: string) => setViewMode(key as 'grid' | 'list' | 'timeline')}
          variant="bordered"
          size="sm"
        />

        {/* Zoom slider */}
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm text-muted-foreground w-12">Zoom</span>
          <Slider
            minValue={50}
            maxValue={200}
            step={25}
            value={[zoomLevel]}
            onChange={(value) => setZoomLevel(value[0])}
            className="w-32"
          />
          <span className="text-sm w-10 text-right">{zoomLevel}%</span>
        </div>
      </div>

      {/* Center section - Selection info */}
      <div className="flex items-center gap-2">
        {selectedFrameIds.length > 0 ? (
          <>
            <span className="text-sm text-muted-foreground">
              {selectedFrameIds.length} of {frames.length} selected
            </span>
            <Button size="sm" variant="flat" onClick={clearSelection}>
              Deselect
            </Button>
          </>
        ) : (
          <Button size="sm" variant="flat" onClick={selectAllFrames}>
            Select All
          </Button>
        )}
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="bordered"
          onClick={() => setExportOpen(true)}
          disabled={selectedFrameIds.length === 0 && frames.length === 0}
        >
          📥 Export ({selectedFrameIds.length || frames.length})
        </Button>
        <Button
          size="sm"
          variant="flat"
          color="danger"
          onClick={clearFrames}
        >
          🗑️ Clear All
        </Button>
      </div>

      {/* Export Dialog */}
      <ExportDialog open={exportOpen} onOpenChange={(open) => setExportOpen(open)} />
    </div>
  )
}
