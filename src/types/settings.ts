import type { MetricKey } from './measurement'

export type AppLanguage = 'de' | 'en'
export type AppTheme = 'green' | 'mono' | 'creative'

export type AppSettings = {
  language: AppLanguage
  theme: AppTheme
  trackedMetrics: MetricKey[]
  onboardingCompleted: boolean
}
