import type { MeasurementInput } from '../types/measurement'

export type ValidationErrors = Partial<Record<keyof MeasurementInput, string>>

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value)
}

export function validateMeasurementInput(input: MeasurementInput): ValidationErrors {
  const errors: ValidationErrors = {}

  if (!input.date) {
    errors.date = 'Datum ist erforderlich.'
  }
  if (!isFiniteNumber(input.weightKg) || !(input.weightKg > 0)) {
    errors.weightKg = 'Gewicht muss größer als 0 sein.'
  }
  if (!isFiniteNumber(input.bmi) || !(input.bmi > 0)) {
    errors.bmi = 'BMI muss größer als 0 sein.'
  }
  if (!isFiniteNumber(input.visceralFat) || !(input.visceralFat >= 0)) {
    errors.visceralFat = 'Viszeralfett muss mindestens 0 sein.'
  }

  const percentFields: Array<keyof Pick<
    MeasurementInput,
    'musclePercent' | 'bodyFatPercent' | 'waterPercent'
  >> = ['musclePercent', 'bodyFatPercent', 'waterPercent']

  for (const field of percentFields) {
    const value = input[field]
    if (!isFiniteNumber(value) || value < 0 || value > 100) {
      errors[field] = 'Wert muss zwischen 0 und 100 liegen.'
    }
  }

  return errors
}

export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}
