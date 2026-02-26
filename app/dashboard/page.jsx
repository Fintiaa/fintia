'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, CreditCard, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import TransactionModal from '@/components/dashboard/TransactionModal'
import { getTransactions, getMonthlyStats } from '@/lib/supabase/transactions'
import { getCategoryById } from '@/lib/data/categories'
import { useAuth } from '@/lib/auth/AuthContext'
import styles from './page.module.css'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({ income: 0, expenses: 0, balance: 0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const now = new Date()
    try {
      const [monthStats, txns] = await Promise.all([
        getMonthlyStats(now.getFullYear(), now.getMonth() + 1),
        getTransactions({ limit: 5 }),
      ])
      setStats(monthStats)
      setRecent(txns)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fmt = (n) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

  const fmtDate = (str) => {
    const [y, m, d] = str.split('-')
    const date = new Date(+y, +m - 1, +d)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yest = new Date(today)
    yest.setDate(yest.getDate() - 1)
    if (date.getTime() === today.getTime()) return 'Hoy'
    if (date.getTime() === yest.getTime()) return 'Ayer'
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  }

  const now = new Date()
  const monthLabel = now.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
  const userName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'usuario'

  const statsCards = [
    {
      title: 'Balance del Mes',
      value: fmt(stats.balance),
      icon: DollarSign,
      color: 'green',
      changeType: stats.balance >= 0 ? 'positive' : 'negative',
      change: stats.balance >= 0 ? 'Positivo' : 'Negativo',
    },
    {
      title: 'Ingresos del Mes',
      value: fmt(stats.income),
      icon: TrendingUp,
      color: 'blue',
      changeType: 'positive',
      change: 'Este mes',
    },
    {
      title: 'Gastos del Mes',
      value: fmt(stats.expenses),
      icon: CreditCard,
      color: 'red',
      changeType: 'negative',
      change: 'Este mes',
    },
  ]

  return (
    <DashboardLayout>
      <div className={styles.dashboard}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1>Hola, {userName} 👋</h1>
            <p>Resumen de tus finanzas — {monthLabel}</p>
          </div>
          <button className={styles.newTransactionBtn} onClick={() => setModalOpen(true)}>
            <Plus size={18} />
            Nueva transacción
          </button>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          {statsCards.map((stat, i) => (
            <div key={i} className={`${styles.statCard} ${styles[stat.color]}`}>
              <div className={styles.statHeader}>
                <div className={styles.statIcon}>
                  <stat.icon size={20} />
                </div>
              </div>
              <div className={styles.statContent}>
                <p className={styles.statTitle}>{stat.title}</p>
                <p className={styles.statValue}>{loading ? '···' : stat.value}</p>
                <div className={`${styles.statChange} ${styles[stat.changeType]}`}>
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Transacciones Recientes</h2>
            <Link href="/dashboard/transactions" className={styles.viewAll}>
              Ver todas
            </Link>
          </div>

          {loading ? (
            <p className={styles.loadingText}>Cargando...</p>
          ) : recent.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Aún no hay transacciones registradas.</p>
              <button className={styles.emptyBtn} onClick={() => setModalOpen(true)}>
                <Plus size={16} /> Registrar primera transacción
              </button>
            </div>
          ) : (
            <div className={styles.transactionsList}>
              {recent.map((t) => {
                const cat = getCategoryById(t.category_id)
                return (
                  <div key={t.id} className={styles.transactionItem}>
                    <div
                      className={styles.transactionIcon}
                      style={{
                        background: (cat?.color || '#9ca3af') + '20',
                        color: cat?.color || '#9ca3af',
                      }}
                    >
                      {cat?.icon || '📦'}
                    </div>
                    <div className={styles.transactionInfo}>
                      <p className={styles.transactionName}>
                        {t.description || cat?.name}
                      </p>
                      <p className={styles.transactionCategory}>
                        {cat?.name} · {fmtDate(t.date)}
                      </p>
                    </div>
                    <p
                      className={`${styles.transactionAmount} ${
                        t.type === 'income' ? styles.positive : styles.negative
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {fmt(t.amount)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h3>Acciones Rápidas</h3>
          <div className={styles.actionsGrid}>
            <button className={styles.actionCard} onClick={() => setModalOpen(true)}>
              <span className={styles.actionIcon}>➕</span>
              <span>Agregar Gasto</span>
            </button>
            <button className={styles.actionCard} onClick={() => setModalOpen(true)}>
              <span className={styles.actionIcon}>💰</span>
              <span>Agregar Ingreso</span>
            </button>
            <Link href="/dashboard/transactions" className={styles.actionCard}>
              <span className={styles.actionIcon}>📋</span>
              <span>Transacciones</span>
            </Link>
            <Link href="/dashboard/reports" className={styles.actionCard}>
              <span className={styles.actionIcon}>📊</span>
              <span>Reportes</span>
            </Link>
          </div>
        </div>
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
      />
    </DashboardLayout>
  )
}
