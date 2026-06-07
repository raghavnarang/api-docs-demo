import { useEffect } from 'react'

/** Shared id of the 1px marker ApiDocsPage renders after the last endpoint. */
export const DOCS_BOTTOM_SENTINEL_ID = 'docs-bottom-sentinel'

/**
 * Tracks the active docs-TOC section via IntersectionObserver and reports it
 * through `onActiveChange` (deduped) — no internal state, so the caller owns the
 * single source of truth.
 *
 * Active = topmost section crossing a top band; `rootMargin` trims the top by
 * `offset` (the sticky header) so the match is the section a TOC click lands at
 * the top. A second observer on a bottom sentinel forces the last id at page
 * bottom, where short final sections never reach the top line.
 *
 * Call from the component that renders the sections (so they're mounted when the
 * effect attaches). `ids` must be in document order.
 */
export function useScrollSpy(
  ids: string[],
  onActiveChange: (id: string | null) => void,
  offset = 96,
  sentinelId: string = DOCS_BOTTOM_SENTINEL_ID,
): void {
  const key = ids.join('|')
  // `onActiveChange` is intentionally excluded from the effect deps: callers pass
  // a stable callback (e.g. a store action), so re-subscribing the observers on
  // its identity would be wasteful. If a caller ever needs a changing callback,
  // wrap it in a latest-value ref here.
  useEffect(() => {
    let lastEmitted: string | null = null
    const emit = (id: string | null) => {
      if (id === lastEmitted) return
      lastEmitted = id
      onActiveChange(id)
    }

    if (ids.length === 0) {
      emit(null)
      return
    }

    const intersecting = new Set<string>()
    let atBottom = false

    const recompute = () => {
      if (atBottom) {
        emit(ids[ids.length - 1])
        return
      }
      // Topmost section still intersecting the top band. If none (a gap between
      // sections), keep the previous active rather than flickering to null.
      const topmost = ids.find((id) => intersecting.has(id))
      if (topmost) emit(topmost)
    }

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target.id)
          else intersecting.delete(entry.target.id)
        }
        recompute()
      },
      { rootMargin: `-${offset}px 0px -70% 0px`, threshold: 0 },
    )
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) sectionObserver.observe(el)
    }

    let bottomObserver: IntersectionObserver | undefined
    const sentinel = document.getElementById(sentinelId)
    if (sentinel) {
      bottomObserver = new IntersectionObserver(
        ([entry]) => {
          atBottom = entry.isIntersecting
          recompute()
        },
        { threshold: 0 },
      )
      bottomObserver.observe(sentinel)
    }

    return () => {
      sectionObserver.disconnect()
      bottomObserver?.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, offset, sentinelId])
}
