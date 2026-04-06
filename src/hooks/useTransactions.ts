import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import type { Transaction } from '@/types'

interface Filters {
  year: number
  month: number
  type?: 'expense' | 'income' | 'all'
  category_id?: string
}

export function useTransactions(filters: Filters) {
  const params = new URLSearchParams()
  params.set('year', String(filters.year))
  params.set('month', String(filters.month))
  if (filters.type && filters.type !== 'all') params.set('type', filters.type)
  if (filters.category_id) params.set('category_id', filters.category_id)

  const { data, error, isLoading, mutate } = useSWR<Transaction[]>(
    ['transactions', filters.year, filters.month, filters.type, filters.category_id],
    () => fetcher(`/api/transactions?${params}`)
  )
  return { transactions: data ?? [], error, isLoading, mutate }
}
