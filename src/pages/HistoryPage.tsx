import { Link } from 'react-router-dom'
import { useMeasurements } from '../context/measurementsState'
import { formatIsoDate } from '../utils/date'

export function HistoryPage() {
  const { entries, deleteEntry, isLoading, error } = useMeasurements()

  const reversedEntries = [...entries].reverse()

  const handleDelete = async (date: string) => {
    const shouldDelete = window.confirm(`Eintrag vom ${formatIsoDate(date)} wirklich löschen?`)
    if (!shouldDelete) {
      return
    }

    await deleteEntry(date)
  }

  return (
    <section className="space-y-4">
      <header className="rounded-3xl border border-teal-900/10 bg-white/95 p-5 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight">Verlauf</h2>
        <p className="mt-1 text-sm text-slate-600">
          Alle Tageswerte in umgekehrt chronologischer Reihenfolge.
        </p>
      </header>

      {error ? (
        <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</div>
      ) : null}

      {isLoading ? <p>Lade Verlauf...</p> : null}

      {!isLoading && reversedEntries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-teal-900/20 bg-white p-6 text-center text-sm text-slate-600">
          Noch keine Einträge vorhanden.
        </div>
      ) : null}

      <div className="space-y-3">
        {reversedEntries.map((entry) => (
          <article key={entry.date} className="rounded-3xl border border-teal-900/10 bg-white/95 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold tracking-tight">{formatIsoDate(entry.date)}</h3>
                <p className="text-sm font-semibold text-teal-700">{entry.weightKg.toFixed(1)} kg</p>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/entry?date=${entry.date}`}
                  className="rounded-lg bg-teal-100 px-3 py-2 text-xs font-semibold text-teal-900"
                >
                  Bearbeiten
                </Link>
                <button
                  type="button"
                  onClick={() => void handleDelete(entry.date)}
                  className="rounded-lg bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-800"
                >
                  Löschen
                </button>
              </div>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <dt className="text-slate-500">Körperfett</dt>
                <dd className="font-semibold">{entry.bodyFatPercent.toFixed(1)} %</dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <dt className="text-slate-500">Körperwasser</dt>
                <dd className="font-semibold">{entry.waterPercent.toFixed(1)} %</dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <dt className="text-slate-500">Muskelmasse</dt>
                <dd className="font-semibold">{entry.musclePercent.toFixed(1)} %</dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <dt className="text-slate-500">Viszeralfett</dt>
                <dd className="font-semibold">{entry.visceralFat.toFixed(1)}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <dt className="text-slate-500">Biologisches Alter</dt>
                <dd className="font-semibold">{entry.biologicalAge.toFixed(0)} J</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}
