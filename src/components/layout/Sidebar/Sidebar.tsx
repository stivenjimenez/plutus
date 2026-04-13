'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Wallet,
  ArrowUpDown,
  RefreshCw,
  CircleMinus,
  Tag,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import styles from './Sidebar.module.css'

interface Section {
  href: string
  label: string
  Icon: LucideIcon
}

interface Module {
  id: string
  label: string
  sections: Section[]
}

const MODULES: Module[] = [
  {
    id: 'finance',
    label: 'Finanzas',
    sections: [
      { href: '/finance/dashboard',     label: 'Resumen',       Icon: LayoutDashboard },
      { href: '/finance/budget',        label: 'Presupuesto',   Icon: Wallet          },
      { href: '/finance/transactions',  label: 'Transacciones', Icon: ArrowUpDown     },
      { href: '/finance/subscriptions', label: 'Suscripciones', Icon: RefreshCw       },
      { href: '/finance/debts',         label: 'Deudas',        Icon: CircleMinus     },
      { href: '/finance/categories',    label: 'Categorías',    Icon: Tag             },
    ],
  },
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

  function isActiveSection(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandName}>Plutus</span>
      </div>

      {MODULES.map((module) => (
        <div key={module.id} className={styles.moduleGroup}>
          <span className={styles.moduleLabel}>{module.label}</span>
          <nav className={styles.nav}>
            {module.sections.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.navItem} ${isActiveSection(href) ? styles.active : ''}`}
              >
                <Icon size={16} strokeWidth={1.5} className={styles.icon} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      ))}

      <div className={styles.spacer} />

      <div className={styles.footer}>
        <button onClick={handleLogout} className={styles.logout}>
          <LogOut size={16} strokeWidth={1.5} className={styles.icon} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
