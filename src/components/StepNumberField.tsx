type StepNumberFieldProps = {
  id: string
  label: string
  unit: string
  value: string
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
  step,
  error,
  min,
  max,
  onValueChange,
  onStepChange,
}: StepNumberFieldProps) {
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
          aria-label={`${label} verringern`}
        >
          -
        </button>

        <input
          id={id}
          type="text"
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
          aria-label={`${label} erhöhen`}
        >
          +
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Schrittweite {step} {unit}
        {typeof min === 'number' ? `, min ${min}` : ''}
        {typeof max === 'number' ? `, max ${max}` : ''}
      </p>

      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  )
}
