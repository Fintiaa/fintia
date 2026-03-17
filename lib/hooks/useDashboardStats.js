import { useState, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import { getStatsForPeriod, getTransactions, getCategoryExpenses, getMonthlyHistory } from '@/lib/supabase/transactions'

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
  return {
    from: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
    to: today,
  }
}

export function useDashboardStats() {
  const locale = useLocale()
  const [period, setPeriod] = useState('month')
  const [stats, setStats] = useState({ income: 0, expenses: 0, balance: 0 })
  const [categoryData, setCategoryData] = useState({})
  const [historyData, setHistoryData] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { from, to } = getDateRange(period)
    const chartLocale = locale === 'en' ? 'en-US' : 'es-CO'
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

  const dateRange = getDateRange(period)

  const savingsRate =
    stats.income > 0 ? Math.round(((stats.income - stats.expenses) / stats.income) * 100) : null

  return {
    period,
    setPeriod,
    stats,
    categoryData,
    historyData,
    recent,
    loading,
    savingsRate,
    dateRange,
    refetch: fetchData,
  }
}
