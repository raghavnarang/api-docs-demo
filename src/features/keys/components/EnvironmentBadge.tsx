import type { ApiKeyEnvironment } from '../../../lib/data/types'

/** Coloured pill for a key's environment: sandbox (slate) vs production (amber). */
const styles: Record<ApiKeyEnvironment, string> = {
  sandbox: 'bg-slate-100 text-slate-700',
  production: 'bg-amber-100 text-amber-800',
}

export function EnvironmentBadge({
  environment,
}: {
  environment: ApiKeyEnvironment
}) {
  return (
    <span
      className={`inline-flex justify-center rounded px-2 py-0.5 text-xs font-semibold capitalize ${styles[environment]}`}
    >
      {environment}
    </span>
  )
}
