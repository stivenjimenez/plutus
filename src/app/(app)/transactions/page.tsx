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
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { getCurrentYearMonth, getMonthLabel, prevMonth, nextMonth, todayISO } from '@/lib/dates'
import { formatCOP } from '@/lib/currency'
import { TRANSACTION_TYPE_LABELS } from '@/lib/constants'
import type { Transaction, TransactionInsert } from '@/types'
import styles from './page.module.css'

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'date',
    header: 'Fecha',
    cell: (info) => info.getValue() as string,
  },
  {
    accessorKey: 'description',
    header: 'Descripción',
  },
  {
    id: 'category',
    header: 'Categoría',
    cell: ({ row }) =>
      row.original.category ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: row.original.category.color,
              display: 'inline-block',
            }}
          />
          {row.original.category.icon} {row.original.category.name}
        </span>
      ) : (
        <span style={{ color: 'var(--muted)' }}>Sin categoría</span>
      ),
  },
  {
    accessorKey: 'type',
    header: 'Tipo',
    cell: (info) => TRANSACTION_TYPE_LABELS[info.getValue() as string] ?? info.getValue(),
  },
  {
    accessorKey: 'amount',
    header: 'Monto',
    cell: ({ row }) => (
      <span style={{ color: row.original.type === 'income' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
        {row.original.type === 'income' ? '+' : '-'}{formatCOP(row.original.amount)}
      </span>
    ),
  },
]

interface FormFields extends TransactionInsert {
  amount: number
}

export default function TransactionsPage() {
  const { year: cy, month: cm } = getCurrentYearMonth()
  const [year, setYear] = useState(cy)
  const [month, setMonth] = useState(cm)
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  const { transactions, isLoading, mutate } = useTransactions({ year, month, type: typeFilter })
  const { categories } = useCategories()

  const table = useReactTable({
    data: transactions,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormFields>({
    defaultValues: { type: 'expense', date: todayISO(), amount: 0, description: '', category_id: null, notes: '' },
  })

  function openCreate() {
    reset({ type: 'expense', date: todayISO(), amount: 0, description: '', category_id: null, notes: '' })
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(tx: Transaction) {
    reset({
      type: tx.type,
      date: tx.date,
      amount: tx.amount,
      description: tx.description,
      category_id: tx.category_id,
      notes: tx.notes ?? '',
    })
    setEditing(tx)
    setShowForm(true)
  }

  async function onSubmit(data: FormFields) {
    const payload = { ...data, amount: Number(data.amount) }
    if (editing) {
      await fetch(`/api/transactions/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }
    await mutate()
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    await mutate()
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Transacciones</h1>
          <p className={styles.subtitle}>Gastos e ingresos</p>
        </div>
        <button onClick={openCreate} className={styles.addBtn}>+ Agregar</button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.monthNav}>
          <button onClick={() => { const p = prevMonth(year, month); setYear(p.year); setMonth(p.month) }} className={styles.navBtn}>‹</button>
          <span className={styles.monthLabel}>{getMonthLabel(year, month)}</span>
          <button onClick={() => { const n = nextMonth(year, month); setYear(n.year); setMonth(n.month) }} className={styles.navBtn}>›</button>
        </div>

        <div className={styles.typeFilter}>
          {(['all', 'expense', 'income'] as const).map((t) => (
            <button
              key={t}
              className={`${styles.filterBtn} ${typeFilter === t ? styles.filterActive : ''}`}
              onClick={() => setTypeFilter(t)}
            >
              {t === 'all' ? 'Todos' : TRANSACTION_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>{editing ? 'Editar transacción' : 'Nueva transacción'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label>Tipo</label>
                <select {...register('type', { required: true })}>
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Fecha</label>
                <input type="date" {...register('date', { required: true })} />
              </div>
            </div>
            <div className={styles.field}>
              <label>Descripción</label>
              <input {...register('description', { required: 'Obligatorio' })} placeholder="Ej: Mercado" />
              {errors.description && <span className={styles.fieldError}>{errors.description.message}</span>}
            </div>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label>Monto (COP)</label>
                <input type="number" min="0" {...register('amount', { required: true, valueAsNumber: true })} placeholder="0" />
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

      {/* Table */}
      {isLoading ? (
        <p className={styles.empty}>Cargando...</p>
      ) : transactions.length === 0 ? (
        <p className={styles.empty}>No hay transacciones para este período.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={styles.th}
                    >
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
