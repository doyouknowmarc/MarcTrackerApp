import { useEffect, useMemo, useState } from 'react'
import { useMeasurements } from '../context/measurementsState'
import { getMetricLabel, getThemeLabel, UI_MESSAGES } from '../i18n/ui'
import { METRIC_ORDER, type MetricKey } from '../types/measurement'
import type { AppLanguage, AppTheme } from '../types/settings'

const LANGUAGE_OPTIONS: AppLanguage[] = ['de', 'en']
const THEME_OPTIONS: AppTheme[] = ['green', 'mono', 'creative']

function sortedMetrics(metrics: MetricKey[]): MetricKey[] {
  const metricSet = new Set(metrics)
  return METRIC_ORDER.filter((metric) => metricSet.has(metric))
}

export function OnboardingPage() {
  const { completeOnboarding } = useMeasurements()
  const [language, setLanguage] = useState<AppLanguage>('de')
  const [theme, setTheme] = useState<AppTheme>('green')
  const [trackedMetrics, setTrackedMetrics] = useState<MetricKey[]>([...METRIC_ORDER])
  const [error, setError] = useState<string | null>(null)

  const messages = UI_MESSAGES[language]

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const metricOptions = useMemo(
    () =>
      METRIC_ORDER.map((metric) => ({
        key: metric,
        label: getMetricLabel(metric, language),
      })),
    [language],
  )

  const toggleMetric = (metric: MetricKey) => {
    setTrackedMetrics((previous) => {
      if (previous.includes(metric)) {
        return previous.filter((item) => item !== metric)
      }
      return sortedMetrics([...previous, metric])
    })
  }

  const handleFinish = () => {
    if (trackedMetrics.length === 0) {
      setError(messages.onboardingNeedMetric)
      return
    }

    completeOnboarding({
      language,
      theme,
      trackedMetrics: sortedMetrics(trackedMetrics),
    })
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
      <section className="space-y-5 rounded-3xl border border-teal-900/10 bg-white/95 p-5 shadow-xl">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">TrackerApp</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{messages.onboardingTitle}</h1>
          <p className="mt-2 text-sm text-slate-600">{messages.onboardingSubtitle}</p>
        </header>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-800">{messages.onboardingLanguage}</h2>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLanguage(option)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  option === language
                    ? 'border-teal-700 bg-teal-700 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {option === 'de' ? 'Deutsch' : 'English'}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-800">{messages.onboardingTheme}</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTheme(option)}
                className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                  option === theme
                    ? 'border-teal-700 bg-teal-50 shadow-sm'
                    : 'border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <span className="font-semibold text-slate-900">{getThemeLabel(option, language)}</span>
                <p className="mt-1 text-xs text-slate-600">
                  {option === 'mono'
                    ? language === 'de'
                      ? 'Klar, schlicht, kontrastreich.'
                      : 'Clean and high-contrast.'
                    : option === 'creative'
                      ? language === 'de'
                        ? 'Mutiger, farbiger Look.'
                        : 'Bolder and colorful.'
                      : language === 'de'
                        ? 'Bekannter Tracker-Look.'
                        : 'Current familiar look.'}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-800">{messages.onboardingTrackedMetrics}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {metricOptions.map((metric) => {
              const active = trackedMetrics.includes(metric.key)
              return (
                <button
                  key={metric.key}
                  type="button"
                  onClick={() => toggleMetric(metric.key)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    active
                      ? 'border-teal-700 bg-teal-50 text-teal-900'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{metric.label}</span>
                  <span className="text-xs font-bold uppercase tracking-wide">
                    {active ? (language === 'de' ? 'An' : 'On') : language === 'de' ? 'Aus' : 'Off'}
                  </span>
                </button>
              )
            })}
          </div>
          {error ? <p className="text-xs font-medium text-rose-700">{error}</p> : null}
        </section>

        <button
          type="button"
          onClick={handleFinish}
          className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-600"
        >
          {messages.onboardingFinish}
        </button>
      </section>
    </main>
  )
}
