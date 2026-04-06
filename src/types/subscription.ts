import type { Category } from './category'

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual'
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled'

export interface Subscription {
  id: string
  user_id: string
  category_id: string | null
  name: string
  amount: number
  billing_cycle: BillingCycle
  next_billing_date: string
  status: SubscriptionStatus
  notes: string | null
  created_at: string
  category?: Category
}

export type SubscriptionInsert = Pick<
  Subscription,
  'category_id' | 'name' | 'amount' | 'billing_cycle' | 'next_billing_date' | 'status' | 'notes'
>
export type SubscriptionUpdate = Partial<SubscriptionInsert>
