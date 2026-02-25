import { Button, Card, Input } from '@/components'

export function SettingsPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure your preferences
          </p>
        </header>

        <div className="space-y-6">
          <Card className="p-6" isHoverable>
            <h2 className="text-xl font-semibold mb-4">General</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Project Name</label>
                <Input
                  placeholder="My Project"
                  defaultValue="Frame Flow X"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Default Export Format</label>
                <Input
                  placeholder="PNG"
                  defaultValue="PNG"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6" isHoverable>
            <h2 className="text-xl font-semibold mb-4">Processing</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Max Video Size (MB)</label>
                <Input
                  type="number"
                  defaultValue="500"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Default Quality</label>
                <Input
                  placeholder="Balanced"
                  defaultValue="Balanced"
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button>Save Changes</Button>
            <Button variant="bordered" href="/">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
