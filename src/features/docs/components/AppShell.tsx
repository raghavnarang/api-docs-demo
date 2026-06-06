import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'

/**
 * Persistent two-column portal layout: a fixed sidebar + the routed page in the
 * main column. Future portal sections (sandbox, keys, …) render into the Outlet.
 */
export function AppShell() {
  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-slate-50/50 md:block">
        <Sidebar />
      </aside>
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
