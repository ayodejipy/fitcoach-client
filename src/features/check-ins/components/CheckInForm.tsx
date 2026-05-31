import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  checkInSubmitSchema,
  type CheckInSubmitFormValues,
} from '@/features/check-ins/schemas/check-in-submit'
import { useSubmitCheckIn } from '@/features/check-ins/hooks/useSubmitCheckIn'
import { PhotoUpload } from '@/features/progress/components/PhotoUpload'

/*
 * CheckInForm — pure UI for the weekly habit-loop action.
 *
 * IA pinned by /plan-design-review Decision 2A:
 *   week label → weight → energy → mood → notes (sleep added before notes
 *   as an optional supporting metric — coaches care about sleep heavily).
 *
 * `useSubmitCheckIn()` owns the mutation, the cache invalidation, the success
 * toast + navigation, and the inline-vs-toast error split. The component just
 * wires RHF + Zod → fields → onSubmit handing values + the inline-error
 * callback to the hook.
 *
 * Week start date comes from the parent (computed via `useStreak().thisMonday`
 * — ISO Monday in the device's local TZ). The user never types it.
 *
 * Photos are uploaded via the PhotoUpload field (multipart POST per file,
 * URLs accumulated locally) and submitted as `photo_urls` alongside the
 * rest of the body.
 */

interface Props {
  /** YYYY-MM-DD Monday for this week, supplied by the parent route. */
  thisMonday: string
  /** Optional copy that names the program week — "Week 5 check-in". */
  programWeek?: number | null | undefined
}

export function CheckInForm({ thisMonday, programWeek }: Props) {
  const form = useForm<CheckInSubmitFormValues>({
    resolver: zodResolver(checkInSubmitSchema),
    defaultValues: {
      week_start_date: thisMonday,
      weight_lbs: undefined as unknown as number,
      energy_score: undefined as unknown as number,
      mood_score: undefined as unknown as number,
      sleep_hrs: undefined,
      notes: '',
      photo_urls: [],
    },
    mode: 'onSubmit',
  })

  const { submit, isPending } = useSubmitCheckIn()

  const onSubmit = (values: CheckInSubmitFormValues) =>
    submit(values, {
      onInlineError: (message) =>
        // Backend rejection (e.g., 409 duplicate week) pins to weight —
        // most visible field, generic-enough to read for any backend error.
        form.setError('weight_lbs', { type: 'server', message }),
    })

  const weekLabel = programWeek ? `Week ${programWeek} check-in` : 'This week'
  // Format the ISO Monday for the user as "Mon, Jun 2" — read locally so
  // the date matches what they expect to see.
  const friendlyDate = formatMondayFriendly(thisMonday)

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
      >
        <header>
          <h1 className="text-[22px] font-extrabold tracking-tight text-foreground">
            {weekLabel}
          </h1>
          <p className="mt-1 text-[13px] text-[color:var(--text-secondary)]">
            Week of {friendlyDate} · takes ~90 seconds
          </p>
        </header>

        <div className="rounded-[14px] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          {/* Weight (required) */}
          <FormField
            control={form.control}
            name="weight_lbs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (lbs)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder="e.g. 175.4"
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? undefined : Number(e.target.value),
                      )
                    }
                    ref={field.ref}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Energy 1-10 */}
          <div className="mt-5">
            <FormField
              control={form.control}
              name="energy_score"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Energy this week</FormLabel>
                  <FormDescription>1 = drained · 10 = thriving</FormDescription>
                  <FormControl>
                    <ScoreScale
                      value={field.value}
                      onChange={field.onChange}
                      invalid={Boolean(fieldState.error)}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Mood 1-10 */}
          <div className="mt-5">
            <FormField
              control={form.control}
              name="mood_score"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Mood this week</FormLabel>
                  <FormDescription>1 = rough · 10 = great</FormDescription>
                  <FormControl>
                    <ScoreScale
                      value={field.value}
                      onChange={field.onChange}
                      invalid={Boolean(fieldState.error)}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Sleep (optional) */}
          <div className="mt-5">
            <FormField
              control={form.control}
              name="sleep_hrs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Average sleep (hours)</FormLabel>
                  <FormDescription>Optional. Per night across the week.</FormDescription>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.25"
                      placeholder="e.g. 7.5"
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === '' ? undefined : Number(e.target.value),
                        )
                      }
                      ref={field.ref}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Notes (optional) */}
          <div className="mt-5">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes for your coach</FormLabel>
                  <FormDescription>
                    Optional. What went well, what was hard, anything you want feedback on.
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Whatever's on your mind."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Progress photos (optional, up to 4) */}
          <div className="mt-5">
            <FormField
              control={form.control}
              name="photo_urls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progress photos</FormLabel>
                  <FormControl>
                    <PhotoUpload
                      value={field.value ?? []}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-[50px] w-full text-[15px] shadow-[0_3px_14px_rgba(26,122,74,.32)]"
          disabled={isPending}
        >
          {isPending ? 'Submitting…' : 'Submit check-in'}
        </Button>
      </form>
    </Form>
  )
}

/*
 * ScoreScale — 1-10 chip row.
 *
 * Mobile-first tap targets (44px+ each), reads better than a slider on a
 * narrow viewport. Used for energy + mood.
 */
function ScoreScale({
  value,
  onChange,
  invalid,
  name,
}: {
  value: number | undefined
  onChange: (n: number) => void
  invalid: boolean
  name: string
}) {
  return (
    <div
      role="radiogroup"
      aria-invalid={invalid || undefined}
      className="grid grid-cols-10 gap-1.5"
    >
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const active = value === n
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${n} of 10`}
            data-active={active || undefined}
            name={name}
            onClick={() => onChange(n)}
            className={cn(
              'h-11 rounded-[10px] border-[1.5px] text-[14px] font-semibold transition-colors',
              active
                ? 'border-[color:var(--green-brand)] bg-[color:var(--green-brand)] text-white'
                : 'border-border bg-[color:var(--bg-input)] text-[color:var(--text-secondary)] hover:border-[color:var(--green-mid)]',
              invalid && !active && 'border-[color:var(--red)]',
            )}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}

/* Render YYYY-MM-DD as "Mon, Jun 2" in the device's local timezone. */
function formatMondayFriendly(yyyymmdd: string): string {
  const [y, m, d] = yyyymmdd.split('-').map(Number) as [number, number, number]
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
