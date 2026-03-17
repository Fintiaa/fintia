'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/lib/auth/AuthContext'
import { useTranslations } from 'next-intl'
import styles from '@/pages/Signup.module.css'

export default function SignupPage() {
  const t = useTranslations('Signup')
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
      setError(t('errorPasswordMatch'))
      return
    }

    if (password.length < 6) {
      setError(t('errorPasswordLength'))
      return
    }

    setLoading(true)

    try {
      await signUp(email, password)
      setSuccess(true)
    } catch (err) {
      setError(err.message || t('errorDefault'))
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
            <h1>{t('success.title')}</h1>
            <p>{t('success.description', { email })}</p>
            <Link href="/login" className={styles.successBtn}>
              {t('success.goToLogin')}
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
              <Image src="/images/LogoFintia.png" alt="Fintia" width={36} height={36} style={{ objectFit: 'contain' }} />
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

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
              <div className={styles.inputWrapper}>
                <Lock size={20} className={styles.inputIcon} />
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmPasswordPlaceholder')}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.terms}>
              <p>
                {t('terms')}{' '}
                <a href="#">{t('termsLink')}</a> {t('and')}{' '}
                <a href="#">{t('privacyLink')}</a>.
              </p>
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
              {t('hasAccount')}{' '}
              <Link href="/login">{t('login')}</Link>
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
