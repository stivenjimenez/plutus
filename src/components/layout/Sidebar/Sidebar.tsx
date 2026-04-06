'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Resumen', icon: '◈' },
  { href: '/budget', label: 'Presupuesto', icon: '◉' },
  { href: '/transactions', label: 'Transacciones', icon: '↕' },
  { href: '/subscriptions', label: 'Suscripciones', icon: '⟳' },
  { href: '/debts', label: 'Deudas', icon: '⊖' },
  { href: '/categories', label: 'Categorías', icon: '⊞' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandName}>Plutus</span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <button onClick={handleLogout} className={styles.logout}>
        <span>⎋</span>
        <span>Cerrar sesión</span>
      </button>
    </aside>
  )
}
