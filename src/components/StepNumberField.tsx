type StepNumberFieldProps = {
  id: string
  label: string
  unit: string
  value: string
  language?: 'de' | 'en'
  step: number
  error?: string
  min?: number
  max?: number
  onValueChange: (nextValue: string) => void
  onStepChange: (delta: number) => void
}

export function StepNumberField({
  id,
  label,
  unit,
  value,
  language = 'de',
  step,
  error,
  min,
  max,
  onValueChange,
  onStepChange,
}: StepNumberFieldProps) {
  const decreaseLabel = language === 'en' ? `${label} decrease` : `${label} verringern`
  const increaseLabel = language === 'en' ? `${label} increase` : `${label} erhöhen`
  const stepLabel = language === 'en' ? 'Step size' : 'Schrittweite'
  const minLabel = language === 'en' ? 'min' : 'min'
  const maxLabel = language === 'en' ? 'max' : 'max'

  return (
    <div className="rounded-2xl border border-teal-900/10 bg-white/90 p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
        <span className="text-xs font-medium text-slate-500">{unit}</span>
      </div>

      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={() => onStepChange(-step)}
          className="w-11 shrink-0 rounded-xl border border-slate-300 bg-slate-50 text-xl font-bold text-slate-700 transition hover:bg-slate-100"
          aria-label={decreaseLabel}
        >
          -
        </button>

        <input
          id={id}
          type="number"
          inputMode="decimal"
          enterKeyHint="next"
          pattern="[0-9]*[.,]?[0-9]*"
          autoComplete="off"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3 py-3 text-center text-lg font-semibold tracking-wide"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          required
        />

        <button
          type="button"
          onClick={() => onStepChange(step)}
          className="w-11 shrink-0 rounded-xl border border-teal-700 bg-teal-700 text-xl font-bold text-white transition hover:bg-teal-600"
          aria-label={increaseLabel}
        >
          +
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {stepLabel} {step} {unit}
        {typeof min === 'number' ? `, ${minLabel} ${min}` : ''}
        {typeof max === 'number' ? `, ${maxLabel} ${max}` : ''}
      </p>

      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  )
}
