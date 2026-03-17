'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  PieChart,
  TrendingUp,
  RefreshCw,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Plus,
  Mail,
  AlertTriangle,
  Lock,
  Crown,
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';
import { getUnreadAlertCount } from '@/lib/supabase/alerts';
import AIChatWidget from '@/components/dashboard/AIChatWidget';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ children }) {
  const t = useTranslations('Nav')
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPremium = profile?.subscription_tier === 'premium';

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard'),    path: '/dashboard' },
    { icon: Wallet,          label: t('transactions'), path: '/dashboard/transactions' },
    { icon: RefreshCw,       label: t('recurring'),    path: '/dashboard/recurring' },
    { icon: PieChart,        label: t('budgets'),      path: '/dashboard/budgets' },
    { icon: TrendingUp,      label: t('reports'),      path: '/dashboard/reports' },
  ];

  const premiumNavItems = [
    { icon: AlertTriangle, label: 'Alertas inteligentes', path: '/dashboard/alerts' },
    { icon: Mail,          label: 'Sincronizar Gmail',    path: '/dashboard/sync' },
  ];

  useEffect(() => {
    if (!isPremium || !user) return

    const refresh = () => getUnreadAlertCount().then(setUnreadAlerts).catch(() => {})

    // Initial fetch
    refresh()

    // Realtime subscription — updates badge instantly when new alert arrives
    const supabase = createClient()
    const channel = supabase
      .channel('alerts-badge')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'alerts',
        filter: `user_id=eq.${user.id}`,
      }, refresh)
      .subscribe()

    // Polling fallback every 30s in case Realtime is not enabled on the table
    const poll = setInterval(refresh, 30_000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poll)
    }
  }, [isPremium, user]);

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
            <Image src="/images/LogoFintia.png" alt="Fintia" width={36} height={36} style={{ objectFit: 'contain' }} />
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

          {/* Premium items */}
          <div className={styles.premiumSection}>
            <span className={styles.premiumSectionLabel}>
              <Crown size={11} /> Premium
            </span>
            {premiumNavItems.map((item) =>
              isPremium ? (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${styles.navItem} ${pathname === item.path ? styles.navItemActive : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ) : (
                <Link
                  key={item.path}
                  href="/dashboard/settings"
                  className={`${styles.navItem} ${styles.navItemLocked}`}
                  onClick={() => setSidebarOpen(false)}
                  title="Actualiza a Premium para acceder"
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                  <Lock size={13} className={styles.lockIcon} />
                </Link>
              )
            )}
          </div>
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

            <button className={styles.notificationBtn} onClick={() => router.push('/dashboard/alerts')}>
              <Bell size={20} />
              {unreadAlerts > 0 && (
                <span className={styles.notificationBadge}>{unreadAlerts}</span>
              )}
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

      {isPremium && <AIChatWidget />}
    </div>
  );
}
