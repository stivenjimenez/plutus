'use client'

import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

interface LoginFields {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>()

  async function onSubmit(data: LoginFields) {
    setServerError(null)
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    setLoading(false)
    if (error) {
      setServerError('Correo o contraseña incorrectos.')
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      <h2 className={styles.title}>Iniciar sesión</h2>

      <div className={styles.field}>
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email', { required: 'El correo es obligatorio' })}
        />
        {errors.email && <span className={styles.error}>{errors.email.message}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password', { required: 'La contraseña es obligatoria' })}
        />
        {errors.password && <span className={styles.error}>{errors.password.message}</span>}
      </div>

      {serverError && <p className={styles.serverError}>{serverError}</p>}

      <button type="submit" disabled={loading} className={styles.submit}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>

      <p className={styles.footer}>
        ¿No tienes cuenta?{' '}
        <Link href="/register">Regístrate</Link>
      </p>
    </form>
  )
}
