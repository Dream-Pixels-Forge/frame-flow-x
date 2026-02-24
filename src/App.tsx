import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components'
import { Layout } from '@/components/layout'
import { HomePage } from '@/pages/Home'
import { WorkspacePage } from '@/pages/Workspace'
import { SettingsPage } from '@/pages/Settings'
import { NotFoundPage } from '@/pages/NotFound'
import { ROUTES } from '@/config'

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route
            path={ROUTES.HOME}
            element={<Layout currentRoute={ROUTES.HOME}><HomePage /></Layout>}
          />
          <Route
            path={ROUTES.WORKSPACE}
            element={<Layout currentRoute={ROUTES.WORKSPACE}><WorkspacePage /></Layout>}
          />
          <Route
            path={ROUTES.SETTINGS}
            element={<Layout currentRoute={ROUTES.SETTINGS}><SettingsPage /></Layout>}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
