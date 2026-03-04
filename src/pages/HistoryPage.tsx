import { Link } from 'react-router-dom'
import { useMeasurements } from '../context/measurementsState'
import { formatTemplate, getMetricDecimals, getMetricLabel, getMetricUnit } from '../i18n/ui'
import { useAppLocale } from '../hooks/useAppLocale'
import { METRIC_ORDER } from '../types/measurement'
import { formatIsoDate } from '../utils/date'

export function HistoryPage() {
  const { entries, deleteEntry, isLoading, error, settings } = useMeasurements()
  const { language, messages } = useAppLocale()

  const reversedEntries = [...entries].reverse()
  const visibleMetrics = METRIC_ORDER.filter((metric) => settings.trackedMetrics.includes(metric))
  const summaryMetric = visibleMetrics.includes('weightKg') ? 'weightKg' : (visibleMetrics[0] ?? 'weightKg')

  const handleDelete = async (date: string) => {
    const shouldDelete = window.confirm(formatTemplate(messages.confirmDelete, { date: formatIsoDate(date) }))
    if (!shouldDelete) {
      return
    }

    await deleteEntry(date)
  }

  return (
    <section className="space-y-4">
      <header className="rounded-3xl border border-teal-900/10 bg-white/95 p-5 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight">{messages.historyTitle}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {messages.historyHint}
        </p>
      </header>

      {error ? (
        <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</div>
      ) : null}

      {isLoading ? <p>{messages.loadingHistory}</p> : null}

      {!isLoading && reversedEntries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-teal-900/20 bg-white p-6 text-center text-sm text-slate-600">
          {messages.noEntries}
        </div>
      ) : null}

      <div className="space-y-3">
        {reversedEntries.map((entry) => (
          <article key={entry.date} className="rounded-3xl border border-teal-900/10 bg-white/95 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold tracking-tight">{formatIsoDate(entry.date)}</h3>
                <p className="text-sm font-semibold text-teal-700">
                  {entry[summaryMetric].toFixed(getMetricDecimals(summaryMetric))}
                  {getMetricUnit(summaryMetric, language) ? ` ${getMetricUnit(summaryMetric, language)}` : ''}
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/entry?date=${entry.date}`}
                  className="rounded-lg bg-teal-100 px-3 py-2 text-xs font-semibold text-teal-900"
                >
                  {messages.edit}
                </Link>
                <button
                  type="button"
                  onClick={() => void handleDelete(entry.date)}
                  className="rounded-lg bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-800"
                >
                  {messages.delete}
                </button>
              </div>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              {visibleMetrics.map((metric) => (
                <div key={`${entry.date}-${metric}`} className="rounded-xl bg-slate-50 px-3 py-2">
                  <dt className="text-slate-500">{getMetricLabel(metric, language)}</dt>
                  <dd className="font-semibold">
                    {entry[metric].toFixed(getMetricDecimals(metric))}
                    {getMetricUnit(metric, language) ? ` ${getMetricUnit(metric, language)}` : ''}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}
