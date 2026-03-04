import { useMemo } from 'react'
import { useMeasurements } from '../context/measurementsState'
import { UI_MESSAGES } from '../i18n/ui'

export function useAppLocale() {
  const { settings } = useMeasurements()

  return useMemo(
    () => ({
      language: settings.language,
      messages: UI_MESSAGES[settings.language],
    }),
    [settings.language],
  )
}
