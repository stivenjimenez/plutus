'use client'

import { useEffect, type ReactNode } from 'react'
import styles from './Drawer.module.css'

interface DrawerProps {
  title: string
  onClose: () => void
  footer?: ReactNode
  children: ReactNode
  size?: 'default' | 'wide'
}

export default function Drawer({ title, onClose, footer, children, size = 'default' }: DrawerProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <aside className={`${styles.drawer} ${size === 'wide' ? styles.drawerWide : ''}`} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {children}
        </div>

        {footer && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}
      </aside>
    </>
  )
}
