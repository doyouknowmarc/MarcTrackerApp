import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MetricCard } from '../components/MetricCard'
import { useMeasurements } from '../context/measurementsState'
import { METRIC_LABELS, METRIC_ORDER, type MetricKey } from '../types/measurement'
import { calculateMetricSnapshot } from '../utils/analytics'
import { formatIsoDate } from '../utils/date'

type DashboardLocationState = {
  flash?: string
}

const WeightChart = lazy(async () =>
  import('../components/WeightChart').then((module) => ({ default: module.WeightChart })),
)

function formatMetricValue(metric: MetricKey, value: number): string {
  const metadata = METRIC_LABELS[metric]
  return `${value.toFixed(metadata.decimals)}${metadata.unit ? ` ${metadata.unit}` : ''}`
}

export function DashboardPage() {
  const { entries, error, isLoading } = useMeasurements()
  const navigate = useNavigate()
  const location = useLocation()
  const flash = (location.state as DashboardLocationState | null)?.flash ?? null
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('weightKg')

  useEffect(() => {
    if (!flash) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      void navigate(location.pathname, { replace: true, state: null })
    }, 2500)

    return () => window.clearTimeout(timeoutId)
  }, [flash, location.pathname, navigate])

  const latestEntry = entries.length > 0 ? entries[entries.length - 1] : null

  const snapshots = useMemo(
    () =>
      METRIC_ORDER.map((metric) => ({
        metric,
        ...calculateMetricSnapshot(entries, metric),
      })),
    [entries],
  )

  const selectedMetricMeta = METRIC_LABELS[selectedMetric]
  const selectedLatestValue = latestEntry ? latestEntry[selectedMetric] : null

  return (
    <section className="space-y-5">
      {flash ? (
        <p className="rounded-xl border border-teal-700/20 bg-teal-100 px-3 py-2 text-sm font-medium text-teal-900">
          {flash}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
      ) : null}

      <article className="overflow-hidden rounded-3xl border border-teal-900/10 bg-white/95 shadow-sm">
        <div className="bg-gradient-to-r from-teal-700 to-teal-600 px-4 py-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight">{selectedMetricMeta.label} Trend</h2>
              <p className="text-sm text-teal-50">
                {latestEntry
                  ? `Letzter Eintrag am ${formatIsoDate(latestEntry.date)}`
                  : 'Starte mit deinem ersten Eintrag für eine Verlaufskurve.'}
              </p>
            </div>
            <Link
              to="/entry"
              className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
            >
              Eintrag erfassen
            </Link>
          </div>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            {selectedLatestValue !== null ? (
              <p className="text-3xl font-bold tracking-tight">{formatMetricValue(selectedMetric, selectedLatestValue)}</p>
            ) : (
              <p className="text-sm text-teal-50">Noch kein Wert vorhanden.</p>
            )}

            <label className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-teal-50">Metrik</span>
              <select
                value={selectedMetric}
                onChange={(event) => setSelectedMetric(event.target.value as MetricKey)}
                className="rounded-lg border border-white/30 bg-white/20 px-2 py-1 text-sm font-semibold text-white backdrop-blur focus:outline-none"
              >
                {METRIC_ORDER.map((metric) => (
                  <option key={metric} value={metric} className="text-slate-900">
                    {METRIC_LABELS[metric].label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <p>Lade Daten...</p>
          ) : (
            <Suspense fallback={<p>Diagramm wird geladen...</p>}>
              <WeightChart entries={entries} metric={selectedMetric} />
            </Suspense>
          )}
        </div>
      </article>

      <article>
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="text-lg font-bold">Körperwerte</h2>
          <Link to="/history" className="text-sm font-semibold text-teal-700 hover:underline">
            Verlauf ansehen
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {snapshots.map((snapshot) => (
            <MetricCard
              key={snapshot.metric}
              metric={snapshot.metric}
              current={snapshot.current}
              delta7={snapshot.delta7}
              delta30={snapshot.delta30}
            />
          ))}
        </div>
      </article>
    </section>
  )
}
