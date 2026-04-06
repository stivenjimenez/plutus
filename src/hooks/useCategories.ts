import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import type { Category } from '@/types'

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<Category[]>('/api/categories', fetcher)
  return { categories: data ?? [], error, isLoading, mutate }
}
