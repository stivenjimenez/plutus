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
import { useDebts } from '@/hooks/useDebts'
import { useCategories } from '@/hooks/useCategories'
import { formatCOP } from '@/lib/currency'
import { DEBT_TYPE_LABELS } from '@/lib/constants'
import type { Debt, DebtInsert } from '@/types'
import styles from './page.module.css'

function UtilizationBar({ pct }: { pct: number }) {
  const color = pct < 30 ? 'var(--success)' : pct < 70 ? 'var(--warning)' : 'var(--danger)'
  return (
    <div className={styles.utilBar}>
      <div className={styles.utilFill} style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      <span className={styles.utilLabel} style={{ color }}>{pct.toFixed(0)}%</span>
    </div>
  )
}

const columns: ColumnDef<Debt>[] = [
  { accessorKey: 'name', header: 'Nombre' },
  {
    accessorKey: 'type',
    header: 'Tipo',
    cell: (info) => DEBT_TYPE_LABELS[info.getValue() as string] ?? info.getValue(),
  },
  { accessorKey: 'institution', header: 'Entidad', cell: (info) => info.getValue() as string || '—' },
  {
    accessorKey: 'current_balance',
    header: 'Saldo actual',
    cell: (info) => formatCOP(info.getValue() as number),
  },
  {
    accessorKey: 'annual_interest_rate',
    header: 'TEA %',
    cell: (info) => `${(info.getValue() as number).toFixed(2)}%`,
  },
  {
    id: 'utilization',
    header: 'Utilización',
    cell: ({ row }) =>
      row.original.utilization_pct != null ? (
        <UtilizationBar pct={row.original.utilization_pct} />
      ) : (
        <span style={{ color: 'var(--muted)' }}>—</span>
      ),
  },
  {
    id: 'payment_info',
    header: 'Pago',
    cell: ({ row }) => {
      const d = row.original
      if (d.type === 'credit_card' && d.payment_due_day) {
        return `Límite día ${d.payment_due_day}`
      }
      if (d.type === 'personal_loan' && d.monthly_payment) {
        return formatCOP(d.monthly_payment)
      }
      return '—'
    },
  },
]

type FormFields = Omit<DebtInsert, 'is_paid_off' | 'autopay_enabled'> & {
  is_paid_off: boolean
  autopay_enabled: boolean
  current_balance: number
  credit_limit: number
  annual_interest_rate: number
  monthly_interest_rate: number
  minimum_payment: number
  monthly_payment: number
  cut_off_day: number
  payment_due_day: number
  grace_period_days: number
}

