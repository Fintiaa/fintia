import { useState, useEffect, useCallback } from 'react'
import { getTransactions, deleteTransaction as deleteTx } from '@/lib/supabase/transactions'
import { getCategoryById } from '@/lib/data/categories'

const DEFAULT_FILTERS = {
  type: '',
  category_id: '',
  from: '',
  to: '',
  search: '',
}

export function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getTransactions({
        filters: {
          type: filters.type || undefined,
          category_id: filters.category_id || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
        },
      })
      setTransactions(data)
    } catch (err) {
      setError('Error al cargar las transacciones.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters.type, filters.category_id, filters.from, filters.to])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const setFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  const clearFilters = () => setFilters(DEFAULT_FILTERS)

  const hasActiveFilters = Object.values(filters).some(Boolean)

  // Filtro de búsqueda local (sin ir al servidor)
  const displayed = transactions.filter((tx) => {
    if (!filters.search) return true
    const cat = getCategoryById(tx.category_id)
    const s = filters.search.toLowerCase()
    return (
      tx.description?.toLowerCase().includes(s) ||
      cat?.name.toLowerCase().includes(s)
    )
  })

  const deleteTransaction = async (id) => {
    await deleteTx(id)
    fetchTransactions()
  }

  return {
    transactions: displayed,
    loading,
    error,
    filters,
    hasActiveFilters,
    setFilter,
    clearFilters,
    deleteTransaction,
    refetch: fetchTransactions,
  }
}
