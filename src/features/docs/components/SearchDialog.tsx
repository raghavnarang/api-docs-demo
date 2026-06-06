import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useGlobalSearch } from '../hooks/use-global-search'
import { useSearchUiStore } from '../store'
import { MethodBadge } from '../../../components/MethodBadge'
import { SkeletonLines } from '../../../components/Skeleton'
import { EmptyState } from '../../../components/EmptyState'
import { ErrorState } from '../../../components/ErrorState'

/**
 * Hand-rolled Cmd/Ctrl+K search dialog. Renders every matching endpoint grouped
 * by API; each row deep-links to `/docs/$apiId#<endpointId>` (the docs page's hash
 * effect scrolls it into view). Search logic + the cache-first two-tier resolution
 * live in `useGlobalSearch`; this component is presentation + navigation only.
 */
export function SearchDialog() {
  const close = () => useSearchUiStore.getState().setOpen(false)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const { groups, isLoading, isError, debounced } = useGlobalSearch(query)

  // Focus the input on mount (dialog is only rendered while open).
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const goTo = (apiId: string, endpointId: string) => {
    navigate({ to: '/docs/$apiId', params: { apiId }, hash: endpointId })
    close()
  }

  const hasQuery = debounced.length > 0
  const showEmpty = hasQuery && !isLoading && !isError && groups.length === 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-[12vh]"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search APIs"
        className="flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-4">
          <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search endpoints, descriptions, parameters…"
            aria-label="Search query"
            className="flex-1 bg-transparent py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
            esc
          </kbd>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {!hasQuery ? (
            <p className="px-2 py-6 text-center text-sm text-slate-400">
              Type to search across all registered APIs.
            </p>
          ) : isLoading ? (
            <div className="px-2 py-2">
              <SkeletonLines lines={4} />
            </div>
          ) : isError ? (
            <ErrorState title="Search failed" />
          ) : showEmpty ? (
            <EmptyState
              title="No matches"
              message={`Nothing matched “${debounced}”.`}
            />
          ) : (
            <ul className="space-y-4">
              {groups.map((group) => (
                <li key={group.apiId}>
                  <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {group.apiName}
                  </p>
                  <ul>
                    {group.endpoints.map((ep) => (
                      <li key={ep.id}>
                        <button
                          type="button"
                          onClick={() => goTo(group.apiId, ep.id)}
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                        >
                          <MethodBadge method={ep.method} />
                          <span className="truncate font-mono text-xs text-slate-700">
                            {ep.path}
                          </span>
                          {ep.summary ? (
                            <span className="truncate text-xs text-slate-400">
                              — {ep.summary}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
