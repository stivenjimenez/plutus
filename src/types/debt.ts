import type { Category } from './category'

export type DebtType = 'credit_card' | 'personal_loan'

export interface Debt {
  id: string
  user_id: string
  category_id: string | null
  name: string
  type: DebtType
  current_balance: number
  credit_limit: number | null
  annual_interest_rate: number
  monthly_interest_rate: number
  // Tarjeta de crédito
  cut_off_day: number | null
  payment_due_day: number | null
  minimum_payment: number | null
  // Préstamo
  monthly_payment: number | null
  start_date: string | null
  end_date: string | null
  // Adicionales
  institution: string | null
  account_last_four: string | null
  is_paid_off: boolean
  autopay_enabled: boolean
  grace_period_days: number
  notes: string | null
  created_at: string
  // Calculado en cliente
  utilization_pct?: number
  category?: Category
}

export type DebtInsert = Omit<Debt, 'id' | 'user_id' | 'created_at' | 'utilization_pct' | 'category'>
export type DebtUpdate = Partial<DebtInsert>
