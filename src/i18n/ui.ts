import type { MetricKey } from '../types/measurement'
import { METRIC_LABELS } from '../types/measurement'
import type { AppLanguage, AppTheme } from '../types/settings'

const METRIC_COPY: Record<MetricKey, { de: string; en: string; unitDe?: string; unitEn?: string }> = {
  weightKg: { de: 'Gewicht', en: 'Weight', unitDe: 'kg', unitEn: 'kg' },
  bodyFatPercent: { de: 'Körperfett', en: 'Body fat', unitDe: '%', unitEn: '%' },
  waterPercent: { de: 'Körperwasser', en: 'Body water', unitDe: '%', unitEn: '%' },
  musclePercent: { de: 'Muskelmasse', en: 'Muscle mass', unitDe: '%', unitEn: '%' },
  bmi: { de: 'BMI', en: 'BMI', unitDe: '', unitEn: '' },
  visceralFat: { de: 'Viszeralfett', en: 'Visceral fat', unitDe: '', unitEn: '' },
  biologicalAge: { de: 'Biologisches Alter', en: 'Biological age', unitDe: 'J', unitEn: 'y' },
}

type StaticMessageShape = {
  appName: string
  appTitle: string
  today: string
  dashboard: string
  entry: string
  history: string
  data: string
  pageLoading: string
  chartTitleSuffix: string
  latestEntryOn: string
  startWithFirstEntry: string
  captureEntry: string
  metricLabel: string
  noValueYet: string
  loadingData: string
  loadingChart: string
  bodyValues: string
  viewHistory: string
  noComparisonData: string
  saveEntryTitle: string
  editEntryTitle: string
  entrySequenceHint: string
  firstRecordHint: string
  date: string
  clear: string
  usePreviousValues: string
  save: string
  update: string
  saving: string
  backToHistory: string
  entryNotFound: string
  saveFailed: string
  deleteFailed: string
  historyTitle: string
  historyHint: string
  loadingHistory: string
  noEntries: string
  edit: string
  delete: string
  settingsTitle: string
  settingsHint: string
  preferencesTitle: string
  preferencesHint: string
  export: string
  exportHint: string
  import: string
  importHint: string
  selectFile: string
  importStart: string
  importing: string
  dangerZone: string
  deleteAllHint: string
  deleteAll: string
  exportFailed: string
  importFailed: string
  importNeedFile: string
  exportDone: string
  storageTitle: string
  storageHint: string
  storageRecords: string
  storageUsed: string
  storageLimit: string
  storagePersistence: string
  storageUnknown: string
  storageGuaranteed: string
  storageNotGuaranteed: string
  storageUsagePercent: string
  storageStatsUnavailable: string
  onboardingTitle: string
  onboardingSubtitle: string
  onboardingLanguage: string
  onboardingTheme: string
  onboardingTrackedMetrics: string
  onboardingNeedMetric: string
  onboardingFinish: string
  themeGreen: string
  themeMono: string
  themeCreative: string
  flashCreated: string
  flashUpdated: string
  confirmDelete: string
  confirmDeleteAll: string
  allDeleted: string
  noDataToDelete: string
  importSuccess: string
  selectedFile: string
  importSupportsHint: string
  importSettingsApplied: string
  dataLoadFailed: string
  saveUpdatedMessage: string
  formClearedMessage: string
}

