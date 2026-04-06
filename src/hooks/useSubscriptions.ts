import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import type { Subscription } from '@/types'

export function useSubscriptions() {
  const { data, error, isLoading, mutate } = useSWR<Subscription[]>('/api/subscriptions', fetcher)
  return { subscriptions: data ?? [], error, isLoading, mutate }
}
