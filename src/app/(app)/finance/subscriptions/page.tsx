'use client'

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useForm } from 'react-hook-form'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useCategories } from '@/hooks/useCategories'
import { formatCOP } from '@/lib/currency'
import { BILLING_CYCLE_LABELS, SUBSCRIPTION_STATUS_LABELS } from '@/lib/constants'
import { todayISO } from '@/lib/dates'
import type { Subscription, SubscriptionInsert } from '@/types'
import styles from './page.module.css'

const STATUS_COLORS: Record<string, string> = {
  active: 'var(--success)',
  paused: 'var(--warning)',
  cancelled: 'var(--muted)',
}

const columns: ColumnDef<Subscription>[] = [
  { accessorKey: 'name', header: 'Nombre' },
  {
    id: 'category',
    header: 'Categoría',
    cell: ({ row }) =>
      row.original.category ? `${row.original.category.icon ?? ''} ${row.original.category.name}` : '—',
  },
  {
    accessorKey: 'amount',
    header: 'Monto',
    cell: (info) => formatCOP(info.getValue() as number),
  },
  {
    accessorKey: 'billing_cycle',
    header: 'Ciclo',
    cell: (info) => BILLING_CYCLE_LABELS[info.getValue() as string] ?? info.getValue(),
  },
  {
    accessorKey: 'next_billing_date',
    header: 'Próximo cobro',
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: (info) => (
      <span style={{ color: STATUS_COLORS[info.getValue() as string], fontWeight: 600, fontSize: '0.8125rem' }}>
        {SUBSCRIPTION_STATUS_LABELS[info.getValue() as string] ?? info.getValue()}
      </span>
    ),
  },
]

type FormFields = SubscriptionInsert & { amount: number }

export default function SubscriptionsPage() {
  const { subscriptions, isLoading, mutate } = useSubscriptions()
  const { categories } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Subscription | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: subscriptions,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const { register, handleSubmit, reset } = useForm<FormFields>({
    defaultValues: { status: 'active', billing_cycle: 'monthly', next_billing_date: todayISO() },
  })

  function openCreate() {
    reset({ status: 'active', billing_cycle: 'monthly', next_billing_date: todayISO(), amount: 0 })
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(sub: Subscription) {
    reset({
      name: sub.name,
      amount: sub.amount,
      billing_cycle: sub.billing_cycle,
      next_billing_date: sub.next_billing_date,
      status: sub.status,
      category_id: sub.category_id,
      notes: sub.notes ?? '',
    })
    setEditing(sub)
    setShowForm(true)
  }

  async function onSubmit(data: FormFields) {
    const payload = { ...data, amount: Number(data.amount) }
    if (editing) {
      await fetch(`/api/subscriptions/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }
    await mutate()
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' })
    await mutate()
  }

  const totalActive = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Suscripciones</h1>
          <p className={styles.subtitle}>
            Total activas: <strong>{formatCOP(totalActive)}</strong>/mes
          </p>
        </div>
        <button onClick={openCreate} className={styles.addBtn}>+ Nueva suscripción</button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>{editing ? 'Editar suscripción' : 'Nueva suscripción'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label>Nombre</label>
                <input {...register('name', { required: true })} placeholder="Netflix, Spotify..." />
              </div>
              <div className={styles.field}>
                <label>Monto (COP)</label>
                <input type="number" min="0" {...register('amount', { required: true, valueAsNumber: true })} placeholder="0" />
              </div>
            </div>
            <div className={styles.formRow}>
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
            <div className={styles.formRow}>
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
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.field}>
              <label>Notas (opcional)</label>
              <input {...register('notes')} placeholder="..." />
            </div>
            <div className={styles.formActions}>
              <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn}>Cancelar</button>
              <button type="submit" className={styles.submitBtn}>{editing ? 'Guardar' : 'Agregar'}</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <p className={styles.empty}>Cargando...</p>
      ) : subscriptions.length === 0 ? (
        <p className={styles.empty}>No tienes suscripciones registradas.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th key={header.id} className={styles.th} onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' ? ' ↑' : header.column.getIsSorted() === 'desc' ? ' ↓' : ''}
                    </th>
                  ))}
                  <th className={styles.th}></th>
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className={styles.tr}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={styles.td}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                  <td className={styles.td}>
                    <div className={styles.rowActions}>
                      <button onClick={() => openEdit(row.original)} className={styles.editBtn}>Editar</button>
                      <button onClick={() => handleDelete(row.original.id)} className={styles.deleteBtn}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
