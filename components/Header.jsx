'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useTranslations } from 'next-intl'
import styles from './Header.module.css'

const Header = () => {
  const t = useTranslations('Header')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#logoGradient)" />
              <path d="M9 12h14M9 16h10M9 20h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="22" cy="18" r="4" stroke="white" strokeWidth="2" />
              <defs>
                <linearGradient id="logoGradient" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#22c55e" />
                  <stop offset="1" stopColor="#16a34a" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className={styles.logoText}>Fintia</span>
        </Link>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          <a href="#features" className={styles.navLink}>{t('features')}</a>
          <a href="#how-it-works" className={styles.navLink}>{t('howItWorks')}</a>
          <a href="#pricing" className={styles.navLink}>{t('pricing')}</a>
        </nav>

        <div className={styles.headerActions}>
          {user ? (
            <>
              <span className={styles.userEmail}>{user.email}</span>
              <button onClick={handleSignOut} className={styles.logoutBtn}>
                <LogOut size={18} />
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.loginLink}>{t('login')}</Link>
              <Link href="/signup" className="btn btn-primary">{t('getStarted')}</Link>
            </>
          )}
        </div>

        <button
          className={styles.menuToggle}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNav}>
            <a href="#features" className={styles.mobileNavLink}>{t('features')}</a>
            <a href="#how-it-works" className={styles.mobileNavLink}>{t('howItWorks')}</a>
            <a href="#pricing" className={styles.mobileNavLink}>{t('pricing')}</a>
            {user ? (
              <>
                <span className={styles.mobileUserEmail}>{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: '16px' }}
                >
                  <LogOut size={18} />
                  {t('signOut')}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={styles.mobileNavLink}>{t('login')}</Link>
                <Link href="/signup" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                  {t('getStarted')}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
