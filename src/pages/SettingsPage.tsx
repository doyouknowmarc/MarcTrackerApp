import { useEffect, useMemo, useState } from 'react'
import { useMeasurements } from '../context/measurementsState'
import { formatTemplate, getMetricLabel, getThemeLabel } from '../i18n/ui'
import { useAppLocale } from '../hooks/useAppLocale'
import { METRIC_ORDER, type MetricKey } from '../types/measurement'
import type { AppLanguage, AppTheme } from '../types/settings'
import { toIsoDateLocal } from '../utils/date'
import { downloadTextFile } from '../utils/download'
import { parseMeasurementsCsv, parseMeasurementsJsonImport } from '../utils/import'

type StorageInfo = {
  isSupported: boolean
  usageBytes: number | null
  quotaBytes: number | null
  persisted: boolean | null
}

function formatBytes(bytes: number | null, unknownLabel: string): string {
  if (bytes === null || !Number.isFinite(bytes)) {
    return unknownLabel
  }

  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function detectFileFormat(file: File): 'csv' | 'json' {
  const loweredName = file.name.toLowerCase()

  if (loweredName.endsWith('.csv')) {
    return 'csv'
  }

  if (loweredName.endsWith('.json')) {
    return 'json'
  }

  if (file.type.includes('csv')) {
    return 'csv'
  }

  return 'json'
}

const LANGUAGE_OPTIONS: AppLanguage[] = ['de', 'en']
const THEME_OPTIONS: AppTheme[] = ['green', 'mono', 'creative']

function sortTrackedMetrics(metrics: MetricKey[]): MetricKey[] {
  const metricSet = new Set(metrics)
  return METRIC_ORDER.filter((metric) => metricSet.has(metric))
}

export function SettingsPage() {
  const { exportCsv, exportJson, importEntries, clearAllEntries, entries, updateSettings, settings } = useMeasurements()
  const { language, messages } = useAppLocale()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fileToImport, setFileToImport] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    isSupported: true,
    usageBytes: null,
    quotaBytes: null,
    persisted: null,
  })

  useEffect(() => {
    let isCancelled = false

    const loadStorageInfo = async () => {
      if (!('storage' in navigator) || !navigator.storage.estimate) {
        if (!isCancelled) {
          setStorageInfo({
            isSupported: false,
            usageBytes: null,
            quotaBytes: null,
            persisted: null,
          })
        }
        return
      }

      try {
        const [estimate, persisted] = await Promise.all([
          navigator.storage.estimate(),
          navigator.storage.persisted ? navigator.storage.persisted() : Promise.resolve(null),
        ])

        if (!isCancelled) {
          setStorageInfo({
            isSupported: true,
            usageBytes: estimate.usage ?? null,
            quotaBytes: estimate.quota ?? null,
            persisted,
          })
        }
      } catch {
        if (!isCancelled) {
          setStorageInfo({
            isSupported: false,
            usageBytes: null,
            quotaBytes: null,
            persisted: null,
          })
        }
      }
    }

    void loadStorageInfo()

    return () => {
      isCancelled = true
    }
  }, [entries.length])

  const usagePercent = useMemo(() => {
    if (storageInfo.usageBytes === null || storageInfo.quotaBytes === null || storageInfo.quotaBytes === 0) {
      return null
    }

    return Math.min(100, (storageInfo.usageBytes / storageInfo.quotaBytes) * 100)
  }, [storageInfo.quotaBytes, storageInfo.usageBytes])

  const trackedMetricSet = useMemo(() => new Set(settings.trackedMetrics), [settings.trackedMetrics])

  const handleLanguageChange = (nextLanguage: AppLanguage) => {
    if (nextLanguage === settings.language) {
      return
    }
    setError(null)
    updateSettings({
      language: nextLanguage,
      onboardingCompleted: true,
    })
  }

  const handleThemeChange = (nextTheme: AppTheme) => {
    if (nextTheme === settings.theme) {
      return
    }
    setError(null)
    updateSettings({
      theme: nextTheme,
      onboardingCompleted: true,
    })
  }

  const handleToggleMetric = (metric: MetricKey) => {
    const hasMetric = trackedMetricSet.has(metric)

    if (hasMetric && settings.trackedMetrics.length <= 1) {
      setError(messages.onboardingNeedMetric)
      return
    }

    const nextMetrics = hasMetric
      ? settings.trackedMetrics.filter((item) => item !== metric)
      : [...settings.trackedMetrics, metric]

    setError(null)
    updateSettings({
      trackedMetrics: sortTrackedMetrics(nextMetrics),
      onboardingCompleted: true,
    })
  }

  const exportData = async (format: 'csv' | 'json') => {
    setError(null)
    setSuccess(null)

    try {
      const content = format === 'csv' ? await exportCsv() : await exportJson()
      const dateSuffix = toIsoDateLocal()
      const filename = `trackerapp-${dateSuffix}.${format}`
      const mimeType = format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8'

      downloadTextFile(content, filename, mimeType)
      setSuccess(`${format.toUpperCase()} ${messages.exportDone}`)
    } catch {
      setError(messages.exportFailed)
    }
  }

  const handleImport = async () => {
    if (!fileToImport) {
      setError(messages.importNeedFile)
      setSuccess(null)
      return
    }

    setError(null)
    setSuccess(null)
    setIsImporting(true)

    try {
      const format = detectFileFormat(fileToImport)
      const rawContent = await fileToImport.text()
      const importPayload =
        format === 'csv'
          ? { entries: parseMeasurementsCsv(rawContent), settings: undefined }
          : parseMeasurementsJsonImport(rawContent)

      const summary = await importEntries(importPayload.entries)
      let successMessage = formatTemplate(messages.importSuccess, {
        imported: summary.imported,
        created: summary.created,
        updated: summary.updated,
      })

      if (importPayload.settings) {
        updateSettings({
          ...importPayload.settings,
          onboardingCompleted: true,
        })
        successMessage = `${successMessage} ${messages.importSettingsApplied}`
      }

      setSuccess(successMessage)
      setFileToImport(null)
      setFileInputKey((previous) => previous + 1)
    } catch (importError) {
      if (importError instanceof Error) {
        setError(importError.message)
      } else {
        setError(messages.importFailed)
      }
    } finally {
      setIsImporting(false)
    }
  }

  const handleDeleteAll = async () => {
    if (entries.length === 0) {
      setError(messages.noDataToDelete)
      setSuccess(null)
      return
    }

    const shouldDelete = window.confirm(messages.confirmDeleteAll)

    if (!shouldDelete) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      await clearAllEntries()
      setSuccess(messages.allDeleted)
    } catch {
      setError(messages.deleteFailed)
    }
  }

  return (
    <section className="space-y-4">
      <header className="rounded-3xl border border-teal-900/10 bg-white/95 p-5 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight">{messages.settingsTitle}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {messages.settingsHint}
        </p>
      </header>

      {error ? (
        <p className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
      ) : null}

      {success ? (
        <p className="rounded-xl border border-teal-300 bg-teal-50 px-3 py-2 text-sm text-teal-900">{success}</p>
      ) : null}

      <article className="rounded-3xl border border-teal-900/10 bg-white/95 p-4 shadow-sm">
        <h3 className="text-base font-bold">{messages.preferencesTitle}</h3>
        <p className="mt-1 text-sm text-slate-600">{messages.preferencesHint}</p>

        <div className="mt-4 space-y-4">
          <section>
            <p className="mb-2 text-sm font-semibold text-slate-700">{messages.onboardingLanguage}</p>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleLanguageChange(option)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    settings.language === option
                      ? 'border-teal-700 bg-teal-700 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {option === 'de' ? 'Deutsch' : 'English'}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-2 text-sm font-semibold text-slate-700">{messages.onboardingTheme}</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleThemeChange(option)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                    settings.theme === option
                      ? 'border-teal-700 bg-teal-50 text-teal-900'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {getThemeLabel(option, language)}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-2 text-sm font-semibold text-slate-700">{messages.onboardingTrackedMetrics}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {METRIC_ORDER.map((metric) => {
                const active = trackedMetricSet.has(metric)
                return (
                  <button
                    key={metric}
                    type="button"
                    onClick={() => handleToggleMetric(metric)}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      active
                        ? 'border-teal-700 bg-teal-50 text-teal-900'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{getMetricLabel(metric, language)}</span>
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {active ? (language === 'de' ? 'An' : 'On') : language === 'de' ? 'Aus' : 'Off'}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      </article>

      <article className="rounded-3xl border border-teal-900/10 bg-white/95 p-4 shadow-sm">
        <h3 className="text-base font-bold">{messages.storageTitle}</h3>
        <p className="mt-1 text-sm text-slate-600">
          {messages.storageHint}
        </p>

        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <p className="rounded-xl bg-slate-50 px-3 py-2">
            {messages.storageRecords}: <strong>{entries.length}</strong>
          </p>
          <p className="rounded-xl bg-slate-50 px-3 py-2">
            {messages.storageUsed}: <strong>{formatBytes(storageInfo.usageBytes, messages.storageUnknown)}</strong>
          </p>
          <p className="rounded-xl bg-slate-50 px-3 py-2">
            {messages.storageLimit}: <strong>{formatBytes(storageInfo.quotaBytes, messages.storageUnknown)}</strong>
          </p>
          <p className="rounded-xl bg-slate-50 px-3 py-2">
            {messages.storagePersistence}:{' '}
            <strong>
              {storageInfo.persisted === null
                ? messages.storageUnknown
                : storageInfo.persisted
                  ? messages.storageGuaranteed
                  : messages.storageNotGuaranteed}
            </strong>
          </p>
        </div>

        {usagePercent !== null ? (
          <div className="mt-3">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-teal-600" style={{ width: `${usagePercent}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {messages.storageUsagePercent}: {usagePercent.toFixed(1)} %
            </p>
          </div>
        ) : null}

        {!storageInfo.isSupported ? (
          <p className="mt-2 text-xs text-amber-700">
            {messages.storageStatsUnavailable}
          </p>
        ) : null}
      </article>

      <article className="rounded-3xl border border-teal-900/10 bg-white/95 p-4 shadow-sm">
        <h3 className="text-base font-bold">{messages.export}</h3>
        <p className="mt-1 text-sm text-slate-600">{messages.exportHint}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-600"
            onClick={() => void exportData('csv')}
          >
            CSV {messages.export}
          </button>
          <button
            type="button"
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            onClick={() => void exportData('json')}
          >
            JSON {messages.export}
          </button>
        </div>
      </article>

      <article className="rounded-3xl border border-teal-900/10 bg-white/95 p-4 shadow-sm">
        <h3 className="text-base font-bold">{messages.import}</h3>
        <p className="mt-1 text-sm text-slate-600">
          {messages.importHint}
        </p>
        <p className="mt-1 text-xs text-slate-500">{messages.importSupportsHint}</p>

        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">{messages.selectFile}</span>
            <input
              key={fileInputKey}
              type="file"
              accept=".csv,.json,text/csv,application/json"
              className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null
                setFileToImport(nextFile)
                setError(null)
                setSuccess(null)
              }}
            />
          </label>

          <button
            type="button"
            onClick={() => void handleImport()}
            disabled={isImporting}
            className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-amber-200"
          >
            {isImporting ? messages.importing : messages.importStart}
          </button>

          {fileToImport ? (
            <p className="text-xs text-slate-500">
              {messages.selectedFile}: {fileToImport.name} ({Math.max(1, Math.round(fileToImport.size / 1024))} KB)
            </p>
          ) : null}
        </div>
      </article>

      <article className="rounded-3xl border border-rose-200 bg-rose-50/60 p-4 shadow-sm">
        <h3 className="text-base font-bold text-rose-900">{messages.dangerZone}</h3>
        <p className="mt-1 text-sm text-rose-800">
          {messages.deleteAllHint}
        </p>
        <button
          type="button"
          onClick={() => void handleDeleteAll()}
          className="mt-3 w-full rounded-xl bg-rose-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          {messages.deleteAll}
        </button>
      </article>
    </section>
  )
}
