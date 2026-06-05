import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-900">
      <h1 className="text-3xl font-bold">Developer Portal</h1>
      <p className="text-slate-500">Hello — project scaffold is running.</p>
    </main>
  )
}
