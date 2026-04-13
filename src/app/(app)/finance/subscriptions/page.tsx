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
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { formatCOP } from '@/lib/currency'
import { BILLING_CYCLE_LABELS, SUBSCRIPTION_STATUS_LABELS } from '@/lib/constants'
import type { Subscription, SubscriptionInsert } from '@/types'
import SubscriptionDrawer from '@/components/features/subscriptions/SubscriptionDrawer/SubscriptionDrawer'
import styles from './page.module.css'

type FormFields = SubscriptionInsert & { amount: number }

const STATUS_CLASS: Record<string, string> = {
  active: 'statusActive',
  paused: 'statusPaused',
  cancelled: 'statusCancelled',
}

const columns: ColumnDef<Subscription>[] = [
  { accessorKey: 'name', header: 'Nombre' },
  {
    id: 'category',
    header: 'Categoría',
    cell: ({ row }) =>
      row.original.category ? row.original.category.name : '—',
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
      <span className={styles[STATUS_CLASS[info.getValue() as string] ?? 'statusCancelled']}>
        {SUBSCRIPTION_STATUS_LABELS[info.getValue() as string] ?? info.getValue()}
      </span>
    ),
  },
]

export default function SubscriptionsPage() {
  const { subscriptions, isLoading, mutate } = useSubscriptions()
  const [drawerOpen, setDrawerOpen] = useState(false)
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

  function openCreate() {
    setEditing(null)
    setDrawerOpen(true)
  }

  function openEdit(sub: Subscription) {
    setEditing(sub)
    setDrawerOpen(true)
  }

  function closeDrawer() {
    setDrawerOpen(false)
    setEditing(null)
  }

  async function handleSubmit(data: FormFields) {
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
    closeDrawer()
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
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Suscripciones activas</h1>
          <div className={styles.heroRow}>
            <span className={styles.heroAmount}>{formatCOP(totalActive)}</span>
            <span className={styles.heroUnit}>/mes</span>
          </div>
        </div>
        <button onClick={openCreate} className={styles.addBtn}>+ Nueva suscripción</button>
      </div>

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

      {drawerOpen && (
        <SubscriptionDrawer
          editing={editing}
          onClose={closeDrawer}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
