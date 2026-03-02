import type { Measurement, MetricKey } from '../types/measurement'
import { shiftIsoDate } from './date'

export type MetricSnapshot = {
  current: number | null
  delta7: number | null
  delta30: number | null
}

function getReferenceValue(
  entries: Measurement[],
  metric: MetricKey,
  latestIndex: number,
  targetDate: string,
): number | null {
  for (let index = latestIndex - 1; index >= 0; index -= 1) {
    if (entries[index].date <= targetDate) {
      return entries[index][metric]
    }
  }

  return null
}

function calculateDelta(entries: Measurement[], metric: MetricKey, days: number): number | null {
  if (entries.length < 2) {
    return null
  }

  const latestIndex = entries.length - 1
  const latest = entries[latestIndex]
  const targetDate = shiftIsoDate(latest.date, -days)
  const referenceValue = getReferenceValue(entries, metric, latestIndex, targetDate)

  if (referenceValue === null) {
    return null
  }

  return latest[metric] - referenceValue
}

export function calculateMetricSnapshot(entries: Measurement[], metric: MetricKey): MetricSnapshot {
  if (entries.length === 0) {
    return { current: null, delta7: null, delta30: null }
  }

  const latestValue = entries[entries.length - 1][metric]

  return {
    current: latestValue,
    delta7: calculateDelta(entries, metric, 7),
    delta30: calculateDelta(entries, metric, 30),
  }
}
