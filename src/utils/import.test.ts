import { describe, expect, it } from 'vitest'
import { parseMeasurementsCsv, parseMeasurementsJson, parseMeasurementsJsonImport } from './import'

describe('parseMeasurementsCsv', () => {
  it('parses csv and keeps latest duplicate date', () => {
    const csv = [
      'date,weightKg,bodyFatPercent,waterPercent,musclePercent,bmi,visceralFat,biologicalAge,createdAt,updatedAt',
      '2026-03-01,80,21,56,40,24.1,8,35,2026-03-01T00:00:00Z,2026-03-01T00:00:00Z',
      '2026-03-01,79.5,20.9,56.2,40.2,24.0,8,35,2026-03-01T00:00:00Z,2026-03-01T00:00:00Z',
      '2026-03-02,79,20.8,56.4,40.4,23.9,7.8,34,2026-03-02T00:00:00Z,2026-03-02T00:00:00Z',
    ].join('\n')

    const parsed = parseMeasurementsCsv(csv)

    expect(parsed).toHaveLength(2)
    expect(parsed[0].date).toBe('2026-03-01')
    expect(parsed[0].weightKg).toBe(79.5)
    expect(parsed[1].date).toBe('2026-03-02')
  })

  it('supports csv without bmi by using biologicalAge as fallback', () => {
    const csv = [
      'date,weightKg,bodyFatPercent,waterPercent,musclePercent,visceralFat,biologicalAge',
      '2026-03-01,80,21,56,40,8,35',
    ].join('\n')

    const parsed = parseMeasurementsCsv(csv)
    expect(parsed[0].bmi).toBe(35)
  })

  it('throws when required column is missing', () => {
    const csv = 'date,weightKg\n2026-03-01,80'
    expect(() => parseMeasurementsCsv(csv)).toThrow('CSV-Spalte fehlt: bodyFatPercent')
  })
})

describe('parseMeasurementsJson', () => {
  it('parses json array', () => {
    const json = JSON.stringify([
      {
        date: '2026-03-01',
        weightKg: 80,
        bodyFatPercent: 21,
        waterPercent: 56,
        musclePercent: 40,
        bmi: 24.1,
        visceralFat: 8,
        biologicalAge: 35,
      },
    ])

    const parsed = parseMeasurementsJson(json)

    expect(parsed).toHaveLength(1)
    expect(parsed[0].date).toBe('2026-03-01')
  })

  it('supports legacy json without bmi by using biologicalAge', () => {
    const json = JSON.stringify([
      {
        date: '2026-03-01',
        weightKg: 80,
        bodyFatPercent: 21,
        waterPercent: 56,
        musclePercent: 40,
        visceralFat: 8,
        biologicalAge: 35,
      },
    ])

    const parsed = parseMeasurementsJson(json)
    expect(parsed[0].bmi).toBe(35)
  })

  it('throws on invalid numeric value', () => {
    const json = JSON.stringify([
      {
        date: '2026-03-01',
        weightKg: 'invalid',
        bodyFatPercent: 21,
        waterPercent: 56,
        musclePercent: 40,
        bmi: 24.1,
        visceralFat: 8,
        biologicalAge: 35,
      },
    ])

    expect(() => parseMeasurementsJson(json)).toThrow('Zeile 1: Feld "weightKg" ist keine gültige Zahl.')
  })

  it('parses wrapped json payload with settings', () => {
    const json = JSON.stringify({
      settings: {
        language: 'en',
        theme: 'mono',
        trackedMetrics: ['weightKg', 'bmi'],
      },
      entries: [
        {
          date: '2026-03-01',
          weightKg: 80,
          bodyFatPercent: 21,
          waterPercent: 56,
          musclePercent: 40,
          bmi: 24.1,
          visceralFat: 8,
          biologicalAge: 35,
        },
      ],
    })

    const parsed = parseMeasurementsJsonImport(json)

    expect(parsed.entries).toHaveLength(1)
    expect(parsed.settings?.language).toBe('en')
    expect(parsed.settings?.theme).toBe('mono')
    expect(parsed.settings?.trackedMetrics).toEqual(['weightKg', 'bmi'])
  })
})
