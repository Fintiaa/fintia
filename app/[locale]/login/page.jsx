'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useTranslations } from 'next-intl'
import styles from '@/pages/Login.module.css'

export default function LoginPage() {
  const t = useTranslations('Login')
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
      setError(err.message || t('errorDefault'))
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
            <h1>{t('title')}</h1>
            <p>{t('subtitle')}</p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">{t('email')}</label>
              <div className={styles.inputWrapper}>
                <Mail size={20} className={styles.inputIcon} />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">{t('password')}</label>
              <div className={styles.inputWrapper}>
                <Lock size={20} className={styles.inputIcon} />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.forgotPassword}>
              <a href="#">{t('forgotPassword')}</a>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={20} className={styles.spinner} />
                  {t('submitting')}
                </>
              ) : (
                <>
                  {t('submit')}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p>
              {t('noAccount')}{' '}
              <Link href="/signup">{t('createAccount')}</Link>
            </p>
          </div>
        </div>

        <div className={styles.authVisual}>
          <div className={styles.visualContent}>
            <h2>{t('visual.title')}</h2>
            <p>{t('visual.description')}</p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✓</span>
                {t('visual.feature1')}
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✓</span>
                {t('visual.feature2')}
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>✓</span>
                {t('visual.feature3')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
