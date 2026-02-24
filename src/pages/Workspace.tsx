import { Button, Card } from '@/components'

export function WorkspacePage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Workspace</h1>
          <p className="text-muted-foreground">
            Import videos and start processing
          </p>
        </header>

        <Card className="p-12 text-center" isHoverable>
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">📁</div>
            <h2 className="text-xl font-semibold mb-2">
              Drop your video here
            </h2>
            <p className="text-muted-foreground mb-6">
              Support for MP4, MOV, AVI, MKV, WebM up to 500MB
            </p>
            <Button size="lg">
              Select Video
            </Button>
          </div>
        </Card>

        <div className="mt-8 flex gap-4">
          <Button variant="bordered" href="/">
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
