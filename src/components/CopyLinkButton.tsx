import { useState } from 'react'

/**
 * Copies a deep link to an on-page anchor (current URL + `#anchorId`) to the
 * clipboard, with brief "copied" feedback. Used beside endpoint headers so a
 * reader can share a link straight to one endpoint.
 */
export function CopyLinkButton({
  anchorId,
  label = 'Copy link to this endpoint',
}: {
  anchorId: string
  label?: string
}) {
  const [copied, setCopied] = useState(false)

  const onClick = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${anchorId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable (e.g. insecure context) — fail quietly.
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={copied ? 'Copied!' : label}
      className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {copied ? (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="h-4 w-4 text-green-600"
          aria-hidden
        >
          <path
            d="M5 10.5l3 3 7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
          <path
            d="M8.5 11.5a3 3 0 004.24 0l2.51-2.5a3 3 0 10-4.24-4.25l-1.1 1.1M11.5 8.5a3 3 0 00-4.24 0l-2.51 2.5a3 3 0 104.24 4.25l1.1-1.1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
