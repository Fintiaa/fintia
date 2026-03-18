'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getAllCategories,
  getCategoriesByType,
  getCustomCategories,
  addCustomCategory,
  updateCustomCategory,
  deleteCustomCategory,
} from '@/lib/data/categories'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(() => {
    setLoading(true)
    try {
      setCategories(getAllCategories())
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
      const newCat = addCustomCategory(category)
      setCategories(getAllCategories())
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
      const newCat = updateCustomCategory(categoryId, updates)
      setCategories(getAllCategories())
      setError('')
      return newCat
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
      deleteCustomCategory(categoryId)
      setCategories(getAllCategories())
      setError('')
    } catch (err) {
      setError(err?.message || 'Error al eliminar categoría')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getByType = (type) => getCategoriesByType(type)
  const getCustom = () => getCustomCategories()

  return {
    categories,
    loading,
    error,
    refresh,
    createCategory,
    editCategory,
    removeCategory,
    getByType,
    getCustom,
    getAllCategories,
  }
}
