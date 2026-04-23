'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api/client'
import { useLocale } from 'next-intl'
import { buildInsights } from '@/lib/utils/insights'

export { buildInsights }

export function useInsights() {
  const locale = useLocale()
  const [insights, setInsights] = useState([])
  const [stats, setStats] = useState({ income: 0, expenses: 0, balance: 0 })
  const [categoryData, setCategoryData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let canceled = false

    const loadInsights = async () => {
      setLoading(true)
      setError('')
      try {
        const now = new Date()
        const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
        const to = now.toISOString().split('T')[0]

        const [transactions, statsData, catData] = await Promise.all([
          api.get('/transactions', { limit: '500' }),
          api.get('/transactions/stats', { from, to }),
          api.get('/transactions/category-expenses', { from, to }),
        ])

        if (canceled) return

        setStats(statsData)
        setCategoryData(catData)

        const generated = buildInsights(transactions, statsData, catData, locale)
        setInsights(generated)
      } catch (err) {
        if (canceled) return
        setError(err.message || 'No se pudieron generar insights')
        setInsights([])
      } finally {
        if (!canceled) setLoading(false)
      }
    }

    loadInsights()

    return () => {
      canceled = true
    }
  }, [locale])

  return { insights, stats, categoryData, loading, error }
}
