import { useEffect, useState } from 'react'

/** Shared id of the 1px marker ApiDocsPage renders after the last endpoint. */
export const DOCS_BOTTOM_SENTINEL_ID = 'docs-bottom-sentinel'

/**
 * Tracks which section (by element id) is active in the docs TOC, via
 * IntersectionObserver.
 *
 * The trigger band is anchored at the top: `rootMargin` trims the top by `offset`
 * (≈ the sticky header) so sections scrolled above the click line stop counting —
 * the active section is then the topmost one still intersecting, which is exactly
 * the section a TOC click brings to the top.
 *
 * IO alone can't mark the final endpoint active at the bottom of the page (short
 * last sections never reach the top line), so a second observer watches a bottom
 * sentinel and forces the last id while it's visible.
 *
 * Call this from the component that renders the sections (so they're in the DOM
 * when the effect attaches). `ids` must be in document order; the sentinel is
 * located by id.
 */
export function useScrollSpy(
  ids: string[],
  offset = 96,
  sentinelId: string = DOCS_BOTTOM_SENTINEL_ID,
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)
  const key = ids.join('|')
  useEffect(() => {
    if (ids.length === 0) {
      setActiveId(null)
      return
    }

    const intersecting = new Set<string>()
    let atBottom = false

    const recompute = () => {
      if (atBottom) {
        setActiveId(ids[ids.length - 1])
        return
      }
      // Topmost section still intersecting the top band. If none (a gap between
      // sections), keep the previous active rather than flickering to null.
      const topmost = ids.find((id) => intersecting.has(id))
      if (topmost) setActiveId(topmost)
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

  return activeId
}
