import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { StepNumberField } from '../components/StepNumberField'
import { useMeasurements } from '../context/measurementsState'
import type { Measurement, MeasurementInput } from '../types/measurement'
import { formatIsoDate, toIsoDateLocal } from '../utils/date'
import { hasValidationErrors, validateMeasurementInput, type ValidationErrors } from '../utils/validation'

type EntryFormState = {
  date: string
  weightKg: string
  bodyFatPercent: string
  waterPercent: string
  musclePercent: string
  visceralFat: string
  biologicalAge: string
}

type FieldConfig = {
  key: keyof Omit<EntryFormState, 'date'>
  label: string
  unit: string
  step: number
  min?: number
  max?: number
}

const FIELD_CONFIGS: FieldConfig[] = [
  { key: 'weightKg', label: '1. Gewicht', unit: 'kg', step: 0.1, min: 0.1 },
  { key: 'bodyFatPercent', label: '2. Körperfett', unit: '%', step: 0.1, min: 0, max: 100 },
  { key: 'waterPercent', label: '3. Körperwasser', unit: '%', step: 0.1, min: 0, max: 100 },
  { key: 'musclePercent', label: '4. Muskelmasse', unit: '%', step: 0.1, min: 0, max: 100 },
  { key: 'visceralFat', label: '5. Viszeralfett', unit: 'Index', step: 0.1, min: 0 },
  { key: 'biologicalAge', label: '6. Biologisches Alter', unit: 'J', step: 1, min: 1, max: 130 },
]

function createDefaultFormState(date = toIsoDateLocal()): EntryFormState {
  return {
    date,
    weightKg: '',
    bodyFatPercent: '',
    waterPercent: '',
    musclePercent: '',
    visceralFat: '',
    biologicalAge: '',
  }
}

function toInputValue(value: number | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return ''
  }

  return String(value)
}

function mapMeasurementToFormState(measurement: Measurement, date = toIsoDateLocal()): EntryFormState {
  return {
    date,
    weightKg: String(measurement.weightKg),
    bodyFatPercent: String(measurement.bodyFatPercent),
    waterPercent: String(measurement.waterPercent),
    musclePercent: String(measurement.musclePercent),
    visceralFat: String(measurement.visceralFat),
    biologicalAge: toInputValue(measurement.biologicalAge),
  }
}

function toNumber(value: string): number {
  return Number(value.replace(',', '.').trim())
}

function formatStepValue(value: number): string {
  return value.toFixed(1).replace(/\.0$/, '')
}

function clamp(value: number, min?: number, max?: number): number {
  if (typeof min === 'number' && value < min) {
    return min
  }
  if (typeof max === 'number' && value > max) {
    return max
  }
  return value
}

