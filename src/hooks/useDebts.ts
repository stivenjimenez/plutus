import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import type { Debt } from '@/types'

export function useDebts() {
  const { data, error, isLoading, mutate } = useSWR<Debt[]>('/api/debts', fetcher)

  const debtsWithUtilization = (data ?? []).map((debt) => ({
    ...debt,
    utilization_pct:
      debt.credit_limit && debt.credit_limit > 0
        ? (debt.current_balance / debt.credit_limit) * 100
        : undefined,
  }))

  return { debts: debtsWithUtilization, error, isLoading, mutate }
}
