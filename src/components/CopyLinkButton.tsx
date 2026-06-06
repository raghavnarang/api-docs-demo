import { useState } from 'react'
import { Check, Link2 } from 'lucide-react'

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
        <Check className="h-4 w-4 text-green-600" aria-hidden />
      ) : (
        <Link2 className="h-4 w-4" aria-hidden />
      )}
    </button>
  )
}