export const UI_MESSAGES: Record<AppLanguage, StaticMessageShape> = {
  de: {
    appName: 'TrackerApp',
    appTitle: 'Fitnessziele',
    today: 'Heute',
    dashboard: 'Dashboard',
    entry: 'Eintrag',
    history: 'Verlauf',
    data: 'Daten',
    pageLoading: 'Lade Seite...',
    chartTitleSuffix: 'Trend',
    latestEntryOn: 'Letzter Eintrag am',
    startWithFirstEntry: 'Starte mit deinem ersten Eintrag für eine Verlaufskurve.',
    captureEntry: 'Eintrag erfassen',
    metricLabel: 'Metrik',
    noValueYet: 'Noch kein Wert vorhanden.',
    loadingData: 'Lade Daten...',
    loadingChart: 'Diagramm wird geladen...',
    bodyValues: 'Körperwerte',
    viewHistory: 'Verlauf ansehen',
    noComparisonData: 'Keine Vergleichsdaten',
    saveEntryTitle: 'Schnellerfassung',
    editEntryTitle: 'Eintrag bearbeiten',
    entrySequenceHint:
      'Reihenfolge wie auf der Waage: kg, Körperfett, Wasser, Muskelmasse, BMI, Viszeralfett, biologisches Alter.',
    firstRecordHint: 'Erfasse deinen ersten Datensatz.',
    date: 'Datum',
    clear: 'Leeren',
    usePreviousValues: 'Vorherige Werte übernehmen',
    save: 'Speichern',
    update: 'Aktualisieren',
    saving: 'Speichere...',
    backToHistory: 'Zum Verlauf',
    entryNotFound: 'Kein Eintrag für dieses Datum gefunden.',
    saveFailed: 'Eintrag konnte nicht gespeichert werden.',
    deleteFailed: 'Löschen ist fehlgeschlagen.',
    historyTitle: 'Verlauf',
    historyHint: 'Alle Tageswerte in umgekehrt chronologischer Reihenfolge.',
    loadingHistory: 'Lade Verlauf...',
    noEntries: 'Noch keine Einträge vorhanden.',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    settingsTitle: 'Datenverwaltung',
    settingsHint: 'Exportiere Backups oder importiere bestehende Datensätze aus CSV/JSON.',
    preferencesTitle: 'App-Einstellungen',
    preferencesHint: 'Sprache, Farbschema und aktive Felder jederzeit anpassen.',
    export: 'Export',
    exportHint: 'Speichere deine Daten lokal als Backup-Datei.',
    import: 'Import',
    importHint: 'Unterstützt CSV aus TrackerApp-Export und JSON-Importdateien inklusive Einstellungen.',
    selectFile: 'Datei auswählen',
    importStart: 'Import starten',
    importing: 'Importiere...',
    dangerZone: 'Gefahrenzone',
    deleteAllHint: 'Löscht alle aktuell lokal gespeicherten Messwerte aus IndexedDB.',
    deleteAll: 'Alle lokalen Daten löschen',
    exportFailed: 'Export ist fehlgeschlagen.',
    importFailed: 'Import ist fehlgeschlagen.',
    importNeedFile: 'Bitte zuerst eine CSV- oder JSON-Datei auswählen.',
    exportDone: 'wurde exportiert.',
    storageTitle: 'Lokaler Speicher',
    storageHint: 'Deine Daten liegen in IndexedDB auf diesem Gerät und werden nicht in die Cloud synchronisiert.',
    storageRecords: 'Datensätze',
    storageUsed: 'Belegt',
    storageLimit: 'Limit',
    storagePersistence: 'Persistenz',
    storageUnknown: 'Unbekannt',
    storageGuaranteed: 'Aktiv',
    storageNotGuaranteed: 'Nicht zugesichert',
    storageUsagePercent: 'Speichernutzung',
    storageStatsUnavailable: 'Browser liefert keine Storage-Statistiken. Exportiere regelmäßig als Backup.',
    onboardingTitle: 'Willkommen bei TrackerApp',
    onboardingSubtitle: 'Lege Sprache, Theme und deine zu trackenden Werte einmalig fest.',
    onboardingLanguage: 'Sprache',
    onboardingTheme: 'Farbschema',
    onboardingTrackedMetrics: 'Werte auswählen',
    onboardingNeedMetric: 'Bitte mindestens einen Wert auswählen.',
    onboardingFinish: 'Onboarding abschließen',
    themeGreen: 'Grün',
    themeMono: 'Minimal Schwarz/Weiß',
    themeCreative: 'Kreativ',
    flashCreated: 'Eintrag gespeichert',
    flashUpdated: 'Tageswert aktualisiert',
    confirmDelete: 'Eintrag vom {date} wirklich löschen?',
    confirmDeleteAll:
      'Alle lokalen Datensätze unwiderruflich löschen? Dieser Schritt kann nicht rückgängig gemacht werden.',
    allDeleted: 'Alle lokalen Datensätze wurden gelöscht.',
    noDataToDelete: 'Es sind keine Daten zum Löschen vorhanden.',
    importSuccess: 'Import erfolgreich: {imported} Datensätze ({created} neu, {updated} aktualisiert).',
    selectedFile: 'Ausgewählt',
    importSupportsHint: 'CSV aus Exporten oder JSON-Array / JSON-Objekt mit entries/settings.',
    importSettingsApplied: 'Importierte Einstellungen wurden übernommen.',
    dataLoadFailed: 'Daten konnten nicht geladen werden.',
    saveUpdatedMessage: 'Werte vom {date} wurden vorausgefüllt.',
    formClearedMessage: 'Formular geleert.',
  },
  en: {
    appName: 'TrackerApp',
    appTitle: 'Fitness goals',
    today: 'Today',
    dashboard: 'Dashboard',
    entry: 'Entry',
    history: 'History',
    data: 'Data',
    pageLoading: 'Loading page...',
    chartTitleSuffix: 'trend',
    latestEntryOn: 'Latest entry on',
    startWithFirstEntry: 'Start by adding your first entry to see a trend line.',
    captureEntry: 'Capture entry',
    metricLabel: 'Metric',
    noValueYet: 'No value yet.',
    loadingData: 'Loading data...',
    loadingChart: 'Loading chart...',
    bodyValues: 'Body metrics',
    viewHistory: 'View history',
    noComparisonData: 'No comparison data',
    saveEntryTitle: 'Quick entry',
    editEntryTitle: 'Edit entry',
    entrySequenceHint:
      'Order follows your scale: kg, body fat, water, muscle mass, BMI, visceral fat, biological age.',
    firstRecordHint: 'Capture your first data point.',
    date: 'Date',
    clear: 'Clear',
    usePreviousValues: 'Use previous values',
    save: 'Save',
    update: 'Update',
    saving: 'Saving...',
    backToHistory: 'Back to history',
    entryNotFound: 'No entry found for this date.',
    saveFailed: 'Entry could not be saved.',
    deleteFailed: 'Delete failed.',
    historyTitle: 'History',
    historyHint: 'All daily values in reverse chronological order.',
    loadingHistory: 'Loading history...',
    noEntries: 'No entries yet.',
    edit: 'Edit',
    delete: 'Delete',
    settingsTitle: 'Data management',
    settingsHint: 'Export backups or import existing data from CSV/JSON.',
    preferencesTitle: 'App settings',
    preferencesHint: 'Adjust language, theme and active fields at any time.',
    export: 'Export',
    exportHint: 'Save your data locally as a backup file.',
    import: 'Import',
    importHint: 'Supports CSV exports and JSON imports including app settings.',
    selectFile: 'Select file',
    importStart: 'Start import',
    importing: 'Importing...',
    dangerZone: 'Danger zone',
    deleteAllHint: 'Deletes all locally stored measurements from IndexedDB.',
    deleteAll: 'Delete all local data',
    exportFailed: 'Export failed.',
    importFailed: 'Import failed.',
    importNeedFile: 'Please choose a CSV or JSON file first.',
    exportDone: 'has been exported.',
    storageTitle: 'Local storage',
    storageHint: 'Your data is stored in IndexedDB on this device and is not synced to cloud services.',
    storageRecords: 'Records',
    storageUsed: 'Used',
    storageLimit: 'Limit',
    storagePersistence: 'Persistence',
    storageUnknown: 'Unknown',
    storageGuaranteed: 'Active',
    storageNotGuaranteed: 'Not guaranteed',
    storageUsagePercent: 'Storage usage',
    storageStatsUnavailable: 'Browser does not provide storage stats. Export backups regularly.',
    onboardingTitle: 'Welcome to TrackerApp',
    onboardingSubtitle: 'Set your language, theme and tracked metrics once to get started.',
    onboardingLanguage: 'Language',
    onboardingTheme: 'Theme',
    onboardingTrackedMetrics: 'Choose metrics',
    onboardingNeedMetric: 'Please select at least one metric.',
    onboardingFinish: 'Finish onboarding',
    themeGreen: 'Green',
    themeMono: 'Minimal black/white',
    themeCreative: 'Creative',
    flashCreated: 'Entry saved',
    flashUpdated: 'Daily value updated',
    confirmDelete: 'Delete entry from {date}?',
    confirmDeleteAll: 'Delete all local records permanently? This cannot be undone.',
    allDeleted: 'All local records were deleted.',
    noDataToDelete: 'There is no data to delete.',
    importSuccess: 'Import successful: {imported} records ({created} new, {updated} updated).',
    selectedFile: 'Selected',
    importSupportsHint: 'CSV export format or JSON array / JSON object with entries/settings.',
    importSettingsApplied: 'Imported settings were applied.',
    dataLoadFailed: 'Data could not be loaded.',
    saveUpdatedMessage: 'Values from {date} were prefilled.',
    formClearedMessage: 'Form cleared.',
  },
}

export function getMetricLabel(metric: MetricKey, language: AppLanguage): string {
  return METRIC_COPY[metric][language]
}

export function getMetricUnit(metric: MetricKey, language: AppLanguage): string {
  const data = METRIC_COPY[metric]
  return language === 'en' ? data.unitEn ?? '' : data.unitDe ?? ''
}

export function getMetricDecimals(metric: MetricKey): number {
  return METRIC_LABELS[metric].decimals
}

export function getThemeLabel(theme: AppTheme, language: AppLanguage): string {
  const messages = UI_MESSAGES[language]
  if (theme === 'mono') {
    return messages.themeMono
  }
  if (theme === 'creative') {
    return messages.themeCreative
  }
  return messages.themeGreen
}

export function formatTemplate(template: string, values: Record<string, string | number>): string {
  return template.replaceAll(/\{([^}]+)\}/g, (_match, key: string) => String(values[key] ?? ''))
}
