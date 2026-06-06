import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'

const navigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
}))

const signIn = vi.fn()
const signUp = vi.fn()
// Mutable auth state so tests can simulate the session landing after sign-in
// (the real provider updates it asynchronously via onAuthStateChange).
const authState: { session: { user: { id: string; email: string }; token: string } | null } = {
  session: null,
}
vi.mock('../../../lib/auth/auth-context', () => ({
  useAuth: () => ({
    signIn,
    signUp,
    signOut: vi.fn(),
    get session() {
      return authState.session
    },
    loading: false,
  }),
}))

import { AuthPage } from './AuthPage'

function fill(email: string, password: string) {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } })
}

beforeEach(() => {
  vi.clearAllMocks()
  authState.session = null
})

describe('AuthPage', () => {
  test('shows validation errors and does not call the provider on bad input', async () => {
    render(<AuthPage />)
    fill('not-an-email', 'short')
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument()
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    expect(signIn).not.toHaveBeenCalled()
  })

  test('signs in with valid credentials and redirects once the session lands', async () => {
    // signIn resolves before the session propagates; the component navigates
    // reactively when the session appears, not right after the await.
    signIn.mockImplementation(() => {
      authState.session = { user: { id: 'u', email: 'dev@example.com' }, token: 'tok' }
      return Promise.resolve()
    })
    const { rerender } = render(<AuthPage redirectTo="/keys" />)
    fill('dev@example.com', 'password1')
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() =>
      expect(signIn).toHaveBeenCalledWith({
        email: 'dev@example.com',
        password: 'password1',
      }),
    )
    // Simulate the provider's onAuthStateChange re-rendering the tree.
    rerender(<AuthPage redirectTo="/keys" />)
    await waitFor(() => expect(navigate).toHaveBeenCalledWith({ to: '/keys' }))
  })

  test('surfaces the provider error message on failure', async () => {
    signIn.mockRejectedValue(new Error('Invalid login credentials'))
    render(<AuthPage />)
    fill('dev@example.com', 'password1')
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Invalid login credentials')).toBeInTheDocument()
    expect(navigate).not.toHaveBeenCalled()
  })

  test('signup requiring email confirmation shows a notice instead of redirecting', async () => {
    signUp.mockResolvedValue({ user: { id: 'u', email: 'new@x.com' }, token: '' })
    render(<AuthPage />)
    // toggle to sign-up mode
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    fill('new@x.com', 'password1')
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(await screen.findByText(/check your email/i)).toBeInTheDocument()
    expect(navigate).not.toHaveBeenCalled()
  })
})
