import { useState } from 'react'
import { CodeBlock } from '../../../components/CodeBlock'
import { generateSnippet, type SnippetLang } from '../../../lib/snippet-generator'
import type { SandboxRequest } from '../../../lib/sandbox/rest-client'

const TABS: { lang: SnippetLang; label: string }[] = [
  { lang: 'curl', label: 'cURL' },
  { lang: 'javascript', label: 'JavaScript' },
  { lang: 'python', label: 'Python' },
]

/**
 * cURL / JavaScript (fetch) / Python (requests) snippet tabs, generated from the
 * same assembled `SandboxRequest` the sandbox fires — so a copied snippet
 * reproduces the live call exactly.
 */
export function SnippetTabs({ request }: { request: SandboxRequest }) {
  const [lang, setLang] = useState<SnippetLang>('curl')
  const code = generateSnippet(request, lang)

  return (
    <div>
      <div className="mb-2 flex gap-1" role="tablist" aria-label="Code snippets">
        {TABS.map((tab) => (
          <button
            key={tab.lang}
            type="button"
            role="tab"
            aria-selected={lang === tab.lang}
            onClick={() => setLang(tab.lang)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              lang === tab.lang
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <CodeBlock code={code} label={`Copy ${lang} snippet`} />
    </div>
  )
}
