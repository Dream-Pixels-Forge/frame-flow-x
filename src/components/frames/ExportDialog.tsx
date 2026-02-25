import { Modal, Button, Card, Progress } from '@/components'
import { useExportStore } from '@/stores/exportStore'
import { useFrameGalleryStore } from '@/stores/frameGalleryStore'
import { downloadFiles } from '@/utils/frameExporter'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const options = useExportStore((state) => state.options)
  const isExporting = useExportStore((state) => state.isExporting)
  const progress = useExportStore((state) => state.progress)
  const result = useExportStore((state) => state.result)
  
  const setOptions = useExportStore((state) => state.setOptions)
  const startExport = useExportStore((state) => state.startExport)
  const cancelExport = useExportStore((state) => state.cancelExport)
  const clearResult = useExportStore((state) => state.clearResult)
  
  const frames = useFrameGalleryStore((state) => state.frames)
  const selectedFrameIds = useFrameGalleryStore((state) => state.selectedFrameIds)

  const handleStartExport = async () => {
    await startExport(frames, selectedFrameIds, options)
  }

  const handleDownload = () => {
    if (result?.files) {
      downloadFiles(result.files)
    }
  }

  const handleClose = () => {
    clearResult()
    onClose()
  }

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Frames</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Export Settings */}
          {!isExporting && !result && (
          <>
            <Card isHoverable>
              <h3 className="font-semibold mb-4">Export Settings</h3>
              
              <div className="space-y-4">
                {/* Format Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Output Format
                  </label>
                  <div className="flex gap-2">
                    {(['png', 'jpeg', 'webp'] as const).map((format) => (
                      <Button
                        key={format}
                        variant={options.format === format ? 'solid' : 'bordered'}
                        size="sm"
                        onClick={() => setOptions({ format })}
                      >
                        {format.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Quality */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Quality: {options.quality}%
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={options.quality}
                    onChange={(e) => setOptions({ quality: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Naming Pattern */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    File Naming Pattern
                  </label>
                  <input
                    type="text"
                    value={options.namingPattern}
                    onChange={(e) => setOptions({ namingPattern: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="frame_{index}"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {'{index}'}, {'{timestamp}'}, {'{frame}'}, {'{format}'}
                  </p>
                </div>

                {/* ZIP Export */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="zipExport"
                    checked={options.zipExport}
                    onChange={(e) => setOptions({ zipExport: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="zipExport" className="text-sm">
                    Export as ZIP archive
                  </label>
                </div>

                {/* Frame count info */}
                <div className="text-sm text-muted-foreground">
                  {selectedFrameIds.length > 0
                    ? `Exporting ${selectedFrameIds.length} selected frames`
                    : `Exporting all ${frames.length} frames`}
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="flat" onClick={onClose}>
                Cancel
              </Button>
              <Button color="primary" onClick={handleStartExport}>
                📥 Export
              </Button>
            </div>
          </>
        )}

        {/* Export Progress */}
        {isExporting && (
          <Card>
            <h3 className="font-semibold mb-4">Exporting...</h3>
            
            <div className="space-y-4">
              <Progress value={progress.percentage} />
              
              <div className="flex justify-between text-sm">
                <span>{progress.message}</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end mt-4">
              <Button color="danger" onClick={cancelExport}>
                Cancel Export
              </Button>
            </div>
          </Card>
        )}

        {/* Export Complete */}
        {result && (
          <Card>
            <h3 className="font-semibold mb-4">
              {result.success ? '✅ Export Complete' : '❌ Export Failed'}
            </h3>
            
            {result.success ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Files:</span>
                    <p className="font-medium">{result.files.length}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Size:</span>
                    <p className="font-medium">{(result.totalSize / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{(result.duration / 1000).toFixed(1)}s</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Format:</span>
                    <p className="font-medium uppercase">{options.format}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="flat" onClick={handleClose}>
                    Close
                  </Button>
                  <Button color="primary" onClick={handleDownload}>
                    📥 Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg">
                  <p className="text-sm text-danger">{result.error || 'Export failed'}</p>
                </div>

                <div className="flex justify-end">
                  <Button variant="flat" onClick={handleClose}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
      </DialogContent>
    </Modal>
  )
}