export default function DebtsPage() {
  const { debts, isLoading, mutate } = useDebts()
  const { categories } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Debt | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: debts,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const { register, handleSubmit, reset, watch } = useForm<FormFields>({
    defaultValues: {
      type: 'credit_card',
      is_paid_off: false,
      autopay_enabled: false,
      grace_period_days: 0,
    },
  })

  const debtType = watch('type')

  function openCreate() {
    reset({ type: 'credit_card', is_paid_off: false, autopay_enabled: false, grace_period_days: 0 })
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(debt: Debt) {
    reset({ ...debt } as FormFields)
    setEditing(debt)
    setShowForm(true)
  }

  async function onSubmit(data: FormFields) {
    const payload = {
      ...data,
      current_balance: Number(data.current_balance),
      credit_limit: data.credit_limit ? Number(data.credit_limit) : null,
      annual_interest_rate: Number(data.annual_interest_rate),
      monthly_interest_rate: Number(data.monthly_interest_rate),
      minimum_payment: data.minimum_payment ? Number(data.minimum_payment) : null,
      monthly_payment: data.monthly_payment ? Number(data.monthly_payment) : null,
      cut_off_day: data.cut_off_day ? Number(data.cut_off_day) : null,
      payment_due_day: data.payment_due_day ? Number(data.payment_due_day) : null,
      grace_period_days: Number(data.grace_period_days ?? 0),
    }

    if (editing) {
      await fetch(`/api/debts/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }
    await mutate()
    setShowForm(false)
  }

  async function handleMarkPaid(id: string) {
    await fetch(`/api/debts/${id}`, { method: 'DELETE' })
    await mutate()
  }

  const totalBalance = debts.reduce((s, d) => s + d.current_balance, 0)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Deudas</h1>
          <p className={styles.subtitle}>
            Total adeudado: <strong>{formatCOP(totalBalance)}</strong>
          </p>
        </div>
        <button onClick={openCreate} className={styles.addBtn}>+ Nueva deuda</button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>{editing ? 'Editar deuda' : 'Nueva deuda'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {/* Base fields */}
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label>Nombre</label>
                <input {...register('name', { required: true })} placeholder="Tarjeta Bancolombia..." />
              </div>
              <div className={styles.field}>
                <label>Tipo</label>
                <select {...register('type')}>
                  {Object.entries(DEBT_TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label>Entidad (banco/financiera)</label>
                <input {...register('institution')} placeholder="Bancolombia..." />
              </div>
              <div className={styles.field}>
                <label>Últimos 4 dígitos</label>
                <input {...register('account_last_four')} maxLength={4} placeholder="1234" />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label>Saldo actual (COP)</label>
                <input type="number" min="0" {...register('current_balance', { required: true, valueAsNumber: true })} placeholder="0" />
              </div>
              <div className={styles.field}>
                <label>{debtType === 'credit_card' ? 'Cupo total' : 'Capital original'} (COP)</label>
                <input type="number" min="0" {...register('credit_limit', { valueAsNumber: true })} placeholder="0" />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label>TEA % (Tasa Efectiva Anual)</label>
                <input type="number" step="0.0001" min="0" {...register('annual_interest_rate', { required: true, valueAsNumber: true })} placeholder="28.5" />
              </div>
              <div className={styles.field}>
                <label>TEM % (Tasa Efectiva Mensual)</label>
                <input type="number" step="0.0001" min="0" {...register('monthly_interest_rate', { required: true, valueAsNumber: true })} placeholder="2.1" />
              </div>
            </div>

            {/* Credit card specific */}
            {debtType === 'credit_card' && (
              <div className={styles.conditionalSection}>
                <p className={styles.sectionLabel}>Tarjeta de crédito</p>
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label>Día de corte</label>
                    <input type="number" min="1" max="31" {...register('cut_off_day', { valueAsNumber: true })} placeholder="15" />
                  </div>
                  <div className={styles.field}>
                    <label>Día límite de pago</label>
                    <input type="number" min="1" max="31" {...register('payment_due_day', { valueAsNumber: true })} placeholder="5" />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label>Pago mínimo (COP)</label>
                    <input type="number" min="0" {...register('minimum_payment', { valueAsNumber: true })} placeholder="0" />
                  </div>
                  <div className={styles.field}>
                    <label>Días de gracia</label>
                    <input type="number" min="0" {...register('grace_period_days', { valueAsNumber: true })} placeholder="0" />
                  </div>
                </div>
              </div>
            )}

            {/* Loan specific */}
            {debtType === 'personal_loan' && (
              <div className={styles.conditionalSection}>
                <p className={styles.sectionLabel}>Préstamo personal</p>
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label>Cuota mensual (COP)</label>
                    <input type="number" min="0" {...register('monthly_payment', { valueAsNumber: true })} placeholder="0" />
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
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label>Fecha inicio</label>
                    <input type="date" {...register('start_date')} />
                  </div>
                  <div className={styles.field}>
                    <label>Fecha fin</label>
                    <input type="date" {...register('end_date')} />
                  </div>
                </div>
              </div>
            )}

            <div className={styles.checkRow}>
              <label>
                <input type="checkbox" {...register('autopay_enabled')} /> Débito automático activado
              </label>
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
      ) : debts.length === 0 ? (
        <p className={styles.empty}>No tienes deudas activas. ¡Excelente!</p>
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
                      <button onClick={() => handleMarkPaid(row.original.id)} className={styles.paidBtn}>Pagada</button>
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
