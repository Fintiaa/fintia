'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import TransactionModal from '@/components/dashboard/TransactionModal'
import { getTransactions, deleteTransaction } from '@/lib/supabase/transactions'
import { getCategoryById, CATEGORIES } from '@/lib/data/categories'
import { useTranslations } from 'next-intl'
import styles from './page.module.css'

export default function TransactionsPage() {
  const t = useTranslations('Transactions')
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
      setError(t('errorLoad'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filterType, filterCategory, filterFrom, filterTo, t])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleEdit = (tx) => {
    setEditingTransaction(tx)
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

  const displayed = transactions.filter((tx) => {
    if (!search) return true
    const cat = getCategoryById(tx.category_id)
    const s = search.toLowerCase()
    return (
      tx.description?.toLowerCase().includes(s) ||
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
            <h1>{t('title')}</h1>
            <p>{t('subtitle')}</p>
          </div>
          <button
            className={styles.newBtn}
            onClick={() => {
              setEditingTransaction(null)
              setModalOpen(true)
            }}
          >
            <Plus size={18} />
            {t('newTransaction')}
          </button>
        </div>

        {/* Filters */}
        <div className={styles.filtersCard}>
          <div className={styles.searchRow}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
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
              <option value="">{t('allTypes')}</option>
              <option value="income">{t('income')}</option>
              <option value="expense">{t('expenses')}</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">{t('allCategories')}</option>
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
            />
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className={styles.filterInput}
            />
            {hasActiveFilters && (
              <button className={styles.clearBtn} onClick={clearFilters}>
                <X size={14} /> {t('clearFilters')}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.center}>
            <div className={styles.spinner} />
            <p>{t('loading')}</p>
          </div>
        ) : error ? (
          <div className={styles.errorBox}>{error}</div>
        ) : displayed.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>{t('emptyTitle')}</h3>
            <p>
              {hasActiveFilters ? t('emptyFiltered') : t('emptyDefault')}
            </p>
            {!hasActiveFilters && (
              <button className={styles.newBtn} onClick={() => setModalOpen(true)}>
                <Plus size={18} /> {t('registerFirst')}
              </button>
            )}
          </div>
        ) : (
          <>
            <p className={styles.count}>
              {displayed.length === 1 ? t('count', { count: displayed.length }) : t('countPlural', { count: displayed.length })}
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('colCategory')}</th>
                    <th>{t('colDescription')}</th>
                    <th>{t('colDate')}</th>
                    <th className={styles.amountCol}>{t('colAmount')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((tx) => {
                    const cat = getCategoryById(tx.category_id)
                    return (
                      <tr key={tx.id}>
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
                            <span className={styles.catName}>{cat?.name || tx.category_id}</span>
                          </div>
                        </td>
                        <td className={styles.descCell}>
                          {tx.description || <span className={styles.noDesc}>—</span>}
                        </td>
                        <td className={styles.dateCell}>{fmtDate(tx.date)}</td>
                        <td className={styles.amountCol}>
                          <span className={tx.type === 'income' ? styles.incomeAmount : styles.expenseAmount}>
                            {tx.type === 'income' ? '+' : '-'}
                            {fmt(tx.amount)}
                          </span>
                        </td>
                        <td>
                          {deletingId === tx.id ? (
                            <div className={styles.deleteConfirm}>
                              <span>{t('deleteConfirm')}</span>
                              <button
                                className={styles.confirmYes}
                                onClick={() => handleDelete(tx.id)}
                                disabled={deleteLoading}
                              >
                                {t('yes')}
                              </button>
                              <button
                                className={styles.confirmNo}
                                onClick={() => setDeletingId(null)}
                              >
                                {t('no')}
                              </button>
                            </div>
                          ) : (
                            <div className={styles.rowActions}>
                              <button className={styles.editBtn} onClick={() => handleEdit(tx)} title="Edit">
                                <Edit2 size={15} />
                              </button>
                              <button className={styles.deleteBtn} onClick={() => setDeletingId(tx.id)} title="Delete">
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
