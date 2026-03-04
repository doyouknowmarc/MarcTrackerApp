import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { MeasurementsProvider } from './context/MeasurementsContext'
import { useMeasurements } from './context/measurementsState'
import { useAppLocale } from './hooks/useAppLocale'
import { OnboardingPage } from './pages/OnboardingPage'

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

function PageLoader({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-teal-900/10 bg-white/90 p-6 text-sm font-medium text-slate-600 shadow-sm">
      {message}
    </div>
  )
}

function AppRoutes() {
  const { isSettingsReady, settings } = useMeasurements()
  const { messages } = useAppLocale()

  if (!isSettingsReady) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
        <PageLoader message={messages.pageLoading} />
      </main>
    )
  }

  if (!settings.onboardingCompleted) {
    return <OnboardingPage />
  }

  return (
    <Suspense fallback={<PageLoader message={messages.pageLoading} />}>
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
  )
}

function App() {
  return (
    <MeasurementsProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppRoutes />
      </BrowserRouter>
    </MeasurementsProvider>
  )
}

export default App
