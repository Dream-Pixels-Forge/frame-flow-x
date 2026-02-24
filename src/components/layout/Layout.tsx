import { ReactNode } from 'react'
import { Header } from './Header'

interface LayoutProps {
  children: ReactNode
  currentRoute?: string
}

export function Layout({ children, currentRoute = '/' }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header currentRoute={currentRoute} />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border py-6 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-muted-foreground">
          <p>© 2026 Frame Flow X. All rights reserved.</p>
          <p>v0.1.0</p>
        </div>
      </footer>
    </div>
  )
}
