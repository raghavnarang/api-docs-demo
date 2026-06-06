import { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { SearchDialog } from './SearchDialog'
import { useSearchUiStore } from '../store'
import { UserMenu } from '../../auth/components/UserMenu'

/**
 * Persistent two-column portal layout: a slim header (with the search trigger) +
 * a fixed sidebar + the routed page. Owns the global Cmd/Ctrl+K shortcut (open)
 * and Escape (close) for the search dialog; the dialog itself is mounted once here.
 * Future portal sections (sandbox, keys, …) render into the Outlet.
 */
export function AppShell() {
  const open = useSearchUiStore((s) => s.open)
  const setOpen = useSearchUiStore((s) => s.setOpen)
  const toggle = useSearchUiStore((s) => s.toggle)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggle()
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggle, setOpen])

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur">
        <span className="text-sm font-semibold text-slate-900">
          Developer Portal
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Search APIs"
          >
            <Search className="h-4 w-4" aria-hidden />
            <span>Search…</span>
            <kbd className="rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
              ⌘K
            </kbd>
          </button>
          <UserMenu />
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-72 shrink-0 border-r border-slate-200 bg-slate-50/50 md:block">
          <Sidebar />
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      {open ? <SearchDialog /> : null}
    </div>
  )
}
