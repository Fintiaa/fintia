import { useState, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import { api } from '@/lib/api/client'
import { getDateRange } from '@/lib/utils/dateRange'

export { getDateRange }

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
        api.get('/transactions/stats', { from, to }),
        api.get('/transactions/category-expenses', { from, to }),
        api.get('/transactions/monthly-history', { months: '6', locale: chartLocale }),
        api.get('/transactions', { limit: '5' }),
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
