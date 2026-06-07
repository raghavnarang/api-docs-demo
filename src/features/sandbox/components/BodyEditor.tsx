import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { AlertTriangle } from 'lucide-react'
import type { JsonParseResult } from '../../../lib/sandbox/build-request'

/**
 * JSON request-body editor (CodeMirror 6) with live parse validation. The
 * validation result is owned by the controller hook and surfaced here so an
 * invalid body blocks Send.
 */
export function BodyEditor({
  value,
  onChange,
  validation,
}: {
  value: string
  onChange: (value: string) => void
  validation: JsonParseResult
}) {
  const invalid = !validation.ok
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Body (application/json)
      </h4>
      <div
        className={`overflow-hidden rounded-md border ${
          invalid ? 'border-red-400' : 'border-slate-300'
        }`}
      >
        <CodeMirror
          value={value}
          height="200px"
          extensions={[json()]}
          onChange={onChange}
          basicSetup={{ lineNumbers: true, foldGutter: false }}
        />
      </div>
      {invalid ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
          Invalid JSON: {validation.error}
        </p>
      ) : null}
    </div>
  )
}
