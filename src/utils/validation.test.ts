import { describe, expect, it } from 'vitest'
import type { MeasurementInput } from '../types/measurement'
import { validateMeasurementInput } from './validation'

function validInput(overrides: Partial<MeasurementInput> = {}): MeasurementInput {
  return {
    date: '2026-03-01',
    weightKg: 80,
    biologicalAge: 35,
    visceralFat: 8,
    musclePercent: 41,
    bodyFatPercent: 20,
    waterPercent: 55,
    ...overrides,
  }
}

describe('validateMeasurementInput', () => {
  it('returns no errors for valid input', () => {
    const errors = validateMeasurementInput(validInput())
    expect(errors).toEqual({})
  })

  it('flags out-of-range percentages', () => {
    const errors = validateMeasurementInput(validInput({ musclePercent: 101, waterPercent: -1 }))
    expect(errors.musclePercent).toBeDefined()
    expect(errors.waterPercent).toBeDefined()
  })

  it('flags invalid weight and biological age', () => {
    const errors = validateMeasurementInput(validInput({ weightKg: 0, biologicalAge: 0 }))
    expect(errors.weightKg).toBeDefined()
    expect(errors.biologicalAge).toBeDefined()
  })

  it('flags non-finite values', () => {
    const errors = validateMeasurementInput(validInput({ waterPercent: Number.NaN }))
    expect(errors.waterPercent).toBeDefined()
  })
})
