import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Card, Progress } from '@/components'
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
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleClose()}>
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
                    <div className="flex gap-2">
                      {([80, 90, 95, 100] as const).map((q) => (
                        <Button
                          key={q}
                          variant={options.quality === q ? 'solid' : 'bordered'}
                          size="sm"
                          onClick={() => setOptions({ quality: q })}
                        >
                          {q}%
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Naming Pattern */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      File Naming
                    </label>
                    <div className="flex gap-2">
                      {(['frame_001', 'video_name_001', 'custom'] as const).map((pattern) => (
                        <Button
                          key={pattern}
                          variant={options.namingPattern === pattern ? 'solid' : 'bordered'}
                          size="sm"
                          onClick={() => setOptions({ namingPattern: pattern })}
                        >
                          {pattern}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="flat" onClick={handleClose}>
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

                {/* Actions */}
                <div className="flex justify-end mt-4">
                  <Button color="danger" onClick={cancelExport}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Export Complete */}
          {result && !isExporting && (
            <Card>
              <h3 className="font-semibold mb-4">
                {result.success ? '✅ Export Complete!' : '❌ Export Failed'}
              </h3>

              {result.success ? (
                <div className="space-y-4">
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm text-success">
                      Successfully exported {result.files?.length || 0} frames
                    </p>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Size:</span>
                    <p className="font-medium">
                      {result.files?.reduce((acc, f) => acc + f.size, 0) || 0} bytes
                    </p>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Format:</span>
                    <p className="font-medium uppercase">{options.format}</p>
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
    </Dialog>
  )
}
