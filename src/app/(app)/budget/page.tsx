'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useBudget } from '@/hooks/useBudget'
import { useCategories } from '@/hooks/useCategories'
import { getCurrentYearMonth, getMonthLabel, prevMonth, nextMonth } from '@/lib/dates'
import { formatCOP } from '@/lib/currency'
import type { Category } from '@/types'
import styles from './page.module.css'

export default function BudgetPage() {
  const { year: currentYear, month: currentMonth } = getCurrentYearMonth()
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)
  const { budget, isLoading, mutate } = useBudget(year, month)
  const { categories } = useCategories()

  const [editingAllocation, setEditingAllocation] = useState(false)
  const [allocValues, setAllocValues] = useState<Record<string, string>>({})

  function handlePrev() {
    const p = prevMonth(year, month)
    setYear(p.year)
    setMonth(p.month)
  }

  function handleNext() {
    const n = nextMonth(year, month)
    setYear(n.year)
    setMonth(n.month)
  }

  function startEditAllocations() {
    const initial: Record<string, string> = {}
    budget?.budget_categories.forEach((bc) => {
      initial[bc.category_id] = String(bc.allocated)
    })
    setAllocValues(initial)
    setEditingAllocation(true)
  }

  async function saveAllocations() {
    if (!budget) return
    const allocations = categories
      .map((cat: Category) => ({
        category_id: cat.id,
        allocated: Number(allocValues[cat.id] ?? 0),
      }))
      .filter((a) => a.allocated > 0)

    await fetch(`/api/budgets/${budget.id}/categories`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allocations }),
    })
    await mutate()
    setEditingAllocation(false)
  }

  const totalAllocated = budget?.budget_categories.reduce((s, bc) => s + bc.allocated, 0) ?? 0
  const unallocated = (budget?.total_amount ?? 0) - totalAllocated

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Presupuesto</h1>
          <p className={styles.subtitle}>Distribuye tu ingreso del mes por categorías</p>
        </div>
        <Link href="/budget/new" className={styles.addBtn}>
          + Nuevo presupuesto
        </Link>
      </div>

      {/* Month selector */}
      <div className={styles.monthNav}>
        <button onClick={handlePrev} className={styles.navBtn}>‹</button>
        <span className={styles.monthLabel}>{getMonthLabel(year, month)}</span>
        <button onClick={handleNext} className={styles.navBtn}>›</button>
      </div>

      {isLoading ? (
        <p className={styles.empty}>Cargando...</p>
      ) : !budget ? (
        <div className={styles.emptyState}>
          <p>No hay presupuesto para {getMonthLabel(year, month)}.</p>
          <Link href="/budget/new" className={styles.addBtn}>
            Crear presupuesto
          </Link>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className={styles.summaryRow}>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Ingreso total</span>
              <span className={styles.summaryValue}>{formatCOP(budget.total_amount)}</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Distribuido</span>
              <span className={styles.summaryValue}>{formatCOP(totalAllocated)}</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Sin distribuir</span>
              <span className={`${styles.summaryValue} ${unallocated < 0 ? styles.danger : ''}`}>
                {formatCOP(unallocated)}
              </span>
            </div>
          </div>

          {/* Allocations */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Distribución por categoría</h2>
              {!editingAllocation ? (
                <button onClick={startEditAllocations} className={styles.editBtn}>
                  Editar distribución
                </button>
              ) : (
                <div className={styles.editActions}>
                  <button onClick={() => setEditingAllocation(false)} className={styles.cancelBtn}>
                    Cancelar
                  </button>
                  <button onClick={saveAllocations} className={styles.saveBtn}>
                    Guardar
                  </button>
                </div>
              )}
            </div>

            {editingAllocation ? (
              <div className={styles.allocForm}>
                {categories.map((cat: Category) => (
                  <div key={cat.id} className={styles.allocRow}>
                    <div className={styles.catInfo}>
                      <span className={styles.swatch} style={{ background: cat.color }} />
                      {cat.icon && <span>{cat.icon}</span>}
                      <span>{cat.name}</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={allocValues[cat.id] ?? ''}
                      onChange={(e) =>
                        setAllocValues((prev) => ({ ...prev, [cat.id]: e.target.value }))
                      }
                      className={styles.allocInput}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.allocList}>
                {budget.budget_categories.length === 0 ? (
                  <p className={styles.empty}>No hay distribución definida.</p>
                ) : (
                  budget.budget_categories.map((bc) => (
                    <div key={bc.id} className={styles.allocItem}>
                      <div className={styles.catInfo}>
                        <span className={styles.swatch} style={{ background: bc.category.color }} />
                        {bc.category.icon && <span>{bc.category.icon}</span>}
                        <span className={styles.catName}>{bc.category.name}</span>
                      </div>
                      <span className={styles.allocAmount}>{formatCOP(bc.allocated)}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
