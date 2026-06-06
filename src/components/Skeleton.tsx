/** Pulsing placeholder block for loading states. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
}

/** A few stacked skeleton lines — a sensible default loading placeholder. */
export function SkeletonLines({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i % 3 === 2 ? 'w-1/2' : 'w-full'}`}
        />
      ))}
    </div>
  )
}
