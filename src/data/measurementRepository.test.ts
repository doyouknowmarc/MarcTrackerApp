import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MarcTrackerDB } from './db'
import { DexieMeasurementRepository } from './measurementRepository'

let db: MarcTrackerDB
let repository: DexieMeasurementRepository

beforeEach(() => {
  db = new MarcTrackerDB(`MarcTrackerTest-${crypto.randomUUID()}`)
  repository = new DexieMeasurementRepository(db)
})

afterEach(async () => {
  await db.delete()
})

describe('DexieMeasurementRepository', () => {
  it('upserts by date and keeps createdAt while updating updatedAt', async () => {
    await repository.upsertByDate({
      date: '2026-03-01',
      weightKg: 80,
      biologicalAge: 35,
      visceralFat: 8,
      musclePercent: 40,
      bodyFatPercent: 21,
      waterPercent: 56,
    })

    const first = await repository.getByDate('2026-03-01')
    expect(first).toBeDefined()

    await repository.upsertByDate({
      date: '2026-03-01',
      weightKg: 79,
      biologicalAge: 34,
      visceralFat: 7.8,
      musclePercent: 40.5,
      bodyFatPercent: 20.5,
      waterPercent: 56.5,
    })

    const second = await repository.getByDate('2026-03-01')

    expect(second?.weightKg).toBe(79)
    expect(second?.createdAt).toBe(first?.createdAt)
    expect(second?.updatedAt).not.toBe(first?.updatedAt)
  })

  it('exports csv and json with required column order', async () => {
    await repository.upsertByDate({
      date: '2026-03-01',
      weightKg: 80,
      biologicalAge: 35,
      visceralFat: 8,
      musclePercent: 40,
      bodyFatPercent: 21,
      waterPercent: 56,
    })

    const csv = await repository.exportCsv()
    const json = await repository.exportJson()

    expect(csv.split('\n')[0]).toBe(
      'date,weightKg,biologicalAge,visceralFat,musclePercent,bodyFatPercent,waterPercent,createdAt,updatedAt',
    )
    expect(json).toContain('"date": "2026-03-01"')
  })

  it('deletes entries by date', async () => {
    await repository.upsertByDate({
      date: '2026-03-01',
      weightKg: 80,
      biologicalAge: 35,
      visceralFat: 8,
      musclePercent: 40,
      bodyFatPercent: 21,
      waterPercent: 56,
    })

    await repository.deleteByDate('2026-03-01')
    const deleted = await repository.getByDate('2026-03-01')

    expect(deleted).toBeUndefined()
  })

  it('clears all entries', async () => {
    await repository.upsertByDate({
      date: '2026-03-01',
      weightKg: 80,
      biologicalAge: 35,
      visceralFat: 8,
      musclePercent: 40,
      bodyFatPercent: 21,
      waterPercent: 56,
    })
    await repository.upsertByDate({
      date: '2026-03-02',
      weightKg: 79.5,
      biologicalAge: 34,
      visceralFat: 7.8,
      musclePercent: 40.2,
      bodyFatPercent: 20.9,
      waterPercent: 56.2,
    })

    await repository.clearAll()
    const allEntries = await repository.listAll()

    expect(allEntries).toHaveLength(0)
  })
})
