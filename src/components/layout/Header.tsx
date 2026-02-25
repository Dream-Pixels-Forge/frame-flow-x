import { Button } from '@/components'
import { ROUTES } from '@/config'
import { Link as RouterLink } from 'react-router-dom'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={`border-b bg-background ${className || ''}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold">Frame Flow X</h1>
          <nav className="flex gap-4">
            <Button variant="ghost" size="sm" as={RouterLink} to={ROUTES.HOME}>
              Home
            </Button>
            <Button variant="ghost" size="sm" as={RouterLink} to={ROUTES.WORKSPACE}>
              Workspace
            </Button>
            <Button variant="ghost" size="sm" as={RouterLink} to={ROUTES.SETTINGS}>
              Settings
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
