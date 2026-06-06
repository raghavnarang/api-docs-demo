import { AlertTriangle } from 'lucide-react'

/** Error placeholder with an optional retry action. */
export function ErrorState({
  title = 'Something went wrong',
  error,
  onRetry,
}: {
  title?: string
  error?: unknown
  onRetry?: () => void
}) {
  const detail = error instanceof Error ? error.message : undefined
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-6 py-12 text-center"
    >
      <AlertTriangle className="h-7 w-7 text-red-400" aria-hidden />
      <p className="font-medium text-red-800">{title}</p>
      {detail ? <p className="text-sm text-red-600">{detail}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          Retry
        </button>
      ) : null}
    </div>
  )
}
