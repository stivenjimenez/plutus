import styles from './layout.module.css'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <h1>Plutus</h1>
          <p>Tu gestor de finanzas personales</p>
        </div>
        {children}
      </div>
    </div>
  )
}
