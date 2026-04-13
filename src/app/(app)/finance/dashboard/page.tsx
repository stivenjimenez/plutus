'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useDashboard } from '@/hooks/useDashboard'
import { getCurrentYearMonth, getMonthLabel, prevMonth, nextMonth } from '@/lib/dates'
import { formatCOP } from '@/lib/currency'
import type { CategorySpending } from '@/types'
import styles from './page.module.css'

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className={styles.progressTrack}>
      <div
        className={`${styles.progressFill} ${pct >= 90 ? styles.progressDanger : ''}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function CategoryCard({ item }: { item: CategorySpending }) {
  const overBudget = item.remaining < 0
  return (
    <div className={styles.catCard}>
      <div className={styles.catHeader}>
        <span className={styles.catName}>{item.category_name}</span>
        <span className={`${styles.catRemaining} ${overBudget ? styles.over : ''}`}>
          {overBudget ? '-' : ''}{formatCOP(Math.abs(item.remaining))} restante
        </span>
      </div>
      <ProgressBar value={item.spent} max={item.allocated} />
      <div className={styles.catFooter}>
        <span>{formatCOP(item.spent)} gastado</span>
        <span>{formatCOP(item.allocated)} asignado</span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { year: cy, month: cm } = getCurrentYearMonth()
  const [year, setYear] = useState(cy)
  const [month, setMonth] = useState(cm)
  const { dashboard, isLoading } = useDashboard(year, month)

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Resumen</h1>
          <p className={styles.subtitle}>Tu foto financiera real</p>
        </div>
        <div className={styles.monthNav}>
          <button
            onClick={() => { const p = prevMonth(year, month); setYear(p.year); setMonth(p.month) }}
            className={styles.navBtn}
          >‹</button>
          <span className={styles.monthLabel}>{getMonthLabel(year, month)}</span>
          <button
            onClick={() => { const n = nextMonth(year, month); setYear(n.year); setMonth(n.month) }}
            className={styles.navBtn}
          >›</button>
        </div>
      </div>

      {isLoading ? (
        <p className={styles.empty}>Cargando...</p>
      ) : (
        <>
          {/* KPI Cards */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Presupuesto del mes</span>
              <span className={styles.kpiValue}>
                {dashboard?.budget_total != null ? formatCOP(dashboard.budget_total) : '—'}
              </span>
              {!dashboard?.budget_total && (
                <Link href="/finance/budget/new" className={styles.kpiAction}>+ Crear presupuesto</Link>
              )}
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Total gastado</span>
              <span className={`${styles.kpiValue} ${styles.expense}`}>
                {formatCOP(dashboard?.total_expenses ?? 0)}
              </span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Balance neto</span>
              <span className={`${styles.kpiValue} ${(dashboard?.net_balance ?? 0) >= 0 ? styles.income : styles.expense}`}>
                {formatCOP(dashboard?.net_balance ?? 0)}
              </span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Deuda total</span>
              <span className={`${styles.kpiValue} ${styles.warning}`}>
                {formatCOP(dashboard?.debt_total_balance ?? 0)}
              </span>
              <span className={styles.kpiSub}>{dashboard?.debt_count ?? 0} deudas activas</span>
            </div>
          </div>

          {/* Category breakdown */}
          {dashboard?.category_spending && dashboard.category_spending.length > 0 ? (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Por categoría</h2>
              <div className={styles.catGrid}>
                {dashboard.category_spending.map((item) => (
                  <CategoryCard key={item.category_id} item={item} />
                ))}
              </div>
            </div>
          ) : dashboard?.budget_total ? (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Por categoría</h2>
              <p className={styles.empty}>
                No hay distribución por categorías.{' '}
                <Link href="/finance/budget" className={styles.link}>Configurar presupuesto</Link>
              </p>
            </div>
          ) : null}

          {/* Upcoming subscriptions */}
          {(dashboard?.upcoming_subscriptions?.length ?? 0) > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Suscripciones próximas (7 días)</h2>
              <div className={styles.subList}>
                {dashboard!.upcoming_subscriptions.map((sub) => (
                  <div key={sub.id} className={styles.subItem}>
                    <div className={styles.subName}>
                      <span>{sub.name}</span>
                    </div>
                    <div className={styles.subRight}>
                      <span className={styles.subDate}>{sub.next_billing_date}</span>
                      <span className={styles.subAmount}>{formatCOP(sub.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
