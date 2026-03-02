import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', short: 'DB' },
  { to: '/entry', label: 'Eintrag', short: 'IN' },
  { to: '/history', label: 'Verlauf', short: 'VH' },
  { to: '/settings', label: 'Daten', short: 'DT' },
]

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 px-3 py-3">
      <ul className="mx-auto grid max-w-3xl grid-cols-4 gap-2 rounded-2xl border border-teal-900/10 bg-white/90 p-2 shadow-lg backdrop-blur">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center rounded-xl px-2 py-2 text-[11px] font-semibold transition ${
                  isActive ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
              end={item.to === '/'}
            >
              <span className="text-[10px] font-bold tracking-[0.12em]">{item.short}</span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
