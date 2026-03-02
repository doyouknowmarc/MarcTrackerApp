import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DexieMeasurementRepository } from '../data/measurementRepository'
import type { Measurement, MeasurementInput, MeasurementRepository } from '../types/measurement'
import {
  measurementsState,
  type ImportResult,
  type SaveResult,
} from './measurementsState'

type MeasurementsProviderProps = {
  children: ReactNode
  repository?: MeasurementRepository
}

export function MeasurementsProvider({ children, repository }: MeasurementsProviderProps) {
  const repo = useMemo(() => repository ?? new DexieMeasurementRepository(), [repository])

  const [entries, setEntries] = useState<Measurement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const values = await repo.listAll()
      setEntries(values)
    } catch {
      setError('Daten konnten nicht geladen werden.')
    } finally {
      setIsLoading(false)
    }
  }, [repo])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const saveEntry = useCallback(
    async (entry: MeasurementInput): Promise<SaveResult> => {
      setError(null)

      const existing = await repo.getByDate(entry.date)
      await repo.upsertByDate(entry)
      await refresh()

      return existing ? 'updated' : 'created'
    },
    [refresh, repo],
  )

  const importEntries = useCallback(
    async (entriesToImport: MeasurementInput[]): Promise<ImportResult> => {
      setError(null)
      let created = 0
      let updated = 0

      for (const entry of entriesToImport) {
        const existing = await repo.getByDate(entry.date)
        await repo.upsertByDate(entry)
        if (existing) {
          updated += 1
        } else {
          created += 1
        }
      }

      await refresh()

      return {
        imported: created + updated,
        created,
        updated,
      }
    },
    [refresh, repo],
  )

  const deleteEntry = useCallback(
    async (date: string): Promise<void> => {
      setError(null)
      await repo.deleteByDate(date)
      await refresh()
    },
    [refresh, repo],
  )

  const clearAllEntries = useCallback(async (): Promise<void> => {
    setError(null)
    await repo.clearAll()
    await refresh()
  }, [refresh, repo])

  const exportCsv = useCallback(async (): Promise<string> => repo.exportCsv(), [repo])
  const exportJson = useCallback(async (): Promise<string> => repo.exportJson(), [repo])

  const value = useMemo(
    () => ({
      entries,
      error,
      isLoading,
      refresh,
      saveEntry,
      importEntries,
      deleteEntry,
      clearAllEntries,
      exportCsv,
      exportJson,
    }),
    [
      clearAllEntries,
      deleteEntry,
      entries,
      error,
      exportCsv,
      exportJson,
      importEntries,
      isLoading,
      refresh,
      saveEntry,
    ],
  )

  return <measurementsState.Provider value={value}>{children}</measurementsState.Provider>
}
