import { describe, expect, it } from 'vitest'
import { calculateMetricSnapshot } from './analytics'
import type { Measurement } from '../types/measurement'

const entries: Measurement[] = [
  {
    date: '2026-01-01',
    weightKg: 85,
    bmi: 25,
    visceralFat: 9,
    musclePercent: 39,
    bodyFatPercent: 22,
    waterPercent: 54,
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
  },
  {
    date: '2026-01-20',
    weightKg: 83,
    bmi: 24.5,
    visceralFat: 8,
    musclePercent: 40,
    bodyFatPercent: 21,
    waterPercent: 55,
    createdAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-01-20T10:00:00.000Z',
  },
  {
    date: '2026-02-05',
    weightKg: 82,
    bmi: 24.2,
    visceralFat: 8,
    musclePercent: 41,
    bodyFatPercent: 20,
    waterPercent: 56,
    createdAt: '2026-02-05T10:00:00.000Z',
    updatedAt: '2026-02-05T10:00:00.000Z',
  },
]

describe('calculateMetricSnapshot', () => {
  it('computes latest and nearest earlier deltas for 7 and 30 days', () => {
    const snapshot = calculateMetricSnapshot(entries, 'weightKg')

    expect(snapshot.current).toBe(82)
    expect(snapshot.delta7).toBe(-1)
    expect(snapshot.delta30).toBe(-3)
  })

  it('returns null deltas when no reference exists', () => {
    const snapshot = calculateMetricSnapshot(entries.slice(0, 1), 'bmi')

    expect(snapshot.current).toBe(25)
    expect(snapshot.delta7).toBeNull()
    expect(snapshot.delta30).toBeNull()
  })
})
