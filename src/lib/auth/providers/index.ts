import type { AuthProviderKind } from '../../../app/config'
import type { AuthProvider } from '../types'
import { createMockAuthProvider } from './mock'
import { createSupabaseAuthProvider } from './supabase'

/**
 * Type-safe adapter registry: every AuthProviderKind must map to a factory.
 * Unimplemented providers throw only when actually selected + invoked; their
 * secrets (URLs, keys) are read from env inside each factory when added.
 */
export const authProviderRegistry: Record<
  AuthProviderKind,
  () => AuthProvider
> = {
  mock: createMockAuthProvider,
  supabase: createSupabaseAuthProvider,
  firebase: notImplemented('firebase'),
  auth0: notImplemented('auth0'),
  'custom-jwt': notImplemented('custom-jwt'),
}

function notImplemented(kind: string): () => AuthProvider {
  return () => {
    throw new Error(`Auth provider "${kind}" is not implemented yet`)
  }
}
