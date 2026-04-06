'use client'

import { useState } from 'react'
import { useCategories } from '@/hooks/useCategories'
import CategoryForm from '@/components/features/categories/CategoryForm/CategoryForm'
import type { Category, CategoryInsert } from '@/types'
import styles from './page.module.css'

export default function CategoriesPage() {
  const { categories, isLoading, mutate } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleCreate(data: CategoryInsert) {
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await mutate()
    setShowForm(false)
  }

  async function handleEdit(data: CategoryInsert) {
    if (!editing) return
    await fetch(`/api/categories/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await mutate()
    setEditing(null)
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    await mutate()
    setDeleting(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Categorías</h1>
          <p className={styles.subtitle}>Organiza tus gastos e ingresos</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm(true)}>
          + Nueva categoría
        </button>
      </div>

      {(showForm || editing) && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>
            {editing ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          <CategoryForm
            initial={editing ?? undefined}
            onSave={editing ? handleEdit : handleCreate}
            onCancel={() => { setShowForm(false); setEditing(null) }}
          />
        </div>
      )}

      {isLoading ? (
        <p className={styles.empty}>Cargando...</p>
      ) : categories.length === 0 ? (
        <p className={styles.empty}>No tienes categorías aún. Crea la primera.</p>
      ) : (
        <div className={styles.grid}>
          {categories.map((cat) => (
            <div key={cat.id} className={styles.card}>
              <div className={styles.cardLeft}>
                <span
                  className={styles.swatch}
                  style={{ background: cat.color }}
                />
                {cat.icon && <span className={styles.catIcon}>{cat.icon}</span>}
                <span className={styles.catName}>{cat.name}</span>
              </div>
              <div className={styles.cardActions}>
                <button
                  className={styles.editBtn}
                  onClick={() => { setEditing(cat); setShowForm(false) }}
                >
                  Editar
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(cat.id)}
                  disabled={deleting === cat.id}
                >
                  {deleting === cat.id ? '...' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
