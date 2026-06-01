import { useId } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { TrendPoint } from '@/features/progress/hooks/useProgressData'

/*
 * TrendChart — one metric, one line, with a soft gradient fill underneath.
 *
 * Switched from `Line` to `Area` in the May 2026 redesign — the gradient
 * fill gives a calmer, more editorial feel ("we've been working on this
 * over time") vs the raw bar-chart-y line. Stroke stays prominent so the
 * trend reads first; fill is decorative.
 *
 * Gradient ID is per-instance (via `useId()`) so multiple charts on the
 * same page don't collide on a shared `<defs>` definition.
 *
 * Height comes from the parent (TrendCard sets it via `<div class="h-64">`)
 * so the chart card decides its own footprint.
 *
 * Empty + sparse series:
 *   - 0 points  → caller renders an empty state instead of this component.
 *   - 1 point   → Recharts will draw a single dot; still renders.
 *   - 2+ points → an area + line, with `connectNulls={false}` so a missing-
 *                 week gap is shown visually as a gap, not interpolated.
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
  formatValue?: (value: number) => string
}

export function TrendChart({
  data,
  stroke = 'var(--green-brand)',
  yDomain,
  valueSuffix = '',
  formatValue = String,
}: Props) {
  const gradientId = useId().replace(/:/g, '') + '-trend-fill'

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.22} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border-muted)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
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
          formatter={(value) => {
            // Recharts types `value` as the (possibly array) data point; in
            // practice we feed it a single number per series. Coerce to a
            // safe display when missing rather than NaN-formatting the chart.
            const numericValue = typeof value === 'number' ? value : Number(value)
            const safe = Number.isFinite(numericValue)
              ? formatValue(numericValue)
              : '—'
            return [`${safe}${valueSuffix}`, 'value']
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={stroke}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={{ r: 3, strokeWidth: 0, fill: stroke }}
          activeDot={{ r: 5, strokeWidth: 0 }}
          connectNulls={false}
          isAnimationActive
          animationDuration={400}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
