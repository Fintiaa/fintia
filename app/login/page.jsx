'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import styles from '@/pages/Login.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="url(#logoGradientLogin)" />
                  <path
                    d="M9 12h14M9 16h10M9 20h6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="22" cy="18" r="4" stroke="white" strokeWidth="2" />
                  <defs>
                    <linearGradient id="logoGradientLogin" x1="0" y1="0" x2="32" y2="32">
                      <stop stopColor="#22c55e" />
                      <stop offset="1" stopColor="#16a34a" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className={styles.logoText}>Fintia</span>
            </Link>
            <h1>Bienvenido de nuevo</h1>
            <p>Ingresa tus credenciales para acceder a tu cuenta</p>
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
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.forgotPassword}>
              <a href="#">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={20} className={styles.spinner} />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p>
              ¿No tienes cuenta?{' '}
              <Link href="/signup">Crear cuenta gratis</Link>
            </p>
          </div>
        </div>

        <div className={styles.authVisual}>
          <div className={styles.visualContent}>
            <h2>Controla tu dinero sin complicaciones</h2>
            <p>
              Únete a miles de personas que ya están simplificando sus finanzas
              personales con Fintia.
            </p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✓</span>
                Registro de gastos simple
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✓</span>
                Visualización clara
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✓</span>
                Alertas inteligentes
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
