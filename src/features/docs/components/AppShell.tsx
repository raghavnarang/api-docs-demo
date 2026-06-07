import { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Menu, Search, X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { SearchDialog } from './SearchDialog'
import { useSidebarUiStore, useSearchUiStore } from '../store'
import { UserMenu } from '../../auth/components/UserMenu'
import { IncidentBanner } from '../../status/components/IncidentBanner'

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

  const sidebarOpen = useSidebarUiStore((s) => s.open)
  const setSidebarOpen = useSidebarUiStore((s) => s.setOpen)
  const toggleSidebar = useSidebarUiStore((s) => s.toggle)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggle()
      } else if (e.key === 'Escape') {
        setOpen(false)
        setSidebarOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggle, setOpen, setSidebarOpen])

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSidebar}
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-500 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
          <Link to="/" className="text-sm font-semibold text-slate-900 hover:text-blue-600">
            Developer Portal
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Search APIs"
          >
            <Search className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Search…</span>
            <kbd className="hidden rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 sm:inline">
              ⌘K
            </kbd>
          </button>
          <UserMenu />
        </div>
      </header>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex">
        {/* Desktop sidebar — static, always visible */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-72 shrink-0 border-r border-slate-200 bg-slate-50/50 md:block">
          <Sidebar />
        </aside>

        {/* Mobile sidebar — slides in from left */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out md:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-hidden={!sidebarOpen}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4">
            <span className="text-sm font-semibold text-slate-900">Navigation</span>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Sidebar />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <IncidentBanner />
          <Outlet />
        </main>
      </div>

      {open ? <SearchDialog /> : null}
    </div>
  )
}