export function EntryPage() {
  const { entries, saveEntry, isLoading } = useMeasurements()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formState, setFormState] = useState<EntryFormState>(createDefaultFormState())
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const editDate = searchParams.get('date')

  const latestEntry = entries.length > 0 ? entries[entries.length - 1] : undefined

  const existingEntry = useMemo(
    () => (editDate ? entries.find((entry) => entry.date === editDate) : undefined),
    [editDate, entries],
  )

  useEffect(() => {
    if (editDate) {
      if (!existingEntry) {
        return
      }

      setFormState(mapMeasurementToFormState(existingEntry, existingEntry.date))
      setErrors({})
      setHint(null)
      setIsDirty(false)
      return
    }

    if (isLoading || isDirty) {
      return
    }

    if (latestEntry) {
      setFormState(mapMeasurementToFormState(latestEntry))
      setHint(`Werte vom ${formatIsoDate(latestEntry.date)} wurden vorausgefüllt.`)
    } else {
      setFormState(createDefaultFormState())
      setHint('Erfasse deinen ersten Datensatz.')
    }

    setErrors({})
  }, [editDate, existingEntry, isDirty, isLoading, latestEntry])

  const handleChange = (field: keyof EntryFormState, value: string) => {
    setIsDirty(true)
    setFormState((previous) => ({ ...previous, [field]: value }))

    if (errors[field as keyof MeasurementInput]) {
      setErrors((previous) => ({ ...previous, [field]: undefined }))
    }
  }

  const handleStepChange = (field: FieldConfig, delta: number) => {
    setIsDirty(true)

    setFormState((previous) => {
      const currentValue = toNumber(previous[field.key])
      const baseValue = Number.isFinite(currentValue) ? currentValue : 0
      const adjustedValue = clamp(baseValue + delta, field.min, field.max)

      return {
        ...previous,
        [field.key]: formatStepValue(adjustedValue),
      }
    })

    if (errors[field.key as keyof MeasurementInput]) {
      setErrors((previous) => ({ ...previous, [field.key]: undefined }))
    }
  }

  const handleUseLatestValues = () => {
    if (!latestEntry) {
      return
    }

    setFormState(mapMeasurementToFormState(latestEntry))
    setIsDirty(true)
    setHint(`Vorwerte vom ${formatIsoDate(latestEntry.date)} übernommen.`)
    setErrors({})
  }

  const handleClear = () => {
    setFormState(createDefaultFormState())
    setIsDirty(true)
    setHint('Formular geleert.')
    setErrors({})
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    const parsedInput: MeasurementInput = {
      date: formState.date,
      weightKg: toNumber(formState.weightKg),
      bodyFatPercent: toNumber(formState.bodyFatPercent),
      waterPercent: toNumber(formState.waterPercent),
      musclePercent: toNumber(formState.musclePercent),
      visceralFat: toNumber(formState.visceralFat),
      biologicalAge: toNumber(formState.biologicalAge),
    }

    const validationErrors = validateMeasurementInput(parsedInput)
    setErrors(validationErrors)

    if (hasValidationErrors(validationErrors)) {
      return
    }

    setIsSaving(true)

    try {
      const result = await saveEntry(parsedInput)
      await navigate('/', {
        state: {
          flash: result === 'updated' ? 'Tageswert aktualisiert' : 'Eintrag gespeichert',
        },
      })
    } catch {
      setSubmitError('Eintrag konnte nicht gespeichert werden.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="space-y-4">
      <header className="rounded-3xl border border-teal-900/10 bg-white/95 p-5 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight">{editDate ? 'Eintrag bearbeiten' : 'Schnellerfassung'}</h2>
        <p className="mt-1 text-sm text-slate-600">
          Reihenfolge ist jetzt wie auf deiner Waage: kg, Körperfett, Wasser, Muskelmasse, Viszeralfett, biologisches Alter.
        </p>
        {hint ? <p className="mt-3 rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-900">{hint}</p> : null}
      </header>

      {editDate && !existingEntry && !isLoading ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Kein Eintrag für dieses Datum gefunden.
        </div>
      ) : null}

      {submitError ? (
        <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {submitError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-teal-900/10 bg-white/95 p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Datum</span>
            <input
              type="date"
              value={formState.date}
              onChange={(event) => handleChange('date', event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-3"
              required
            />
            {errors.date ? <span className="mt-1 block text-xs text-rose-700">{errors.date}</span> : null}
          </label>

          <button
            type="button"
            onClick={() => handleChange('date', toIsoDateLocal())}
            className="rounded-xl border border-slate-300 px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Heute
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="rounded-xl border border-slate-300 px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Leeren
          </button>
        </div>

        {!editDate && latestEntry ? (
          <button
            type="button"
            onClick={handleUseLatestValues}
            className="w-full rounded-xl border border-teal-300 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-900 hover:bg-teal-100"
          >
            Vorherige Werte übernehmen
          </button>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {FIELD_CONFIGS.map((field) => (
            <StepNumberField
              key={field.key}
              id={field.key}
              label={field.label}
              unit={field.unit}
              value={formState[field.key]}
              step={field.step}
              min={field.min}
              max={field.max}
              onValueChange={(value) => handleChange(field.key, value)}
              onStepChange={(delta) => handleStepChange(field, delta)}
              error={errors[field.key as keyof MeasurementInput]}
            />
          ))}
        </div>

        <div className="sticky bottom-16 z-20 rounded-2xl bg-white/95 p-2 backdrop-blur">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-xl bg-teal-700 px-4 py-3 text-base font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-teal-300"
          >
            {isSaving ? 'Speichere...' : editDate ? 'Aktualisieren' : 'Speichern'}
          </button>
        </div>

        <Link to="/history" className="block text-center text-sm font-semibold text-teal-700 hover:underline">
          Zum Verlauf
        </Link>
      </form>
    </section>
  )
}
