import type { Subscription } from './subscription'

export interface CategorySpending {
  category_id: string
  category_name: string
  allocated: number
  spent: number
  remaining: number
}

export interface DashboardData {
  budget_total: number | null
  category_spending: CategorySpending[]
  total_expenses: number
  total_income: number
  net_balance: number
  upcoming_subscriptions: Subscription[]
  debt_total_balance: number
  debt_count: number
}
