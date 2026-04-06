'use client'

import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCategories } from '@/hooks/useCategories'
import { getCurrentYearMonth, getMonthLabel } from '@/lib/dates'
import type { Category } from '@/types'
import styles from './page.module.css'

interface NewBudgetFields {
  year: number
  month: number
  total_amount: number
  notes: string
}

export default function NewBudgetPage() {
  const router = useRouter()
  const { categories } = useCategories()
  const { year, month } = getCurrentYearMonth()
  const [allocations, setAllocations] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<NewBudgetFields>({
    defaultValues: { year, month, total_amount: 0, notes: '' },
  })

  const watchYear = watch('year')
  const watchMonth = watch('month')

  async function onSubmit(data: NewBudgetFields) {
    setError(null)
    setLoading(true)

    const allocationList = categories
      .map((cat: Category) => ({
        category_id: cat.id,
        allocated: Number(allocations[cat.id] ?? 0),
      }))
      .filter((a) => a.allocated > 0)

    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        total_amount: Number(data.total_amount),
        allocations: allocationList,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const body = await res.json()
      setError(body.error || 'Error al crear presupuesto')
      return
    }

    router.push('/budget')
  }

  const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Nuevo presupuesto</h1>
        <p className={styles.subtitle}>
          {watchYear && watchMonth
            ? getMonthLabel(Number(watchYear), Number(watchMonth))
            : ''}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Período</h2>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Mes</label>
              <select {...register('month', { required: true, valueAsNumber: true })}>
                {MONTHS.map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>Año</label>
              <input
                type="number"
                {...register('year', { required: true, valueAsNumber: true })}
              />
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Ingreso del mes</h2>
          <div className={styles.field}>
            <label>Total (COP)</label>
            <input
              type="number"
              min="0"
              {...register('total_amount', { required: 'El monto es obligatorio', valueAsNumber: true, min: 1 })}
              placeholder="0"
            />
            {errors.total_amount && <span className={styles.error}>{errors.total_amount.message}</span>}
          </div>
          <div className={styles.field}>
            <label>Notas (opcional)</label>
            <input type="text" {...register('notes')} placeholder="Salario + bonos..." />
          </div>
        </div>

        {categories.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Distribución por categoría (opcional)</h2>
            <p className={styles.hint}>Puedes ajustar esto después.</p>
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
                  value={allocations[cat.id] ?? ''}
                  onChange={(e) =>
                    setAllocations((prev) => ({ ...prev, [cat.id]: e.target.value }))
                  }
                  className={styles.allocInput}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        )}

        {error && <p className={styles.serverError}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" onClick={() => router.back()} className={styles.cancelBtn}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Creando...' : 'Crear presupuesto'}
          </button>
        </div>
      </form>
    </div>
  )
}
