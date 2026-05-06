'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api/client'

export function useInsights() {
  const [insights, setInsights] = useState([])
  const [stats, setStats] = useState({ income: 0, expenses: 0, balance: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let canceled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const now = new Date()
        const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
        const to = now.toISOString().split('T')[0]

        const [transactions, statsData] = await Promise.all([
          api.get('/transactions', { limit: '200', from, to }),
          api.get('/transactions/stats', { from, to }),
        ])

        if (canceled) return
        setStats(statsData)

        const generated = await api.post('/ai/insights', { transactions, stats: statsData })
        if (!canceled) setInsights(Array.isArray(generated) ? generated : [])
      } catch (err) {
        if (!canceled) {
          setError(err.message || 'No se pudieron generar insights')
          setInsights([])
        }
      } finally {
        if (!canceled) setLoading(false)
      }
    }

    load()
    return () => { canceled = true }
  }, [])

  return { insights, stats, loading, error }
}
