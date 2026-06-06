import { z } from 'zod'

/**
 * Credential validation for the sign-in / sign-up form. Runs client-side before
 * any network call so users get immediate field-level feedback; the provider
 * still enforces its own rules server-side.
 */
export const credentialsSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
})

export type CredentialsInput = z.infer<typeof credentialsSchema>

/** Flatten a Zod error into a `{ field: message }` map for form rendering. */
export function fieldErrors(
  error: z.ZodError<CredentialsInput>,
): Partial<Record<keyof CredentialsInput, string>> {
  const out: Partial<Record<keyof CredentialsInput, string>> = {}
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof CredentialsInput
    if (key && !out[key]) out[key] = issue.message
  }
  return out
}
