import type { Category } from './category'

export type TransactionType = 'expense' | 'income'

export interface Transaction {
  id: string
  user_id: string
  category_id: string | null
  type: TransactionType
  amount: number
  description: string
  date: string
  notes: string | null
  created_at: string
  category?: Category
}

export type TransactionInsert = Pick<
  Transaction,
  'category_id' | 'type' | 'amount' | 'description' | 'date' | 'notes'
>
export type TransactionUpdate = Partial<TransactionInsert>
