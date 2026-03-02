import type { Measurement, MeasurementInput, MeasurementRepository } from '../types/measurement'
import { appDb, type MarcTrackerDB } from './db'

const CSV_COLUMNS: Array<keyof Measurement> = [
  'date',
  'weightKg',
  'biologicalAge',
  'visceralFat',
  'musclePercent',
  'bodyFatPercent',
  'waterPercent',
  'createdAt',
  'updatedAt',
]

function escapeCsvValue(value: string | number): string {
  const valueString = String(value)
  if (valueString.includes(',') || valueString.includes('"') || valueString.includes('\n')) {
    return `"${valueString.replaceAll('"', '""')}"`
  }

  return valueString
}

export function serializeMeasurementsToCsv(measurements: Measurement[]): string {
  const header = CSV_COLUMNS.join(',')
  const rows = measurements.map((measurement) =>
    CSV_COLUMNS.map((column) => escapeCsvValue(measurement[column])).join(','),
  )

  return [header, ...rows].join('\n')
}

export function serializeMeasurementsToJson(measurements: Measurement[]): string {
  return JSON.stringify(measurements, null, 2)
}

export class DexieMeasurementRepository implements MeasurementRepository {
  private readonly db: MarcTrackerDB

  constructor(db: MarcTrackerDB = appDb) {
    this.db = db
  }

  async upsertByDate(entry: MeasurementInput): Promise<void> {
    const existing = await this.db.measurements.get(entry.date)
    const now = new Date().toISOString()

    const persisted: Measurement = {
      ...entry,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }

    await this.db.measurements.put(persisted)
  }

  async getByDate(date: string): Promise<Measurement | undefined> {
    return this.db.measurements.get(date)
  }

  async listAll(): Promise<Measurement[]> {
    const measurements = await this.db.measurements.toArray()
    return measurements.sort((left, right) => left.date.localeCompare(right.date))
  }

  async deleteByDate(date: string): Promise<void> {
    await this.db.measurements.delete(date)
  }

  async clearAll(): Promise<void> {
    await this.db.measurements.clear()
  }

  async exportCsv(): Promise<string> {
    const measurements = await this.listAll()
    return serializeMeasurementsToCsv(measurements)
  }

  async exportJson(): Promise<string> {
    const measurements = await this.listAll()
    return serializeMeasurementsToJson(measurements)
  }
}
