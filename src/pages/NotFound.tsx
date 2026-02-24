import { Button, Card } from '@/components'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="p-12 text-center max-w-md" isHoverable>
        <div className="text-6xl mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button as={Link} to="/">
          Go Home
        </Button>
      </Card>
    </div>
  )
}
