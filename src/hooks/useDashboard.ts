import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import type { DashboardData } from '@/types'

export function useDashboard(year: number, month: number) {
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    ['dashboard', year, month],
    () => fetcher(`/api/dashboard?year=${year}&month=${month}`)
  )
  return { dashboard: data ?? null, error, isLoading, mutate }
}
