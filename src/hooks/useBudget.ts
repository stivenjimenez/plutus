import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import type { BudgetWithCategories } from '@/types'

export function useBudget(year: number, month: number) {
  const { data, error, isLoading, mutate } = useSWR<BudgetWithCategories | null>(
    ['budgets', year, month],
    () => fetcher(`/api/budgets?year=${year}&month=${month}`)
  )
  return { budget: data ?? null, error, isLoading, mutate }
}
