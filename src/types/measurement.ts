export type Measurement = {
  date: string
  weightKg: number
  bodyFatPercent: number
  waterPercent: number
  musclePercent: number
  bmi: number
  visceralFat: number
  biologicalAge: number
  createdAt: string
  updatedAt: string
}

export type MetricKey =
  | 'weightKg'
  | 'bodyFatPercent'
  | 'waterPercent'
  | 'musclePercent'
  | 'bmi'
  | 'visceralFat'
  | 'biologicalAge'

export type MeasurementInput = Omit<Measurement, 'createdAt' | 'updatedAt'>

export interface MeasurementRepository {
  upsertByDate(entry: Omit<Measurement, 'createdAt' | 'updatedAt'>): Promise<void>
  getByDate(date: string): Promise<Measurement | undefined>
  listAll(): Promise<Measurement[]>
  deleteByDate(date: string): Promise<void>
  clearAll(): Promise<void>
  exportCsv(): Promise<string>
  exportJson(): Promise<string>
}

export const METRIC_ORDER: MetricKey[] = [
  'weightKg',
  'bodyFatPercent',
  'waterPercent',
  'musclePercent',
  'bmi',
  'visceralFat',
  'biologicalAge',
]

export const METRIC_LABELS: Record<MetricKey, { label: string; unit: string; decimals: number }> = {
  weightKg: { label: 'Gewicht', unit: 'kg', decimals: 1 },
  bodyFatPercent: { label: 'Körperfett', unit: '%', decimals: 1 },
  waterPercent: { label: 'Körperwasser', unit: '%', decimals: 1 },
  musclePercent: { label: 'Muskelmasse', unit: '%', decimals: 1 },
  bmi: { label: 'BMI', unit: '', decimals: 1 },
  visceralFat: { label: 'Viszeralfett', unit: 'Index', decimals: 1 },
  biologicalAge: { label: 'Biologisches Alter', unit: 'J', decimals: 0 },
}
