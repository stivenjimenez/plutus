import type { Category } from './category'

export interface Budget {
  id: string
  user_id: string
  year: number
  month: number
  total_amount: number
  notes: string | null
  created_at: string
}

export interface BudgetCategory {
  id: string
  budget_id: string
  category_id: string
  allocated: number
  category: Category
}

export interface BudgetWithCategories extends Budget {
  budget_categories: BudgetCategory[]
}

export type BudgetInsert = Pick<Budget, 'year' | 'month' | 'total_amount' | 'notes'>
