'use client'

import { useForm } from 'react-hook-form'
import { useState } from 'react'
import type { Category, CategoryInsert } from '@/types'
import styles from './CategoryForm.module.css'

interface Props {
  initial?: Category
  onSave: (data: CategoryInsert) => Promise<void>
  onCancel: () => void
}

export default function CategoryForm({ initial, onSave, onCancel }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<CategoryInsert>({
    defaultValues: {
      name: initial?.name ?? '',
      color: initial?.color ?? '#6366f1',
      icon: initial?.icon ?? '',
    },
  })

  async function onSubmit(data: CategoryInsert) {
    setError(null)
    setLoading(true)
    try {
      await onSave(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="cat-name">Nombre</label>
        <input
          id="cat-name"
          {...register('name', { required: 'El nombre es obligatorio' })}
          placeholder="Ej: Alimentación"
        />
        {errors.name && <span className={styles.error}>{errors.name.message}</span>}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="cat-color">Color</label>
          <input id="cat-color" type="color" {...register('color')} className={styles.colorInput} />
        </div>

        <div className={styles.field} style={{ flex: 1 }}>
          <label htmlFor="cat-icon">Ícono (emoji)</label>
          <input
            id="cat-icon"
            {...register('icon')}
            placeholder="🛒"
            maxLength={4}
          />
        </div>
      </div>

      {error && <p className={styles.serverError}>{error}</p>}

      <div className={styles.actions}>
        <button type="button" onClick={onCancel} className={styles.cancel}>
          Cancelar
        </button>
        <button type="submit" disabled={loading} className={styles.submit}>
          {loading ? 'Guardando...' : initial ? 'Guardar cambios' : 'Crear categoría'}
        </button>
      </div>
    </form>
  )
}
