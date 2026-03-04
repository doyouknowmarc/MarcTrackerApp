import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DexieMeasurementRepository } from '../data/measurementRepository'
import type { Measurement, MeasurementInput, MeasurementRepository, MetricKey } from '../types/measurement'
import { METRIC_ORDER } from '../types/measurement'
import type { AppSettings } from '../types/settings'
import {
  measurementsState,
  type ImportResult,
  type SaveResult,
} from './measurementsState'

const SETTINGS_STORAGE_KEY = 'trackerapp.settings.v1'

const DEFAULT_SETTINGS: AppSettings = {
  language: 'de',
  theme: 'green',
  trackedMetrics: [...METRIC_ORDER],
  onboardingCompleted: false,
}

type MeasurementsProviderProps = {
  children: ReactNode
  repository?: MeasurementRepository
}

function sanitizeTrackedMetrics(metrics: unknown): MetricKey[] {
  if (!Array.isArray(metrics)) {
    return [...METRIC_ORDER]
  }

  const allowedMetrics = new Set<MetricKey>(METRIC_ORDER)
  const filteredMetrics = metrics
    .filter((metric): metric is MetricKey => typeof metric === 'string' && allowedMetrics.has(metric as MetricKey))

  return filteredMetrics.length > 0 ? filteredMetrics : ['weightKg']
}

function sanitizeSettings(rawSettings: unknown): AppSettings {
  if (!rawSettings || typeof rawSettings !== 'object') {
    return { ...DEFAULT_SETTINGS }
  }

  const settings = rawSettings as Partial<AppSettings>

  return {
    language: settings.language === 'en' ? 'en' : 'de',
    theme: settings.theme === 'mono' || settings.theme === 'creative' ? settings.theme : 'green',
    trackedMetrics: sanitizeTrackedMetrics(settings.trackedMetrics),
    onboardingCompleted: Boolean(settings.onboardingCompleted),
  }
}

export function MeasurementsProvider({ children, repository }: MeasurementsProviderProps) {
  const repo = useMemo(() => repository ?? new DexieMeasurementRepository(), [repository])

  const [entries, setEntries] = useState<Measurement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSettingsReady, setIsSettingsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    try {
      const rawSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (!rawSettings) {
        setSettings({ ...DEFAULT_SETTINGS })
      } else {
        setSettings(sanitizeSettings(JSON.parse(rawSettings) as unknown))
      }
    } catch {
      setSettings({ ...DEFAULT_SETTINGS })
    } finally {
      setIsSettingsReady(true)
    }
  }, [])

  useEffect(() => {
    if (!isSettingsReady) {
      return
    }

    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    document.documentElement.dataset.theme = settings.theme
  }, [isSettingsReady, settings])

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

  const updateSettings = useCallback((nextSettings: Partial<AppSettings>) => {
    setSettings((previous) =>
      sanitizeSettings({
        ...previous,
        ...nextSettings,
        trackedMetrics: nextSettings.trackedMetrics ?? previous.trackedMetrics,
      }),
    )
  }, [])

  const completeOnboarding = useCallback((nextSettings: Omit<AppSettings, 'onboardingCompleted'>) => {
    setSettings(
      sanitizeSettings({
        ...nextSettings,
        onboardingCompleted: true,
      }),
    )
  }, [])

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

  const exportJson = useCallback(async (): Promise<string> => {
    const rawEntriesJson = await repo.exportJson()
    const parsedEntries = JSON.parse(rawEntriesJson) as Measurement[]

    return JSON.stringify(
      {
        version: 2,
        exportedAt: new Date().toISOString(),
        settings,
        entries: parsedEntries,
      },
      null,
      2,
    )
  }, [repo, settings])

  const value = useMemo(
    () => ({
      entries,
      error,
      isLoading,
      isSettingsReady,
      settings,
      refresh,
      saveEntry,
      importEntries,
      updateSettings,
      completeOnboarding,
      deleteEntry,
      clearAllEntries,
      exportCsv,
      exportJson,
    }),
    [
      clearAllEntries,
      completeOnboarding,
      deleteEntry,
      entries,
      error,
      exportCsv,
      exportJson,
      importEntries,
      isLoading,
      isSettingsReady,
      refresh,
      saveEntry,
      settings,
      updateSettings,
    ],
  )

  return <measurementsState.Provider value={value}>{children}</measurementsState.Provider>
}
