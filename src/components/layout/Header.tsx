import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link } from '@heroui/react'
import { Button } from '@/components'
import { ROUTES } from '@/config'

interface HeaderProps {
  currentRoute?: string
}

export function Header({ currentRoute = '/' }: HeaderProps) {
  return (
    <Navbar 
      maxWidth="xl" 
      className="bg-background/80 backdrop-blur-md border-b border-border"
    >
      <NavbarBrand>
        <Link href={ROUTES.HOME} className="font-bold text-xl">
          <span className="text-primary">Frame</span>
          <span className="text-foreground">Flow</span>
          <span className="text-secondary">X</span>
        </Link>
      </NavbarBrand>

      <NavbarContent justify="center">
        <NavbarItem isActive={currentRoute === ROUTES.WORKSPACE}>
          <Button 
            variant="flat" 
            color={currentRoute === ROUTES.WORKSPACE ? 'primary' : 'default'}
            href={ROUTES.WORKSPACE}
          >
            Workspace
          </Button>
        </NavbarItem>
        <NavbarItem isActive={currentRoute === ROUTES.SETTINGS}>
          <Button 
            variant="flat" 
            color={currentRoute === ROUTES.SETTINGS ? 'primary' : 'default'}
            href={ROUTES.SETTINGS}
          >
            Settings
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Button variant="ghost" size="sm">
            Help
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  )
}
