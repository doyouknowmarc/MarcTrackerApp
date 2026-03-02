import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Measurement, MetricKey } from '../types/measurement'
import { METRIC_LABELS } from '../types/measurement'
import { formatIsoDate } from '../utils/date'

type WeightChartProps = {
  entries: Measurement[]
  metric: MetricKey
}

export function WeightChart({ entries, metric }: WeightChartProps) {
  const chartData = entries.map((entry) => ({
    dateLabel: formatIsoDate(entry.date),
    value: entry[metric],
  }))

  const metricMeta = METRIC_LABELS[metric]

  if (chartData.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-teal-900/20 bg-white p-6 text-sm text-slate-600">
        Noch keine Werte vorhanden.
      </div>
    )
  }

  return (
    <div className="h-64 w-full rounded-2xl border border-teal-900/10 bg-white p-3 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#cfe8e3" />
          <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} minTickGap={20} />
          <YAxis tick={{ fontSize: 11 }} width={44} domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ borderRadius: 12, borderColor: '#99cdc2' }}
            formatter={(value) => {
              const numericValue =
                typeof value === 'number' ? value : Number.isFinite(Number(value)) ? Number(value) : 0
              return `${numericValue.toFixed(metricMeta.decimals)}${metricMeta.unit ? ` ${metricMeta.unit}` : ''}`
            }}
            labelFormatter={(label) => `Datum: ${String(label)}`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0f766e"
            strokeWidth={3}
            dot={{ r: 3, strokeWidth: 2, fill: '#0f766e' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
