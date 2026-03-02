import Dexie, { type Table } from 'dexie'
import type { Measurement } from '../types/measurement'

export class MarcTrackerDB extends Dexie {
  measurements!: Table<Measurement, string>

  constructor(name = 'MarcTrackerDB') {
    super(name)

    this.version(1).stores({
      measurements: '&date, updatedAt',
    })
  }
}

export const appDb = new MarcTrackerDB()
