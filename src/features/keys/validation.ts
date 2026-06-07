import { z } from 'zod'

/**
 * Validation for the create-key form (§2.4). Runs client-side for immediate
 * field-level feedback; a real backend would re-validate server-side.
 *
 * `expiresAt` is an optional `yyyy-mm-dd` from a native date input. Empty means
 * "no expiry"; when provided it must be a future date.
 */
export const createKeySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(40, 'Name must be 40 characters or fewer'),
  environment: z.enum(['sandbox', 'production']),
  expiresAt: z
    .string()
    .optional()
    .refine(
      (value) => !value || new Date(value) > new Date(),
      'Expiry must be a future date',
    ),
})

export type CreateKeyFormInput = z.infer<typeof createKeySchema>

/** Flatten a Zod error into a `{ field: message }` map for form rendering. */
export function fieldErrors(
  error: z.ZodError<CreateKeyFormInput>,
): Partial<Record<keyof CreateKeyFormInput, string>> {
  const out: Partial<Record<keyof CreateKeyFormInput, string>> = {}
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof CreateKeyFormInput
    if (key && !out[key]) out[key] = issue.message
  }
  return out
}
