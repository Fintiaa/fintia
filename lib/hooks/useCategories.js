'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api/client'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get('/categories')
      // normalize is_default → isDefault for compatibility with the page
      setCategories(data.map(c => ({ ...c, isDefault: c.is_default })))
      setError('')
    } catch (err) {
      setError(err?.message || 'Error cargando categorías')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createCategory = async (category) => {
    try {
      setLoading(true)
      const newCat = await api.post('/categories', category)
      await refresh()
      setError('')
      return newCat
    } catch (err) {
      setError(err?.message || 'Error al crear categoría')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const editCategory = async (categoryId, updates) => {
    try {
      setLoading(true)
      const updated = await api.put(`/categories/${categoryId}`, updates)
      await refresh()
      setError('')
      return updated
    } catch (err) {
      setError(err?.message || 'Error al actualizar categoría')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const removeCategory = async (categoryId) => {
    try {
      setLoading(true)
      await api.delete(`/categories/${categoryId}`)
      await refresh()
      setError('')
    } catch (err) {
      setError(err?.message || 'Error al eliminar categoría')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    categories,
    loading,
    error,
    refresh,
    createCategory,
    editCategory,
    removeCategory,
  }
}
