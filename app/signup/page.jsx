'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import styles from '@/pages/Signup.module.css'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      await signUp(email, password)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.authPage}>
        <div className={styles.successContainer}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <CheckCircle size={64} />
            </div>
            <h1>¡Cuenta creada!</h1>
            <p>
              Hemos enviado un enlace de confirmación a <strong>{email}</strong>.
              Por favor revisa tu bandeja de entrada y confirma tu correo para activar tu cuenta.
            </p>
            <Link href="/login" className={styles.successBtn}>
              Ir a iniciar sesión
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="url(#logoGradientSignup)" />
                  <path
                    d="M9 12h14M9 16h10M9 20h6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="22" cy="18" r="4" stroke="white" strokeWidth="2" />
                  <defs>
                    <linearGradient id="logoGradientSignup" x1="0" y1="0" x2="32" y2="32">
                      <stop stopColor="#22c55e" />
                      <stop offset="1" stopColor="#16a34a" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className={styles.logoText}>Fintia</span>
            </Link>
            <h1>Crea tu cuenta gratis</h1>
            <p>Empieza a controlar tus finanzas en minutos</p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Correo electrónico</label>
              <div className={styles.inputWrapper}>
                <Mail size={20} className={styles.inputIcon} />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Contraseña</label>
              <div className={styles.inputWrapper}>
                <Lock size={20} className={styles.inputIcon} />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <div className={styles.inputWrapper}>
                <Lock size={20} className={styles.inputIcon} />
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.terms}>
              <p>
                Al crear una cuenta, aceptas nuestros{' '}
                <a href="#">Términos de servicio</a> y{' '}
                <a href="#">Política de privacidad</a>.
              </p>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={20} className={styles.spinner} />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta gratis
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p>
              ¿Ya tienes cuenta?{' '}
              <Link href="/login">Iniciar sesión</Link>
            </p>
          </div>
        </div>

        <div className={styles.authVisual}>
          <div className={styles.visualContent}>
            <h2>Empieza gratis, actualiza cuando quieras</h2>
            <p>
              Fintia es gratis para siempre. Actualiza a Premium solo si necesitas
              funciones avanzadas.
            </p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✓</span>
                Sin tarjeta de crédito
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✓</span>
                Configuración en 2 minutos
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✓</span>
                Cancela cuando quieras
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
