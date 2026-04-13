'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Drawer from '@/components/layout/Drawer/Drawer'
import { useCategories } from '@/hooks/useCategories'
import { BILLING_CYCLE_LABELS, SUBSCRIPTION_STATUS_LABELS } from '@/lib/constants'
import { todayISO } from '@/lib/dates'
import type { Subscription, SubscriptionInsert } from '@/types'
import styles from './SubscriptionDrawer.module.css'

type FormFields = SubscriptionInsert & { amount: number }

interface Props {
  editing: Subscription | null
  onClose: () => void
  onSubmit: (data: FormFields) => Promise<void>
}

const FORM_ID = 'subscription-form'

export default function SubscriptionDrawer({ editing, onClose, onSubmit }: Props) {
  const { categories } = useCategories()
  const { register, handleSubmit, reset } = useForm<FormFields>({
    defaultValues: { status: 'active', billing_cycle: 'monthly', next_billing_date: todayISO(), amount: 0 },
  })

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        amount: editing.amount,
        billing_cycle: editing.billing_cycle,
        next_billing_date: editing.next_billing_date,
        status: editing.status,
        category_id: editing.category_id,
        notes: editing.notes ?? '',
      })
    } else {
      reset({ status: 'active', billing_cycle: 'monthly', next_billing_date: todayISO(), amount: 0 })
    }
  }, [editing, reset])

  const footer = (
    <>
      <button type="button" className={styles.cancelBtn} onClick={onClose}>
        Cancelar
      </button>
      <button type="submit" form={FORM_ID} className={styles.submitBtn}>
        {editing ? 'Guardar' : 'Agregar'}
      </button>
    </>
  )

  return (
    <Drawer
      title={editing ? 'Editar suscripción' : 'Nueva suscripción'}
      onClose={onClose}
      footer={footer}
    >
      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.field}>
          <label>Nombre</label>
          <input {...register('name', { required: true })} placeholder="Netflix, Spotify..." />
        </div>

        <div className={styles.field}>
          <label>Monto (COP)</label>
          <input
            type="number"
            min="0"
            {...register('amount', { required: true, valueAsNumber: true })}
            placeholder="0"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Ciclo de cobro</label>
            <select {...register('billing_cycle')}>
              {Object.entries(BILLING_CYCLE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>Próximo cobro</label>
            <input type="date" {...register('next_billing_date', { required: true })} />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Estado</label>
            <select {...register('status')}>
              {Object.entries(SUBSCRIPTION_STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>Categoría</label>
            <select {...register('category_id')}>
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label>Notas (opcional)</label>
          <input {...register('notes')} placeholder="..." />
        </div>
      </form>
    </Drawer>
  )
}
