import { useEffect, useMemo, useState } from 'react'
import { useMeasurements } from '../context/measurementsState'
import { toIsoDateLocal } from '../utils/date'
import { downloadTextFile } from '../utils/download'
import { parseMeasurementsCsv, parseMeasurementsJson } from '../utils/import'

type StorageInfo = {
  isSupported: boolean
  usageBytes: number | null
  quotaBytes: number | null
  persisted: boolean | null
}

function formatBytes(bytes: number | null): string {
  if (bytes === null || !Number.isFinite(bytes)) {
    return 'Unbekannt'
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

export function SettingsPage() {
  const { exportCsv, exportJson, importEntries, clearAllEntries, entries } = useMeasurements()
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

  const exportData = async (format: 'csv' | 'json') => {
    setError(null)
    setSuccess(null)

    try {
      const content = format === 'csv' ? await exportCsv() : await exportJson()
      const dateSuffix = toIsoDateLocal()
      const filename = `marctracker-${dateSuffix}.${format}`
      const mimeType = format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8'

      downloadTextFile(content, filename, mimeType)
      setSuccess(`${format.toUpperCase()} wurde exportiert.`)
    } catch {
      setError('Export ist fehlgeschlagen.')
    }
  }

  const handleImport = async () => {
    if (!fileToImport) {
      setError('Bitte zuerst eine CSV- oder JSON-Datei auswählen.')
      setSuccess(null)
      return
    }

    setError(null)
    setSuccess(null)
    setIsImporting(true)

    try {
      const format = detectFileFormat(fileToImport)
      const rawContent = await fileToImport.text()
      const importedRecords =
        format === 'csv' ? parseMeasurementsCsv(rawContent) : parseMeasurementsJson(rawContent)

      const summary = await importEntries(importedRecords)

      setSuccess(
        `Import erfolgreich: ${summary.imported} Datensätze (${summary.created} neu, ${summary.updated} aktualisiert).`,
      )
      setFileToImport(null)
      setFileInputKey((previous) => previous + 1)
    } catch (importError) {
      if (importError instanceof Error) {
        setError(importError.message)
      } else {
        setError('Import ist fehlgeschlagen.')
      }
    } finally {
      setIsImporting(false)
    }
  }

  const handleDeleteAll = async () => {
    if (entries.length === 0) {
      setError('Es sind keine Daten zum Löschen vorhanden.')
      setSuccess(null)
      return
    }

    const shouldDelete = window.confirm(
      'Alle lokalen Datensätze unwiderruflich löschen? Dieser Schritt kann nicht rückgängig gemacht werden.',
    )

    if (!shouldDelete) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      await clearAllEntries()
      setSuccess('Alle lokalen Datensätze wurden gelöscht.')
    } catch {
      setError('Löschen ist fehlgeschlagen.')
    }
  }

  return (
    <section className="space-y-4">
      <header className="rounded-3xl border border-teal-900/10 bg-white/95 p-5 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight">Datenverwaltung</h2>
        <p className="mt-1 text-sm text-slate-600">
          Exportiere Backups oder importiere bestehende Datensätze aus CSV/JSON.
        </p>
      </header>

      {error ? (
        <p className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
      ) : null}

      {success ? (
        <p className="rounded-xl border border-teal-300 bg-teal-50 px-3 py-2 text-sm text-teal-900">{success}</p>
      ) : null}

      <article className="rounded-3xl border border-teal-900/10 bg-white/95 p-4 shadow-sm">
        <h3 className="text-base font-bold">Lokaler Speicher</h3>
        <p className="mt-1 text-sm text-slate-600">
          Deine Daten liegen in IndexedDB auf diesem Gerät und werden nicht in die Cloud synchronisiert.
        </p>

        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <p className="rounded-xl bg-slate-50 px-3 py-2">Datensätze: <strong>{entries.length}</strong></p>
          <p className="rounded-xl bg-slate-50 px-3 py-2">
            Belegt: <strong>{formatBytes(storageInfo.usageBytes)}</strong>
          </p>
          <p className="rounded-xl bg-slate-50 px-3 py-2">Limit: <strong>{formatBytes(storageInfo.quotaBytes)}</strong></p>
          <p className="rounded-xl bg-slate-50 px-3 py-2">
            Persistenz: <strong>{storageInfo.persisted === null ? 'Unbekannt' : storageInfo.persisted ? 'Aktiv' : 'Nicht zugesichert'}</strong>
          </p>
        </div>

        {usagePercent !== null ? (
          <div className="mt-3">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-teal-600" style={{ width: `${usagePercent}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-500">Speichernutzung: {usagePercent.toFixed(1)} %</p>
          </div>
        ) : null}

        {!storageInfo.isSupported ? (
          <p className="mt-2 text-xs text-amber-700">
            Browser liefert keine Storage-Statistiken. Exportiere regelmäßig als Backup.
          </p>
        ) : null}
      </article>

      <article className="rounded-3xl border border-teal-900/10 bg-white/95 p-4 shadow-sm">
        <h3 className="text-base font-bold">Export</h3>
        <p className="mt-1 text-sm text-slate-600">Speichere deine Daten lokal als Backup-Datei.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-600"
            onClick={() => void exportData('csv')}
          >
            CSV exportieren
          </button>
          <button
            type="button"
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            onClick={() => void exportData('json')}
          >
            JSON exportieren
          </button>
        </div>
      </article>

      <article className="rounded-3xl border border-teal-900/10 bg-white/95 p-4 shadow-sm">
        <h3 className="text-base font-bold">Import</h3>
        <p className="mt-1 text-sm text-slate-600">
          Unterstützt CSV aus MarcTracker-Export und JSON-Array mit denselben Feldern.
        </p>

        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Datei auswählen</span>
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
            {isImporting ? 'Importiere...' : 'Import starten'}
          </button>

          {fileToImport ? (
            <p className="text-xs text-slate-500">
              Ausgewählt: {fileToImport.name} ({Math.max(1, Math.round(fileToImport.size / 1024))} KB)
            </p>
          ) : null}
        </div>
      </article>

      <article className="rounded-3xl border border-rose-200 bg-rose-50/60 p-4 shadow-sm">
        <h3 className="text-base font-bold text-rose-900">Gefahrenzone</h3>
        <p className="mt-1 text-sm text-rose-800">
          Löscht alle aktuell lokal gespeicherten Messwerte aus IndexedDB.
        </p>
        <button
          type="button"
          onClick={() => void handleDeleteAll()}
          className="mt-3 w-full rounded-xl bg-rose-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          Alle lokalen Daten löschen
        </button>
      </article>
    </section>
  )
}
