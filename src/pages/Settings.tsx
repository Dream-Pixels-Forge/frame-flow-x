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
              <Input 
                label="Project Name" 
                placeholder="My Project"
                defaultValue="Frame Flow X"
              />
              <Input 
                label="Default Export Format" 
                placeholder="PNG"
                defaultValue="PNG"
              />
            </div>
          </Card>

          <Card className="p-6" isHoverable>
            <h2 className="text-xl font-semibold mb-4">Processing</h2>
            <div className="space-y-4">
              <Input 
                label="Max Video Size (MB)" 
                type="number"
                defaultValue="500"
              />
              <Input 
                label="Default Quality" 
                placeholder="Balanced"
                defaultValue="Balanced"
              />
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
