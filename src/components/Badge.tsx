import type { ReactNode } from 'react'

type Shape = 'rounded' | 'pill'

const shapeClasses: Record<Shape, string> = {
  rounded: 'rounded px-2 py-0.5',
  pill: 'rounded-full px-2.5 py-0.5',
}

interface BadgeProps {
  /** Colour utility classes (background + text, and optional ring). */
  tone?: string
  /** `rounded` (default) for square pills, `pill` for fully rounded. */
  shape?: Shape
  /** Monospaced label — used for HTTP codes/methods. */
  mono?: boolean
  className?: string
  children: ReactNode
}

/**
 * Shared coloured pill primitive. Owns the base layout; callers pass `tone`
 * (colour classes, e.g. from the http colour convention) and any extra
 * modifiers via `className`. Wrapped by MethodBadge/StatusBadge/HealthBadge/
 * EnvironmentBadge and used directly for one-off badges.
 */
export function Badge({
  tone = '',
  shape = 'rounded',
  mono = false,
  className = '',
  children,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center text-xs font-semibold ${shapeClasses[shape]} ${mono ? 'font-mono ' : ''}${tone} ${className}`}
    >
      {children}
    </span>
  )
}
