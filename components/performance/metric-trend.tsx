'use client'

import { useId } from 'react'

export function MetricTrend({ label, values }: { label: string; values: number[] }) {
  const title = useId()
  if (values.length < 2) return null

  const latest = values.slice(-20)
  const minimum = Math.min(...latest)
  const maximum = Math.max(...latest)
  const coordinates = latest.map((value, index) => ({
    x: 12 + index / (latest.length - 1) * 296,
    y: maximum === minimum ? 48 : 80 - (value - minimum) / (maximum - minimum) * 64,
  }))

  return (
    <svg role="img" aria-labelledby={title} viewBox="0 0 320 96" className="block h-24 w-full rounded-lg border border-border text-primary">
      <title id={title}>{label}. Values are listed below.</title>
      <polyline fill="none" points={coordinates.map(({ x, y }) => `${x},${y}`).join(' ')} stroke="currentColor" strokeWidth={2} />
      {coordinates.map(({ x, y }) => <circle key={x} cx={x} cy={y} r="3" fill="currentColor" />)}
    </svg>
  )
}
