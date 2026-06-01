import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar } from 'lucide-react'

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
import { ScoreScale } from '@/features/check-ins/components/ScoreScale'
import {
  checkInSubmitSchema,
  type CheckInSubmitFormValues,
} from '@/features/check-ins/schemas/check-in-submit'
import { useSubmitCheckIn } from '@/features/check-ins/hooks/useSubmitCheckIn'
import { formatMondayFriendly } from '@/features/check-ins/utils/format-monday'
import { weekEncouragement } from '@/features/check-ins/utils/week-encouragement'
import { PhotoUpload } from '@/features/progress/components/PhotoUpload'


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

  const eyebrow = programWeek ? `Week ${programWeek} check-in` : 'This week'
  const friendlyDate = formatMondayFriendly(thisMonday)
  const encouragement = weekEncouragement(programWeek)

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="space-y-5"
      >
        {/* ----- Page header ----- */}
        <header>
          <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[color:var(--green-brand)]">
            {eyebrow}
          </div>
          <h1
            className="mt-2 font-display text-[36px] lg:text-[42px] font-light leading-[1.05] tracking-[-0.015em] text-foreground"
            style={{ fontVariationSettings: "'opsz' 100, 'SOFT' 40" }}
          >
            How was your{' '}
            <em
              className="not-italic"
              style={{
                fontVariationSettings: "'opsz' 108, 'SOFT' 80",
                fontWeight: 400,
              }}
            >
              week?
            </em>
          </h1>
          <p className="mt-2 flex items-center gap-2 text-[13.5px] text-[color:var(--text-secondary)]">
            <Calendar
              className="h-4 w-4 text-[color:var(--text-muted)]"
              strokeWidth={2}
            />
            Week of {friendlyDate} · takes ~90 seconds
          </p>
        </header>

        {/* ===== SECTION 1: NUMBERS ===== */}
        <section className="rounded-[18px] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <SectionHeader number={1} label="Numbers" />

          <div className="mt-5">
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
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ''
                            ? undefined
                            : Number(event.target.value),
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

          <div className="mt-5">
            <FormField
              control={form.control}
              name="sleep_hrs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Average sleep (hours)</FormLabel>
                  <FormDescription>
                    Optional. Per night across the week.
                  </FormDescription>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.25"
                      placeholder="e.g. 7.5"
                      value={field.value ?? ''}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ''
                            ? undefined
                            : Number(event.target.value),
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
        </section>

        {/* ===== SECTION 2: FEELINGS ===== */}
        <section className="rounded-[18px] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <SectionHeader number={2} label="Feelings" />

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

          <div className="mt-6">
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
        </section>

        {/* ===== SECTION 3: NOTES & PHOTOS ===== */}
        <section className="rounded-[18px] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <SectionHeader number={3} label="Notes & photos" />

          <div className="mt-5">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes for your coach</FormLabel>
                  <FormDescription>
                    Optional. What went well, what was hard, anything you want
                    feedback on.
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
        </section>

        {/* ----- Encouragement + Submit ----- */}
        <div className="pt-2 text-center">
          <p
            className="mb-3 font-display text-[16px] italic text-[color:var(--text-secondary)]"
            style={{ fontVariationSettings: "'opsz' 14, 'SOFT' 70" }}
          >
            "{encouragement}"
          </p>
          <Button
            type="submit"
            size="lg"
            className="h-[52px] w-full text-[15.5px] shadow-[0_3px_14px_rgba(26,122,74,.32)]"
            disabled={isPending}
          >
            {isPending ? 'Submitting…' : 'Submit check-in'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

/*
 * SectionHeader — numbered chip + uppercase label for each form chunk.
 * Inline because it's used only here (4 lines, presentation-only — its own
 * file would be over-engineering). If a second consumer appears, extract.
 */
interface SectionHeaderProps {
  number: number
  label: string
}

function SectionHeader({ number, label }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--green-pale)] text-[11px] font-bold text-[color:var(--green-brand)] ring-1 ring-[color:var(--green-soft)]">
        {number}
      </span>
      <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-foreground">
        {label}
      </h2>
    </div>
  )
}
