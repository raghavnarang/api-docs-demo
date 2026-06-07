/**
 * Resolves a stable owner identifier from an auth token, behind the DAL.
 *
 * Real backends never trust a client-supplied user id — they read the token and
 * derive the subject server-side. The local-json adapter mimics that: it decodes
 * the JWT payload and returns the `sub` claim (Supabase/Auth0/custom-JWT tokens
 * are all JWTs). Opaque tokens that aren't JWTs (e.g. the in-memory mock token)
 * fall back to the raw token string, which is still a stable per-session owner.
 */
export function resolveOwner(token: string): string {
  const sub = decodeJwtSub(token)
  return sub ?? token
}

/** Extract the `sub` claim from a JWT, or null if the token isn't a decodable JWT. */
function decodeJwtSub(token: string): string | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(payload)
    const claims = JSON.parse(json) as { sub?: unknown }
    return typeof claims.sub === 'string' && claims.sub.length > 0
      ? claims.sub
      : null
  } catch {
    return null
  }
}
