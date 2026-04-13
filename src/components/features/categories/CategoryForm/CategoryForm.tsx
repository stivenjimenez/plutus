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
    defaultValues: { name: initial?.name ?? '' },
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
          autoFocus
        />
        {errors.name && <span className={styles.error}>{errors.name.message}</span>}
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
