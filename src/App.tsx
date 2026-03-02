import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { MeasurementsProvider } from './context/MeasurementsContext'

const DashboardPage = lazy(async () =>
  import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const EntryPage = lazy(async () =>
  import('./pages/EntryPage').then((module) => ({ default: module.EntryPage })),
)
const HistoryPage = lazy(async () =>
  import('./pages/HistoryPage').then((module) => ({ default: module.HistoryPage })),
)
const SettingsPage = lazy(async () =>
  import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
)

function PageLoader() {
  return (
    <div className="rounded-2xl border border-teal-900/10 bg-white/90 p-6 text-sm font-medium text-slate-600 shadow-sm">
      Lade Seite...
    </div>
  )
}

function App() {
  return (
    <MeasurementsProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/entry" element={<EntryPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </MeasurementsProvider>
  )
}

export default App
