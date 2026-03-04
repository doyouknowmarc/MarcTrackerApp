import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { useAppLocale } from '../hooks/useAppLocale'
import { formatIsoDate, toIsoDateLocal } from '../utils/date'

export function AppShell() {
  const { messages } = useAppLocale()

  return (
    <div className="min-h-screen text-slate-900">
      <header className="mx-auto w-full max-w-3xl px-4 pb-4 pt-6">
        <div className="rounded-3xl border border-teal-900/10 bg-white/90 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-700">{messages.appName}</p>
              <h1 className="text-2xl font-bold tracking-tight">{messages.appTitle}</h1>
            </div>
            <div className="rounded-xl bg-teal-50 px-3 py-2 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">{messages.today}</p>
              <p className="text-sm font-semibold text-teal-900">{formatIsoDate(toIsoDateLocal())}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
