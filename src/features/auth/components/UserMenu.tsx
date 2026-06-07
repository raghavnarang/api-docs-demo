import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../../lib/auth/auth-context'
import { Button, buttonClasses } from '../../../components/Button'

/**
 * Header auth control: a "Sign in" link when signed out, or the current user's
 * email plus a sign-out button when signed in. Sign-out clears the session and
 * returns to /login (the guard would do the same on the next protected nav).
 */
export function UserMenu() {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  if (!session) {
    return (
      <Link to="/login" className={buttonClasses('primary')}>
        Sign in
      </Link>
    )
  }

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      navigate({ to: '/login' })
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-48 truncate text-sm text-slate-600 sm:inline">
        {session.user.email}
      </span>
      <Button
        variant="secondary"
        loading={signingOut}
        onClick={handleSignOut}
        className="px-2 py-1"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </div>
  )
}
