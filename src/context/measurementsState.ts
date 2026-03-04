import { createContext, useContext } from 'react'
import type { Measurement, MeasurementInput } from '../types/measurement'
import type { AppSettings } from '../types/settings'

export type SaveResult = 'created' | 'updated'
export type ImportResult = {
  imported: number
  created: number
  updated: number
}

export type MeasurementsContextValue = {
  entries: Measurement[]
  error: string | null
  isLoading: boolean
  isSettingsReady: boolean
  settings: AppSettings
  refresh: () => Promise<void>
  saveEntry: (entry: MeasurementInput) => Promise<SaveResult>
  importEntries: (entries: MeasurementInput[]) => Promise<ImportResult>
  updateSettings: (nextSettings: Partial<AppSettings>) => void
  completeOnboarding: (nextSettings: Omit<AppSettings, 'onboardingCompleted'>) => void
  deleteEntry: (date: string) => Promise<void>
  clearAllEntries: () => Promise<void>
  exportCsv: () => Promise<string>
  exportJson: () => Promise<string>
}

export const measurementsState = createContext<MeasurementsContextValue | undefined>(undefined)

export function useMeasurements(): MeasurementsContextValue {
  const context = useContext(measurementsState)
  if (!context) {
    throw new Error('useMeasurements must be used inside MeasurementsProvider.')
  }

  return context
}
