'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
          <Image src="/images/LogoFintia.png" alt="Fintia" width={36} height={36} style={{ objectFit: 'contain' }} />
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
