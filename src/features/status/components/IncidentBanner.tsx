import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { AlertTriangle, X } from 'lucide-react'
import type { StatusBannerLevel } from '../../../lib/data/types'
import { useStatusBanner } from '../hooks/use-status'

/** Banner styling per severity. Outage outranks degraded outranks info. */
const STYLES: Record<StatusBannerLevel, string> = {
  outage: 'border-red-200 bg-red-50 text-red-800',
  degraded: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
}

const RANK: Record<StatusBannerLevel, number> = {
  info: 0,
  degraded: 1,
  outage: 2,
}

/** Session-scoped dismissal: survives reloads within the tab session, clears
 * when the session ends (so the banner returns in a new session). */
const DISMISS_KEY = 'devportal:status-banner-dismissed'

function readDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

function writeDismissed(): void {
  try {
    sessionStorage.setItem(DISMISS_KEY, '1')
  } catch {
    // sessionStorage unavailable (private mode / SSR) — fall back to in-memory.
  }
}

/**
 * Site-wide banner (§2.6). Mounted once in the shell above the routed page, it
 * reads `useStatusBanner` — a query independent of any per-API status page — and
 * shows every active message (e.g. a degraded/down API). Dismissible for the
 * session (reappears on reload while messages persist). The card takes the worst
 * severity's style; renders nothing (no leftover spacing) when there's nothing.
 */
export function IncidentBanner() {
  const [dismissed, setDismissed] = useState(readDismissed)
  const { data } = useStatusBanner()

  const messages = data ?? []
  if (messages.length === 0 || dismissed) return null

  const dismiss = () => {
    writeDismissed()
    setDismissed(true)
  }

  const worst = messages.reduce<StatusBannerLevel>(
    (acc, m) => (RANK[m.level] > RANK[acc] ? m.level : acc),
    'info',
  )

  return (
    <div className="px-6 pt-6">
      <div
        role="alert"
        className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 ${STYLES[worst]}`}
      >
        <div className="flex items-center gap-2.5 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
          <ul className="space-y-0.5">
            {messages.map((m) => (
              <li key={m.id}>
                {m.message}{' '}
                {m.apiId ? (
                  <Link
                    to="/status/$apiId"
                    params={{ apiId: m.apiId }}
                    className="font-medium underline"
                  >
                    View status
                  </Link>
                ) : (
                  <Link to="/status" className="font-medium underline">
                    View status
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss incident banner"
          className="grid h-7 w-7 shrink-0 place-items-center rounded hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
