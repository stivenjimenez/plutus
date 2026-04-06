export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string | null
  created_at: string
}

export type CategoryInsert = Pick<Category, 'name' | 'color' | 'icon'>
export type CategoryUpdate = Partial<CategoryInsert>
