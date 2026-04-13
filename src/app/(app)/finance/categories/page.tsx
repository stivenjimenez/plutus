'use client'

import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { useCategories } from '@/hooks/useCategories'
import CategoryForm from '@/components/features/categories/CategoryForm/CategoryForm'
import Drawer from '@/components/layout/Drawer/Drawer'
import type { Category, CategoryInsert } from '@/types'
import styles from './page.module.css'

const col = createColumnHelper<Category>()

export default function CategoriesPage() {
  const { categories, isLoading, mutate } = useCategories()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  async function handleCreate(data: CategoryInsert) {
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await mutate()
    setDrawerOpen(false)
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

  const columns = useMemo(() => [
    col.accessor('name', {
      header: 'Nombre',
      cell: (info) => <span className={styles.cellName}>{info.getValue()}</span>,
    }),
    col.accessor('created_at', {
      header: 'Creada',
      cell: (info) => (
        <span className={styles.cellMono}>
          {new Date(info.getValue()).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    }),
    col.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className={styles.cellActions}>
          <button
            className={styles.editBtn}
            onClick={() => { setEditing(row.original); setDrawerOpen(false) }}
          >
            Editar
          </button>
          <button
            className={styles.deleteBtn}
            onClick={() => handleDelete(row.original.id)}
            disabled={deleting === row.original.id}
          >
            {deleting === row.original.id ? '...' : 'Eliminar'}
          </button>
        </div>
      ),
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [deleting])

  const filtered = useMemo(
    () => categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [categories, search]
  )

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const drawerTitle = editing ? 'Editar categoría' : 'Nueva categoría'
  const isDrawerOpen = drawerOpen || editing !== null

  function closeDrawer() {
    setDrawerOpen(false)
    setEditing(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Categorías</h1>
          <p className={styles.subtitle}>Organiza tus gastos e ingresos</p>
        </div>
        <button className={styles.addBtn} onClick={() => { setEditing(null); setDrawerOpen(true) }}>
          + Nueva categoría
        </button>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Buscar categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p className={styles.empty}>Cargando...</p>
      ) : categories.length === 0 ? (
        <p className={styles.empty}>No tienes categorías aún. Crea la primera.</p>
      ) : filtered.length === 0 ? (
        <p className={styles.empty}>Sin resultados para &ldquo;{search}&rdquo;.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th key={header.id} className={styles.th}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isDrawerOpen && (
        <Drawer title={drawerTitle} onClose={closeDrawer}>
          <CategoryForm
            initial={editing ?? undefined}
            onSave={editing ? handleEdit : handleCreate}
            onCancel={closeDrawer}
          />
        </Drawer>
      )}
    </div>
  )
}
