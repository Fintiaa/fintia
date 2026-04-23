'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api/client'

export function useGoals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchGoals = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.get('/goals')
      setGoals(data)
    } catch (err) {
      setError('No se pudieron cargar las metas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  const addGoal = useCallback(async (goalData) => {
    try {
      const newGoal = await api.post('/goals', goalData)
      setGoals(prev => [newGoal, ...prev])
      return { success: true }
    } catch (err) {
      console.error(err)
      return { success: false, error: 'No se pudo crear la meta' }
    }
  }, [])

  const addMoney = useCallback(async (id, amount) => {
    try {
      const updated = await api.patch(`/goals/${id}/savings`, { amount })
      setGoals(prev => prev.map(g => g.id === id ? updated : g))
      return { success: true }
    } catch (err) {
      console.error(err)
      return { success: false, error: 'No se pudo actualizar la meta' }
    }
  }, [])

  const removeGoal = useCallback(async (id) => {
    try {
      await api.delete(`/goals/${id}`)
      setGoals(prev => prev.filter(g => g.id !== id))
      return { success: true }
    } catch (err) {
      console.error(err)
      return { success: false, error: 'No se pudo eliminar la meta' }
    }
  }, [])

  return { goals, loading, error, addGoal, addMoney, removeGoal, refetch: fetchGoals }
}
