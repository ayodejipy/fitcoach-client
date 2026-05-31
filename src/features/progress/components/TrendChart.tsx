import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { TrendPoint } from '@/features/progress/hooks/useProgressData'

/*
 * TrendChart — one metric, one line. Reused by TrendsSection for weight,
 * energy, and mood; the visual treatment is identical so the user reads them
 * as one set of charts, not three different visualizations.
 *
 * Empty + sparse series:
 *   - 0 points  → caller renders an empty state instead of this component.
 *   - 1 point   → Recharts will draw a single dot; we still render so the
 *                 user sees their first datum show up.
 *   - 2+ points → a line, with `connectNulls={false}` so a missing-week gap
 *                 is shown visually as a gap, not interpolated through.
 *
 * Y-axis domain:
 *   - For bounded scores (energy, mood) the caller passes [1, 10] so the
 *     line's relative position is meaningful.
 *   - For weight, leave `auto` — Recharts picks tight bounds around the data.
 *
 * The chart is intentionally minimal: no axis labels, no chart title (the
 * card around it carries those), no legend (single series), no grid on Y
 * unless the metric is bounded. Less ink, more signal.
 */

interface Props {
  data: TrendPoint[]
  /** Brand color for the line + dots. Defaults to brand green. */
  stroke?: string
  /** Optional Y-axis domain. Recharts default if omitted. */
  yDomain?: [number, number]
  /** Suffix for the tooltip value, e.g. " lbs" for weight or " / 10" for scores. */
  valueSuffix?: string
  /** Tooltip number formatter — defaults to `String`. */
  formatValue?: (n: number) => string
}

export function TrendChart({
  data,
  stroke = 'var(--green-brand)',
  yDomain,
  valueSuffix = '',
  formatValue = String,
}: Props) {
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border-muted)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            // Auto-thin ticks so a 30-week series doesn't become a wall of
            // overlapping labels. Recharts decides what fits.
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={32}
            domain={yDomain ?? ['auto', 'auto']}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
            contentStyle={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              boxShadow: 'var(--shadow-card)',
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--text-muted)', fontWeight: 600 }}
            formatter={(v) => {
              // Recharts types `value` as the (possibly array) data point; in
              // practice we feed it a single number per series. Coerce to
              // string when missing rather than NaN-formatting the chart.
              const n = typeof v === 'number' ? v : Number(v)
              const safe = Number.isFinite(n) ? formatValue(n) : '—'
              return [`${safe}${valueSuffix}`, 'value']
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 0, fill: stroke }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            connectNulls={false}
            isAnimationActive
            animationDuration={400}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
