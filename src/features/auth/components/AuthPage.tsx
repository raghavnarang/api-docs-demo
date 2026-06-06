import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../../lib/auth/auth-context'
import { Button } from '../../../components/Button'
import { Input } from '../../../components/Input'
import { credentialsSchema, fieldErrors } from '../validation'

type Mode = 'signin' | 'signup'

const copy: Record<Mode, { title: string; cta: string; toggle: string; toggleCta: string }> = {
  signin: {
    title: 'Sign in',
    cta: 'Sign in',
    toggle: "Don't have an account?",
    toggleCta: 'Sign up',
  },
  signup: {
    title: 'Create account',
    cta: 'Sign up',
    toggle: 'Already have an account?',
    toggleCta: 'Sign in',
  },
}

/**
 * Combined sign-in / sign-up form. Validates credentials client-side (Zod),
 * then delegates to the auth provider via `useAuth()` — no provider-specific
 * logic lives here. Surfaces field errors, submit/API errors, and the
 * email-confirmation case for sign-up.
 */
export function AuthPage({ redirectTo }: { redirectTo?: string }) {
  const navigate = useNavigate()
  const { signIn, signUp, session } = useAuth()

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Partial<Record<'email' | 'password', string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmNotice, setConfirmNotice] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const text = copy[mode]

  // Navigate reactively once the session lands. signIn/signUp resolve before the
  // provider's onAuthStateChange has updated context/router; navigating here
  // (rather than imperatively after the await) guarantees the router context
  // already carries the session, so the destination's guard lets us through.
  useEffect(() => {
    if (session) navigate({ to: redirectTo ?? '/docs' })
  }, [session, navigate, redirectTo])

  const switchMode = () => {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
    setErrors({})
    setFormError(null)
    setConfirmNotice(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setConfirmNotice(false)

    const parsed = credentialsSchema.safeParse({ email, password })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      if (mode === 'signup') {
        const result = await signUp(parsed.data)
        // No token => provider requires email confirmation; no session is
        // created, so prompt the user to confirm. Otherwise the session arrives
        // via onAuthStateChange and the effect above handles the redirect.
        if (!result.token) {
          setConfirmNotice(true)
        }
      } else {
        await signIn(parsed.data)
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">{text.title}</h1>
        <p className="mt-1 text-sm text-slate-500">Developer Portal</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          {formError ? (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          ) : null}
          {confirmNotice ? (
            <p role="status" className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
              Check your email to confirm your account, then sign in.
            </p>
          ) : null}

          <Button type="submit" loading={submitting}>
            {text.cta}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          {text.toggle}{' '}
          <button
            type="button"
            onClick={switchMode}
            className="font-medium text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {text.toggleCta}
          </button>
        </p>
      </div>
    </div>
  )
}
