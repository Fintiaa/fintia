'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, CreditCard, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'
import TransactionModal from '@/components/dashboard/TransactionModal'
import { getTransactions, getMonthlyStats } from '@/lib/supabase/transactions'
import { getCategoryById } from '@/lib/data/categories'
import { useAuth } from '@/lib/auth/AuthContext'
import { useTranslations } from 'next-intl'
import { Target } from "lucide-react"
import styles from './page.module.css'
import { getGoals } from "@/lib/supabase/goals"

export default function DashboardPage() {
  const t = useTranslations('Dashboard')
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({ income: 0, expenses: 0, balance: 0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [goals,setGoals] = useState([])

  const fetchData = async () => {
    setLoading(true)
    const now = new Date()
    try {
      const [monthStats, txns] = await Promise.all([
        getMonthlyStats(now.getFullYear(), now.getMonth() + 1),
        getTransactions({ limit: 5 }),
        getGoals(3)
      ])
      setStats(monthStats)
      setRecent(txns)
      setGoals(goals)
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
    if (date.getTime() === today.getTime()) return t('today')
    if (date.getTime() === yest.getTime()) return t('yesterday')
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  }

  const now = new Date()
  const monthLabel = now.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
  const userName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'usuario'

  const statsCards = [
    {
      title: t('balanceCard'),
      value: fmt(stats.balance),
      icon: DollarSign,
      color: 'green',
      changeType: stats.balance >= 0 ? 'positive' : 'negative',
      change: stats.balance >= 0 ? t('positive') : t('negative'),
    },
    {
      title: t('incomeCard'),
      value: fmt(stats.income),
      icon: TrendingUp,
      color: 'blue',
      changeType: 'positive',
      change: t('thisMonth'),
    },
    {
      title: t('expensesCard'),
      value: fmt(stats.expenses),
      icon: CreditCard,
      color: 'red',
      changeType: 'negative',
      change: t('thisMonth'),
    },
  ]

  return (
     <div className={styles.dashboard}>
      <div className={styles.dashboard}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1>{t('greeting', { name: userName })}</h1>
            <p>{t('summary', { month: monthLabel })}</p>
          </div>
          <button className={styles.newTransactionBtn} onClick={() => setModalOpen(true)}>
            <Plus size={18} />
            {t('newTransaction')}
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
            <h2>{t('recentTransactions')}</h2>
            <Link href="/dashboard/transactions" className={styles.viewAll}>
              {t('viewAll')}
            </Link>
          </div>

          {loading ? (
            <p className={styles.loadingText}>{t('loading')}</p>
          ) : recent.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{t('empty')}</p>
              <button className={styles.emptyBtn} onClick={() => setModalOpen(true)}>
                <Plus size={16} /> {t('registerFirst')}
              </button>
            </div>
          ) : (
            <div className={styles.transactionsList}>
              {recent.map((tx) => {
                const cat = getCategoryById(tx.category_id)
                return (
                  <div key={tx.id} className={styles.transactionItem}>
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
                        {tx.description || cat?.name}
                      </p>
                      <p className={styles.transactionCategory}>
                        {cat?.name} · {fmtDate(tx.date)}
                      </p>
                    </div>
                    <p
                      className={`${styles.transactionAmount} ${
                        tx.type === 'income' ? styles.positive : styles.negative
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {fmt(tx.amount)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Goals */}
<div className={styles.card}>

  <div className={styles.cardHeader}>
    <h2>Metas</h2>
    <Link href="/dashboard/goals" className={styles.viewAll}>
      Ver todas
    </Link>
  </div>

  {goals.length === 0 ? (
    <p className={styles.loadingText}>
      No tienes metas todavía
    </p>
  ) : (

    <div className={styles.goalsList}>

      {goals.map(goal=>{

        const percent = Math.min(
          (goal.saved / goal.target) * 100,
          100
        )

        return(

          <div key={goal.id} className={styles.goalItem}>

            <div className={styles.goalHeader}>
              <span>{goal.name}</span>
              <span>
                ${goal.saved} / ${goal.target}
              </span>
            </div>

            <div className={styles.goalBar}>
              <div
                className={styles.goalProgress}
                style={{width:`${percent}%`}}
              />
            </div>

          </div>

        )

      })}

    </div>

  )}

</div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h3>{t('quickActions')}</h3>
          <div className={styles.actionsGrid}>
            <button className={styles.actionCard} onClick={() => setModalOpen(true)}>
              <span className={styles.actionIcon}>➕</span>
              <span>{t('addExpense')}</span>
            </button>
            <button className={styles.actionCard} onClick={() => setModalOpen(true)}>
              <span className={styles.actionIcon}>💰</span>
              <span>{t('addIncome')}</span>
            </button>
            <Link href="/dashboard/transactions" className={styles.actionCard}>
              <span className={styles.actionIcon}>📋</span>
              <span>{t('transactions')}</span>
            </Link>
            <Link href="/dashboard/reports" className={styles.actionCard}>
              <span className={styles.actionIcon}>📊</span>
              <span>{t('reports')}</span>
            </Link>
             <Link href="/dashboard/goals" className={styles.actionCard}>
                <Target size={18}/>
                <span>{t('goals')}</span>
            </Link>
          </div>
        </div>
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  )
}
