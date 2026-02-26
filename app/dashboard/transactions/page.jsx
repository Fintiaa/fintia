'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import TransactionModal from '@/components/dashboard/TransactionModal'
import { getTransactions, deleteTransaction } from '@/lib/supabase/transactions'
import { getCategoryById, CATEGORIES } from '@/lib/data/categories'
import styles from './page.module.css'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getTransactions({
        filters: {
          type: filterType || undefined,
          category_id: filterCategory || undefined,
          from: filterFrom || undefined,
          to: filterTo || undefined,
        },
      })
      setTransactions(data)
    } catch (err) {
      setError('Error al cargar las transacciones. Verifica que la base de datos esté configurada.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filterType, filterCategory, filterFrom, filterTo])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleEdit = (t) => {
    setEditingTransaction(t)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    setDeleteLoading(true)
    try {
      await deleteTransaction(id)
      setDeletingId(null)
      fetchTransactions()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditingTransaction(null)
  }

  const clearFilters = () => {
    setFilterType('')
    setFilterCategory('')
    setFilterFrom('')
    setFilterTo('')
    setSearch('')
  }

  const hasActiveFilters = filterType || filterCategory || filterFrom || filterTo || search

  const displayed = transactions.filter((t) => {
    if (!search) return true
    const cat = getCategoryById(t.category_id)
    const s = search.toLowerCase()
    return (
      t.description?.toLowerCase().includes(s) ||
      cat?.name.toLowerCase().includes(s)
    )
  })

  const fmt = (amount) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)

  const fmtDate = (str) => {
    const [y, m, d] = str.split('-')
    return new Date(+y, +m - 1, +d).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <DashboardLayout>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1>Transacciones</h1>
            <p>Registra y administra tus ingresos y gastos</p>
          </div>
          <button
            className={styles.newBtn}
            onClick={() => {
              setEditingTransaction(null)
              setModalOpen(true)
            }}
          >
            <Plus size={18} />
            Nueva transacción
          </button>
        </div>

        {/* Filters */}
        <div className={styles.filtersCard}>
          <div className={styles.searchRow}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por descripción o categoría..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterRow}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todos los tipos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todas las categorías</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className={styles.filterInput}
              title="Desde"
            />
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className={styles.filterInput}
              title="Hasta"
            />
            {hasActiveFilters && (
              <button className={styles.clearBtn} onClick={clearFilters}>
                <X size={14} /> Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.center}>
            <div className={styles.spinner} />
            <p>Cargando transacciones...</p>
          </div>
        ) : error ? (
          <div className={styles.errorBox}>{error}</div>
        ) : displayed.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>Sin transacciones</h3>
            <p>
              {hasActiveFilters
                ? 'No hay transacciones que coincidan con los filtros.'
                : 'Aún no tienes transacciones registradas.'}
            </p>
            {!hasActiveFilters && (
              <button className={styles.newBtn} onClick={() => setModalOpen(true)}>
                <Plus size={18} /> Registrar primera transacción
              </button>
            )}
          </div>
        ) : (
          <>
            <p className={styles.count}>
              {displayed.length} transacción{displayed.length !== 1 ? 'es' : ''}
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Descripción</th>
                    <th>Fecha</th>
                    <th className={styles.amountCol}>Monto</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((t) => {
                    const cat = getCategoryById(t.category_id)
                    return (
                      <tr key={t.id}>
                        <td>
                          <div className={styles.catCell}>
                            <span
                              className={styles.catIcon}
                              style={{
                                background: (cat?.color || '#9ca3af') + '20',
                                color: cat?.color || '#9ca3af',
                              }}
                            >
                              {cat?.icon || '📦'}
                            </span>
                            <span className={styles.catName}>{cat?.name || t.category_id}</span>
                          </div>
                        </td>
                        <td className={styles.descCell}>
                          {t.description || <span className={styles.noDesc}>—</span>}
                        </td>
                        <td className={styles.dateCell}>{fmtDate(t.date)}</td>
                        <td className={styles.amountCol}>
                          <span
                            className={
                              t.type === 'income' ? styles.incomeAmount : styles.expenseAmount
                            }
                          >
                            {t.type === 'income' ? '+' : '-'}
                            {fmt(t.amount)}
                          </span>
                        </td>
                        <td>
                          {deletingId === t.id ? (
                            <div className={styles.deleteConfirm}>
                              <span>¿Eliminar?</span>
                              <button
                                className={styles.confirmYes}
                                onClick={() => handleDelete(t.id)}
                                disabled={deleteLoading}
                              >
                                Sí
                              </button>
                              <button
                                className={styles.confirmNo}
                                onClick={() => setDeletingId(null)}
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <div className={styles.rowActions}>
                              <button
                                className={styles.editBtn}
                                onClick={() => handleEdit(t)}
                                title="Editar"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                className={styles.deleteBtn}
                                onClick={() => setDeletingId(t.id)}
                                title="Eliminar"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <TransactionModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          onSuccess={fetchTransactions}
          transaction={editingTransaction}
        />
      </div>
    </DashboardLayout>
  )
}
