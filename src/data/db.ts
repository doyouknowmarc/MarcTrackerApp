import Dexie, { type Table } from 'dexie'
import type { Measurement } from '../types/measurement'

type LegacyMeasurementV1 = Measurement & {
  bmi?: number
  biologicalAge?: number
}

export class MarcTrackerDB extends Dexie {
  measurements!: Table<Measurement, string>

  constructor(name = 'MarcTrackerDB') {
    super(name)

    this.version(1).stores({
      measurements: '&date, updatedAt',
    })

    this.version(2)
      .stores({
        measurements: '&date, updatedAt',
      })
      .upgrade((transaction) =>
        transaction
          .table('measurements')
          .toCollection()
          .modify((entry: LegacyMeasurementV1) => {
            if (typeof entry.biologicalAge !== 'number') {
              entry.biologicalAge = typeof entry.bmi === 'number' ? entry.bmi : 0
            }
            delete entry.bmi
          }),
      )
  }
}

export const appDb = new MarcTrackerDB()
