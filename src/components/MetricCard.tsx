import type { MetricKey } from '../types/measurement'
import { METRIC_LABELS } from '../types/measurement'

type MetricCardProps = {
  metric: MetricKey
  current: number | null
  delta7: number | null
  delta30: number | null
}

function formatValue(metric: MetricKey, value: number | null): string {
  if (value === null) {
    return '–'
  }

  const { decimals, unit } = METRIC_LABELS[metric]
  return `${value.toFixed(decimals)}${unit ? ` ${unit}` : ''}`
}

function formatDelta(metric: MetricKey, value: number | null): string {
  if (value === null) {
    return 'Keine Vergleichsdaten'
  }

  const { decimals, unit } = METRIC_LABELS[metric]
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}${unit ? ` ${unit}` : ''}`
}

function deltaTone(value: number | null): string {
  if (value === null) {
    return 'text-slate-500'
  }

  if (value > 0) {
    return 'text-emerald-700'
  }

  if (value < 0) {
    return 'text-rose-700'
  }

  return 'text-slate-700'
}

export function MetricCard({ metric, current, delta7, delta30 }: MetricCardProps) {
  const metadata = METRIC_LABELS[metric]

  return (
    <article className="rounded-2xl border border-teal-900/10 bg-white/95 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-500">{metadata.label}</h3>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{formatValue(metric, current)}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <p className={`rounded-lg bg-slate-50 px-2 py-1 ${deltaTone(delta7)}`}>7T: {formatDelta(metric, delta7)}</p>
        <p className={`rounded-lg bg-slate-50 px-2 py-1 ${deltaTone(delta30)}`}>
          30T: {formatDelta(metric, delta30)}
        </p>
      </div>
    </article>
  )
}
