import { Button, Card, Progress } from '@/components'
import { useThemeStore } from '@/stores/themeStore'
import { SunIcon, MoonIcon, FilmIcon, SparklesIcon, PaletteIcon } from '@/components/icons'

export function HomePage() {
  const { toggleTheme, isDark } = useThemeStore()

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Frame Flow X</h1>
            <p className="text-muted-foreground">
              Video-to-Frame Processing with AI Enhancement
            </p>
          </div>
          <Button 
            variant="bordered" 
            onClick={toggleTheme}
          >
            {isDark ? <SunIcon size={16} className="mr-2" /> : <MoonIcon size={16} className="mr-2" />}
            {isDark ? 'Light' : 'Dark'}
          </Button>
        </header>

        {/* Hero Section */}
        <section className="mb-16">
          <Card className="p-8" isHoverable>
            <h2 className="text-2xl font-semibold mb-4">
              Welcome to Frame Flow X
            </h2>
            <p className="text-muted-foreground mb-6">
              Transform your videos into cinematic frame sequences. Extract frames, 
              upscale with AI, apply enhancements, and choose from professional 
              cinematic presets.
            </p>
            <div className="flex gap-4">
              <Button size="lg" href="/workspace">
                Get Started
              </Button>
              <Button size="lg" variant="bordered">
                Learn More
              </Button>
            </div>
          </Card>
        </section>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6" isHoverable>
            <div className="flex items-center gap-3 mb-2">
              <FilmIcon size={24} className="text-primary" />
              <h3 className="text-lg font-semibold">Frame Extraction</h3>
            </div>
            <p className="text-muted-foreground">
              Extract high-quality frames from any video format with precise control
            </p>
          </Card>
          <Card className="p-6" isHoverable>
            <div className="flex items-center gap-3 mb-2">
              <SparklesIcon size={24} className="text-primary" />
              <h3 className="text-lg font-semibold">AI Upscaling</h3>
            </div>
            <p className="text-muted-foreground">
              Enhance resolution up to 4x with advanced AI models
            </p>
          </Card>
          <Card className="p-6" isHoverable>
            <div className="flex items-center gap-3 mb-2">
              <PaletteIcon size={24} className="text-primary" />
              <h3 className="text-lg font-semibold">Cinematic Presets</h3>
            </div>
            <p className="text-muted-foreground">
              Apply professional cinematic looks with one click
            </p>
          </Card>
        </section>

        {/* Progress Demo */}
        <section className="mb-16">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Processing Demo</h3>
            <Progress value={45} className="mb-4" />
            <Progress value={72} />
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center text-muted-foreground py-8">
          <p>Frame Flow X v0.1.0 • Built with shadcn/ui + Tailwind v4</p>
        </footer>
      </div>
    </div>
  )
}
