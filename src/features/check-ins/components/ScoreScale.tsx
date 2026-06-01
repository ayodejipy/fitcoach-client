import { cn } from '@/lib/utils'

/*
 * ScoreScale — 1-10 chip row used by the check-in form for energy + mood.
 *
 * Mobile-first tap targets (44px+ per Apple HIG), reads better than a slider
 * on a narrow viewport. Renders 10 buttons in a grid; the selected button
 * gets brand-green fill with a soft shadow lift.
 *
 * Extracted from inline-at-bottom-of-CheckInForm (one-component-per-file
 * debt cleanup).
 */
interface Props {
  value: number | undefined
  onChange: (value: number) => void
  invalid: boolean
  name: string
}

export function ScoreScale({ value, onChange, invalid, name }: Props) {
  return (
    <div
      role="radiogroup"
      aria-invalid={invalid || undefined}
      className="grid grid-cols-10 gap-1.5"
    >
      {Array.from({ length: 10 }, (_, index) => index + 1).map((scoreNumber) => {
        const isActive = value === scoreNumber
        return (
          <button
            key={scoreNumber}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${scoreNumber} of 10`}
            data-active={isActive || undefined}
            name={name}
            onClick={() => onChange(scoreNumber)}
            className={cn(
              'h-11 rounded-[10px] border-[1.5px] text-[14px] font-semibold transition-colors',
              isActive
                ? 'border-[color:var(--green-brand)] bg-[color:var(--green-brand)] text-white shadow-[0_2px_8px_rgba(26,122,74,.32)]'
                : 'border-border bg-[color:var(--bg-input)] text-[color:var(--text-secondary)] hover:border-[color:var(--green-mid)]',
              invalid && !isActive && 'border-[color:var(--red)]',
            )}
          >
            {scoreNumber}
          </button>
        )
      })}
    </div>
  )
}
