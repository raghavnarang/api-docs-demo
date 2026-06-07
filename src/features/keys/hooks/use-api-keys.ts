import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getDataSource } from '../../../lib/data/data-source'
import { queryKeys } from '../../../lib/data/query-keys'
import type { CreateApiKeyInput } from '../../../lib/data/types'
import { useAuth } from '../../../lib/auth/auth-context'

/**
 * TanStack Query hooks for API Key Management. These are unaware of the backing
 * data source — they only know the `ApiKeyRepository` contract resolved via
 * `getDataSource()`. Swapping `appConfig.dataSource` to a REST backend needs no
 * change here.
 *
 * Identity is the session `token`, passed to the repository (which resolves the
 * owner behind the DAL). `session.user.id` is used only to partition the local
 * query cache per account; it is never sent as a fetch parameter.
 */
const keysRepo = () => getDataSource().keys

export function useApiKeys() {
  const { session } = useAuth()
  return useQuery({
    queryKey: queryKeys.keys.list(session?.user.id ?? 'anonymous'),
    queryFn: () => keysRepo().listKeys(session!.token),
    enabled: !!session,
  })
}

export function useCreateApiKey() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateApiKeyInput) =>
      keysRepo().createKey(session!.token, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.keys.all })
    },
  })
}

export function useRevokeApiKey() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => keysRepo().revokeKey(session!.token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.keys.all })
    },
  })
}
