import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

/**
 * Monospace code block with a copy-to-clipboard button (link→check feedback,
 * fails quietly when the clipboard API is unavailable). Used for generated
 * snippets and the formatted sandbox response body.
 */
export function CodeBlock({
  code,
  label = 'Copy code',
}: {
  code: string
  label?: string
}) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable (e.g. insecure context) — fail quietly.
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onCopy}
        aria-label={label}
        title={copied ? 'Copied!' : label}
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded text-slate-400 transition hover:bg-slate-700 hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-400" aria-hidden />
        ) : (
          <Copy className="h-4 w-4" aria-hidden />
        )}
      </button>
      <pre className="overflow-x-auto rounded-md bg-slate-900 p-4 pr-12 text-xs leading-relaxed text-slate-100">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  )
}
