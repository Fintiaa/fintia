'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  PieChart,
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTranslations } from 'next-intl';
import AIChatWidget from '@/components/dashboard/AIChatWidget';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ children }) {
  const t = useTranslations('Nav')
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/dashboard' },
    { icon: Wallet, label: t('transactions'), path: '/dashboard/transactions' },
    { icon: PieChart, label: t('budgets'), path: '/dashboard/budgets' },
    { icon: TrendingUp, label: t('reports'), path: '/dashboard/reports' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      const parts = profile.full_name.trim().split(' ');
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return parts[0][0].toUpperCase();
    }
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuario';

  return (
    <div className={styles.dashboardLayout}>
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/dashboard" className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#logoGradientDash)" />
                <path d="M9 12h14M9 16h10M9 20h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="22" cy="18" r="4" stroke="white" strokeWidth="2" />
                <defs>
                  <linearGradient id="logoGradientDash" x1="0" y1="0" x2="32" y2="32">
                    <stop stopColor="#22c55e" />
                    <stop offset="1" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className={styles.logoText}>Fintia</span>
          </Link>
          <button className={styles.closeSidebar} onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.navItem} ${pathname === item.path ? styles.navItemActive : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/dashboard/settings" className={styles.navItem}>
            <Settings size={20} />
            <span>{t('settings')}</span>
          </Link>
          <button onClick={handleSignOut} className={styles.navItem}>
            <LogOut size={20} />
            <span>{t('signOut')}</span>
          </button>
        </div>
      </aside>

      <div className={styles.mainContent}>
        <header className={styles.topHeader}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>

          <div className={styles.headerActions}>
            <button className={styles.addButton} onClick={() => router.push('/dashboard/transactions')}>
              <Plus size={20} />
              <span>{t('newExpense')}</span>
            </button>

            <button className={styles.notificationBtn}>
              <Bell size={20} />
              <span className={styles.notificationBadge}>3</span>
            </button>

            <div className={styles.userMenu}>
              <button className={styles.userMenuBtn} onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className={styles.userAvatar}>{getUserInitials()}</div>
                <ChevronDown size={16} />
              </button>

              {userMenuOpen && (
                <div className={styles.userDropdown}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>{getUserInitials()}</div>
                    <div>
                      <p className={styles.userName}>{displayName}</p>
                      <p className={styles.userEmail}>{user?.email}</p>
                    </div>
                  </div>
                  <div className={styles.dropdownDivider}></div>
                  <Link href="/dashboard/settings" className={styles.dropdownItem}>
                    <Settings size={18} />
                    {t('settings')}
                  </Link>
                  <button onClick={handleSignOut} className={styles.dropdownItem}>
                    <LogOut size={18} />
                    {t('signOut')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={styles.pageContent}>
          {children}
        </main>
      </div>

      <AIChatWidget />
    </div>
  );
}
