'use client'

import { useForm } from 'react-hook-form'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

interface RegisterFields {
  email: string
  password: string
  confirm: string
}

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFields>()

  async function onSubmit(data: RegisterFields) {
    setServerError(null)
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })
    setLoading(false)
    if (error) {
      setServerError(error.message)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className={styles.success}>
        <p>Revisa tu correo para confirmar tu cuenta.</p>
        <Link href="/login">Ir a iniciar sesión</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      <h2 className={styles.title}>Crear cuenta</h2>

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
          autoComplete="new-password"
          {...register('password', {
            required: 'La contraseña es obligatoria',
            minLength: { value: 8, message: 'Mínimo 8 caracteres' },
          })}
        />
        {errors.password && <span className={styles.error}>{errors.password.message}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="confirm">Confirmar contraseña</label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          {...register('confirm', {
            required: 'Confirma tu contraseña',
            validate: (v) => v === watch('password') || 'Las contraseñas no coinciden',
          })}
        />
        {errors.confirm && <span className={styles.error}>{errors.confirm.message}</span>}
      </div>

      {serverError && <p className={styles.serverError}>{serverError}</p>}

      <button type="submit" disabled={loading} className={styles.submit}>
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <p className={styles.footer}>
        ¿Ya tienes cuenta?{' '}
        <Link href="/login">Inicia sesión</Link>
      </p>
    </form>
  )
}
