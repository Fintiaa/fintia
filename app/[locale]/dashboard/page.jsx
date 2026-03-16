'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, DollarSign, CreditCard, Plus, ArrowUpRight, ArrowDownRight, PiggyBank } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import DashboardLayout from '@/components/DashboardLayout'
import TransactionModal from '@/components/dashboard/TransactionModal'
import ExpensesPieChart from '@/components/dashboard/ExpensesPieChart'
import MonthlyBarChart from '@/components/dashboard/MonthlyBarChart'
import { getStatsForPeriod, getTransactions, getCategoryExpenses, getMonthlyHistory } from '@/lib/supabase/transactions'
import { getCategoryById } from '@/lib/data/categories'
import { useAuth } from '@/lib/auth/AuthContext'
import styles from './page.module.css'

function getDateRange(period) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  if (period === 'week') {
    const day = now.getDay()
    const diff = day === 0 ? -6 : 1 - day
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff)
    return { from: monday.toISOString().split('T')[0], to: today }
  }
  if (period === 'year') {
    return { from: `${now.getFullYear()}-01-01`, to: today }
  }
  // month
  return {
    from: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
    to: today,
  }
}

export default function DashboardPage() {
  const t = useTranslations('Dashboard')
  const locale = useLocale()
  const { user, profile } = useAuth()

  const [period, setPeriod] = useState('month')
  const [stats, setStats] = useState({ income: 0, expenses: 0, balance: 0 })
  const [categoryData, setCategoryData] = useState({})
  const [historyData, setHistoryData] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { from, to } = getDateRange(period)
    const chartLocale = locale === 'en' ? 'en-US' : 'es-MX'
    try {
      const [periodStats, catData, history, txns] = await Promise.all([
        getStatsForPeriod(from, to),
        getCategoryExpenses(from, to),
        getMonthlyHistory(6, chartLocale),
        getTransactions({ limit: 5 }),
      ])
      setStats(periodStats)
      setCategoryData(catData)
      setHistoryData(history)
      setRecent(txns)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [period, locale])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const fmt = (n) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-MX', { style: 'currency', currency: 'MXN' }).format(n)

  const fmtDate = (str) => {
    const [y, m, d] = str.split('-')
    const date = new Date(+y, +m - 1, +d)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yest = new Date(today)
    yest.setDate(yest.getDate() - 1)
    if (date.getTime() === today.getTime()) return t('today')
    if (date.getTime() === yest.getTime()) return t('yesterday')
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-MX', { day: 'numeric', month: 'short' })
  }

  const savingsRate =
    stats.income > 0 ? Math.round(((stats.income - stats.expenses) / stats.income) * 100) : null

  const userName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'usuario'

  const periodLabel = { week: t('periodWeek'), month: t('periodMonth'), year: t('periodYear') }[period]

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
      change: periodLabel,
    },
    {
      title: t('expensesCard'),
      value: fmt(stats.expenses),
      icon: CreditCard,
      color: 'red',
      changeType: 'negative',
      change: periodLabel,
    },
    {
      title: t('savingsCard'),
      value: savingsRate !== null ? `${savingsRate}%` : '—',
      icon: PiggyBank,
      color: 'purple',
      changeType: savingsRate !== null && savingsRate >= 20 ? 'positive' : 'negative',
      change: savingsRate !== null && savingsRate >= 20 ? t('savingsGood') : t('savingsLow'),
    },
  ]

  return (
    <DashboardLayout>
      <div className={styles.dashboard}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1>{t('greeting', { name: userName })}</h1>
            <p>{t('summary', { month: periodLabel })}</p>
          </div>
          <div className={styles.headerActions}>
            <select
              className={styles.periodSelect}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="week">{t('periodWeek')}</option>
              <option value="month">{t('periodMonth')}</option>
              <option value="year">{t('periodYear')}</option>
            </select>
            <button className={styles.newTransactionBtn} onClick={() => setModalOpen(true)}>
              <Plus size={18} />
              {t('newTransaction')}
            </button>
          </div>
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

        {/* Charts */}
        <div className={styles.chartsGrid}>
          {/* Bar chart: income vs expenses last 6 months */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>{t('incomeVsExpenses')}</h2>
              <span className={styles.chartSubtitle}>{t('last6Months')}</span>
            </div>
            {loading ? (
              <div className={styles.chartSkeleton} />
            ) : (
              <MonthlyBarChart
                data={historyData}
                incomeLabel={t('incomeLabel')}
                expensesLabel={t('expensesLabel')}
              />
            )}
          </div>

          {/* Pie chart: expenses by category */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>{t('expensesByCategory')}</h2>
              <span className={styles.chartSubtitle}>{periodLabel}</span>
            </div>
            {loading ? (
              <div className={styles.chartSkeleton} />
            ) : (
              <ExpensesPieChart data={categoryData} emptyText={t('noExpenses')} />
            )}
          </div>
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
