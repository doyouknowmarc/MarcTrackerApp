import { describe, expect, it } from 'vitest'
import { parseMeasurementsCsv, parseMeasurementsJson } from './import'

describe('parseMeasurementsCsv', () => {
  it('parses csv and keeps latest duplicate date', () => {
    const csv = [
      'date,weightKg,biologicalAge,visceralFat,musclePercent,bodyFatPercent,waterPercent,createdAt,updatedAt',
      '2026-03-01,80,35,8,40,21,56,2026-03-01T00:00:00Z,2026-03-01T00:00:00Z',
      '2026-03-01,79.5,35,8,40.2,20.9,56.2,2026-03-01T00:00:00Z,2026-03-01T00:00:00Z',
      '2026-03-02,79,34,7.8,40.4,20.8,56.4,2026-03-02T00:00:00Z,2026-03-02T00:00:00Z',
    ].join('\n')

    const parsed = parseMeasurementsCsv(csv)

    expect(parsed).toHaveLength(2)
    expect(parsed[0].date).toBe('2026-03-01')
    expect(parsed[0].weightKg).toBe(79.5)
    expect(parsed[1].date).toBe('2026-03-02')
  })

  it('supports legacy bmi column by mapping it to biologicalAge', () => {
    const csv = [
      'date,weightKg,bmi,visceralFat,musclePercent,bodyFatPercent,waterPercent',
      '2026-03-01,80,35,8,40,21,56',
    ].join('\n')

    const parsed = parseMeasurementsCsv(csv)
    expect(parsed[0].biologicalAge).toBe(35)
  })

  it('throws when required column is missing', () => {
    const csv = 'date,weightKg\n2026-03-01,80'
    expect(() => parseMeasurementsCsv(csv)).toThrow('CSV-Spalte fehlt: visceralFat')
  })
})

describe('parseMeasurementsJson', () => {
  it('parses json array', () => {
    const json = JSON.stringify([
      {
        date: '2026-03-01',
        weightKg: 80,
        biologicalAge: 35,
        visceralFat: 8,
        musclePercent: 40,
        bodyFatPercent: 21,
        waterPercent: 56,
      },
    ])

    const parsed = parseMeasurementsJson(json)

    expect(parsed).toHaveLength(1)
    expect(parsed[0].date).toBe('2026-03-01')
  })

  it('supports legacy bmi field in json', () => {
    const json = JSON.stringify([
      {
        date: '2026-03-01',
        weightKg: 80,
        bmi: 35,
        visceralFat: 8,
        musclePercent: 40,
        bodyFatPercent: 21,
        waterPercent: 56,
      },
    ])

    const parsed = parseMeasurementsJson(json)
    expect(parsed[0].biologicalAge).toBe(35)
  })

  it('throws on invalid numeric value', () => {
    const json = JSON.stringify([
      {
        date: '2026-03-01',
        weightKg: 'invalid',
        biologicalAge: 35,
        visceralFat: 8,
        musclePercent: 40,
        bodyFatPercent: 21,
        waterPercent: 56,
      },
    ])

    expect(() => parseMeasurementsJson(json)).toThrow('Zeile 1: Feld "weightKg" ist keine gültige Zahl.')
  })
})
