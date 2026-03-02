import type { MeasurementInput } from '../types/measurement'
import { hasValidationErrors, validateMeasurementInput } from './validation'

const REQUIRED_COLUMNS: Array<keyof MeasurementInput> = [
  'date',
  'weightKg',
  'biologicalAge',
  'visceralFat',
  'musclePercent',
  'bodyFatPercent',
  'waterPercent',
]

type ImportRecord = Partial<Record<keyof MeasurementInput, unknown>> & {
  bmi?: unknown
}

function parseNumber(value: unknown, field: string, rowNumber: number): number {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error(`Zeile ${rowNumber}: Feld "${field}" ist keine gültige Zahl.`)
    }
    return value
  }

  if (typeof value !== 'string') {
    throw new Error(`Zeile ${rowNumber}: Feld "${field}" ist keine gültige Zahl.`)
  }

  const normalizedValue = value.replace(',', '.').trim()
  const parsedValue = Number(normalizedValue)

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`Zeile ${rowNumber}: Feld "${field}" ist keine gültige Zahl.`)
  }

  return parsedValue
}

function normalizeEntries(entries: MeasurementInput[]): MeasurementInput[] {
  const deduplicatedEntries = new Map<string, MeasurementInput>()

  for (const entry of entries) {
    deduplicatedEntries.set(entry.date, entry)
  }

  return [...deduplicatedEntries.values()].sort((left, right) => left.date.localeCompare(right.date))
}

function validateImportedEntry(entry: MeasurementInput, rowNumber: number): void {
  const errors = validateMeasurementInput(entry)
  if (hasValidationErrors(errors)) {
    const firstErrorMessage = Object.values(errors)[0]
    throw new Error(`Zeile ${rowNumber}: ${firstErrorMessage}`)
  }
}

function parseCsvRows(rawContent: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentCell = ''
  let insideQuotes = false

  const normalizedContent = rawContent.replace(/^\uFEFF/, '')

  for (let index = 0; index < normalizedContent.length; index += 1) {
    const character = normalizedContent[index]

    if (insideQuotes) {
      if (character === '"') {
        if (normalizedContent[index + 1] === '"') {
          currentCell += '"'
          index += 1
        } else {
          insideQuotes = false
        }
      } else {
        currentCell += character
      }
      continue
    }

    if (character === '"') {
      insideQuotes = true
      continue
    }

    if (character === ',') {
      currentRow.push(currentCell.trim())
      currentCell = ''
      continue
    }

    if (character === '\n') {
      currentRow.push(currentCell.trim())
      if (currentRow.some((cell) => cell !== '')) {
        rows.push(currentRow)
      }
      currentRow = []
      currentCell = ''
      continue
    }

    if (character !== '\r') {
      currentCell += character
    }
  }

  if (insideQuotes) {
    throw new Error('CSV enthält ein nicht geschlossenes Anführungszeichen.')
  }

  currentRow.push(currentCell.trim())
  if (currentRow.some((cell) => cell !== '')) {
    rows.push(currentRow)
  }

  return rows
}

function parseEntryFromRecord(record: ImportRecord, rowNumber: number) {
  const date = typeof record.date === 'string' ? record.date.trim() : ''
  const biologicalAgeValue = record.biologicalAge ?? record.bmi

  const entry: MeasurementInput = {
    date,
    weightKg: parseNumber(record.weightKg, 'weightKg', rowNumber),
    biologicalAge: parseNumber(biologicalAgeValue, 'biologicalAge', rowNumber),
    visceralFat: parseNumber(record.visceralFat, 'visceralFat', rowNumber),
    musclePercent: parseNumber(record.musclePercent, 'musclePercent', rowNumber),
    bodyFatPercent: parseNumber(record.bodyFatPercent, 'bodyFatPercent', rowNumber),
    waterPercent: parseNumber(record.waterPercent, 'waterPercent', rowNumber),
  }

  validateImportedEntry(entry, rowNumber)

  return entry
}

export function parseMeasurementsCsv(rawContent: string): MeasurementInput[] {
  const rows = parseCsvRows(rawContent)

  if (rows.length === 0) {
    throw new Error('CSV ist leer.')
  }

  const headers = rows[0].map((header) => header.trim())

  const requiredWithoutAge = REQUIRED_COLUMNS.filter((column) => column !== 'biologicalAge')
  for (const requiredColumn of requiredWithoutAge) {
    if (!headers.includes(requiredColumn)) {
      throw new Error(`CSV-Spalte fehlt: ${requiredColumn}`)
    }
  }

  if (!headers.includes('biologicalAge') && !headers.includes('bmi')) {
    throw new Error('CSV-Spalte fehlt: biologicalAge')
  }

  const columnLookup = new Map<string, number>()
  headers.forEach((header, index) => {
    columnLookup.set(header, index)
  })

  const importedEntries: MeasurementInput[] = []

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const rowNumber = rowIndex + 1
    const row = rows[rowIndex]

    const rowRecord: ImportRecord = {}
    for (const column of REQUIRED_COLUMNS) {
      if (column === 'biologicalAge' && !headers.includes('biologicalAge') && headers.includes('bmi')) {
        rowRecord.bmi = row[columnLookup.get('bmi') ?? -1] ?? ''
      } else {
        rowRecord[column] = row[columnLookup.get(column) ?? -1] ?? ''
      }
    }

    importedEntries.push(parseEntryFromRecord(rowRecord, rowNumber))
  }

  if (importedEntries.length === 0) {
    throw new Error('CSV enthält keine Datensätze.')
  }

  return normalizeEntries(importedEntries)
}

export function parseMeasurementsJson(rawContent: string): MeasurementInput[] {
  const parsed = JSON.parse(rawContent) as unknown

  if (!Array.isArray(parsed)) {
    throw new Error('JSON muss ein Array von Datensätzen enthalten.')
  }

  if (parsed.length === 0) {
    throw new Error('JSON enthält keine Datensätze.')
  }

  const importedEntries = parsed.map((row, index) => {
    if (typeof row !== 'object' || row === null) {
      throw new Error(`Zeile ${index + 1}: Ungültiges Objekt.`)
    }

    const rowObject = row as ImportRecord
    return parseEntryFromRecord(rowObject, index + 1)
  })

  return normalizeEntries(importedEntries)
}
