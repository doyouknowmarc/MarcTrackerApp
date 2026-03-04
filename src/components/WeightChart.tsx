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
import { useMeasurements } from '../context/measurementsState'
import { getMetricDecimals, getMetricUnit } from '../i18n/ui'
import { useAppLocale } from '../hooks/useAppLocale'
import { formatIsoDate } from '../utils/date'

type WeightChartProps = {
  entries: Measurement[]
  metric: MetricKey
}

export function WeightChart({ entries, metric }: WeightChartProps) {
  const { settings } = useMeasurements()
  const { language, messages } = useAppLocale()

  const chartData = entries.map((entry) => ({
    dateLabel: formatIsoDate(entry.date),
    value: entry[metric],
  }))

  const unit = getMetricUnit(metric, language)
  const decimals = getMetricDecimals(metric)
  const colors = {
    green: {
      line: '#0f766e',
      grid: '#cfe8e3',
      border: 'rgba(15, 118, 110, 0.12)',
      tooltipBorder: '#99cdc2',
    },
    mono: {
      line: '#111111',
      grid: '#d5d5d5',
      border: 'rgba(15, 23, 42, 0.2)',
      tooltipBorder: '#111111',
    },
    creative: {
      line: '#7c3aed',
      grid: '#d7c8ff',
      border: 'rgba(124, 58, 237, 0.2)',
      tooltipBorder: '#7c3aed',
    },
  }[settings.theme]

  if (chartData.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-teal-900/20 bg-white p-6 text-sm text-slate-600">
        {messages.noEntries}
      </div>
    )
  }

  return (
    <div className="h-64 w-full rounded-2xl border bg-white p-3 shadow-sm" style={{ borderColor: colors.border }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} minTickGap={20} />
          <YAxis tick={{ fontSize: 11 }} width={44} domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ borderRadius: 12, borderColor: colors.tooltipBorder }}
            formatter={(value) => {
              const numericValue =
                typeof value === 'number' ? value : Number.isFinite(Number(value)) ? Number(value) : 0
              return `${numericValue.toFixed(decimals)}${unit ? ` ${unit}` : ''}`
            }}
            labelFormatter={(label) => `${messages.date}: ${String(label)}`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={colors.line}
            strokeWidth={3}
            dot={{ r: 3, strokeWidth: 2, fill: colors.line }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
