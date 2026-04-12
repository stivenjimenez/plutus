'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './Sidebar.module.css'

const MODULES = [
  {
    id: 'finance',
    label: 'Finanzas',
    icon: '◈',
    href: '/finance/dashboard',
    sections: [
      { href: '/finance/dashboard',     label: 'Resumen',       icon: '◈' },
      { href: '/finance/budget',        label: 'Presupuesto',   icon: '◉' },
      { href: '/finance/transactions',  label: 'Transacciones', icon: '↕' },
      { href: '/finance/subscriptions', label: 'Suscripciones', icon: '⟳' },
      { href: '/finance/debts',         label: 'Deudas',        icon: '⊖' },
      { href: '/finance/categories',    label: 'Categorías',    icon: '⊞' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const activeModule = MODULES.find((m) => pathname.startsWith(`/${m.id}`))

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActiveSection(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <span className={styles.brandName}>Plutus</span>
      </div>

      {/* Module sections */}
      {MODULES.map((module) => (
        <div key={module.id} className={styles.moduleGroup}>
          <span className={styles.moduleLabel}>{module.label}</span>
          <nav className={styles.nav}>
            {module.sections.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActiveSection(item.href) ? styles.active : ''}`}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      ))}

      <div className={styles.spacer} />

      <div className={styles.footer}>
        <button onClick={handleLogout} className={styles.logout}>
          <span className={styles.icon}>⎋</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
