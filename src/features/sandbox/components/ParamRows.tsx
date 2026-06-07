import { Plus, X } from 'lucide-react'
import type { KeyValueRow } from '../../../lib/sandbox/build-request'

/**
 * Editable key/value rows for one request section (path params, query params,
 * or headers). Spec-seeded rows can lock their key and be marked required;
 * `addable` sections let the user append/remove arbitrary rows.
 */
export function ParamRows({
  title,
  rows,
  onChange,
  lockKeys = false,
  addable = false,
  requiredNames,
}: {
  title: string
  rows: KeyValueRow[]
  onChange: (rows: KeyValueRow[]) => void
  lockKeys?: boolean
  addable?: boolean
  requiredNames?: Set<string>
}) {
  const update = (index: number, patch: Partial<KeyValueRow>) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))

  const remove = (index: number) =>
    onChange(rows.filter((_, i) => i !== index))

  const add = () =>
    onChange([...rows, { key: '', value: '', enabled: true }])

  if (rows.length === 0 && !addable) return null

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </h4>
        {addable ? (
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Add
          </button>
        ) : null}
      </div>

      <div className="space-y-2">
        {rows.map((row, index) => {
          const required = requiredNames?.has(row.key) ?? false
          const missing = required && !row.value.trim()
          return (
            <div key={index} className="flex items-center gap-2">
              {addable ? (
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={(e) => update(index, { enabled: e.target.checked })}
                  aria-label={`Enable ${row.key || 'row'}`}
                  className="h-4 w-4 rounded border-slate-300"
                />
              ) : null}
              <div className="relative flex-1">
                <input
                  value={row.key}
                  readOnly={lockKeys}
                  onChange={(e) => update(index, { key: e.target.value })}
                  placeholder="key"
                  className={`w-full rounded-md border px-2 py-1.5 font-mono text-xs ${
                    lockKeys
                      ? 'border-slate-200 bg-slate-50 text-slate-600'
                      : 'border-slate-300'
                  }`}
                />
                {required ? (
                  <span className="absolute -top-1.5 right-1 text-[10px] font-medium text-red-600">
                    required
                  </span>
                ) : null}
              </div>
              <input
                value={row.value}
                onChange={(e) => update(index, { value: e.target.value })}
                placeholder="value"
                aria-invalid={missing || undefined}
                className={`flex-1 rounded-md border px-2 py-1.5 font-mono text-xs ${
                  missing ? 'border-red-400' : 'border-slate-300'
                }`}
              />
              {addable ? (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label="Remove row"
                  className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
