export type Measurement = {
  date: string
  weightKg: number
  bmi: number
  visceralFat: number
  musclePercent: number
  bodyFatPercent: number
  waterPercent: number
  createdAt: string
  updatedAt: string
}

export type MetricKey =
  | 'weightKg'
  | 'bmi'
  | 'visceralFat'
  | 'musclePercent'
  | 'bodyFatPercent'
  | 'waterPercent'

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
  'bmi',
  'visceralFat',
  'musclePercent',
  'bodyFatPercent',
  'waterPercent',
]

export const METRIC_LABELS: Record<MetricKey, { label: string; unit: string; decimals: number }> = {
  weightKg: { label: 'Gewicht', unit: 'kg', decimals: 1 },
  bmi: { label: 'BMI', unit: '', decimals: 1 },
  visceralFat: { label: 'Viszeralfett', unit: 'Index', decimals: 1 },
  musclePercent: { label: 'Muskelanteil', unit: '%', decimals: 1 },
  bodyFatPercent: { label: 'Fettanteil', unit: '%', decimals: 1 },
  waterPercent: { label: 'Wasseranteil', unit: '%', decimals: 1 },
}
