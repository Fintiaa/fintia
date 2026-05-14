'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react'
import TransactionModal from '@/components/dashboard/TransactionModal'
import { getCategoryById, CATEGORIES } from '@/lib/data/categories'
import { useTransactions } from '@/lib/hooks/useTransactions'
import { useTranslations } from 'next-intl'
import styles from './page.module.css'

export default function TransactionsPage() {
  const t = useTranslations('Transactions')
  const {
    transactions: displayed,
    loading,
    error,
    filters,
    hasActiveFilters,
    setFilter,
    clearFilters,
    deleteTransaction,
    refetch,
  } = useTransactions()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleEdit = (tx) => {
    setEditingTransaction(tx)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    setDeleteLoading(true)
    try {
      await deleteTransaction(id)
      setDeletingId(null)
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

  const fmt = (amount) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(amount)

  const fmtDate = (str) => {
    const [y, m, d] = str.split('-')
    return new Date(+y, +m - 1, +d).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    
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
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterRow}>
            <select
              value={filters.type}
              onChange={(e) => setFilter('type', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">{t('allTypes')}</option>
              <option value="income">{t('income')}</option>
              <option value="expense">{t('expenses')}</option>
            </select>
            <select
              value={filters.category_id}
              onChange={(e) => setFilter('category_id', e.target.value)}
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
              value={filters.from}
              onChange={(e) => setFilter('from', e.target.value)}
              className={styles.filterInput}
            />
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilter('to', e.target.value)}
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

            {/* Mobile cards */}
            <div className={styles.mobileList}>
              {displayed.map((tx) => {
                const cat = tx.category || getCategoryById(tx.category_id)
                return (
                  <div key={tx.id} className={styles.mobileCard}>
                    <div className={styles.mobileCardTop}>
                      <span
                        className={styles.catIcon}
                        style={{ background: (cat?.color || '#9ca3af') + '20', color: cat?.color || '#9ca3af' }}
                      >
                        {cat?.icon || '📦'}
                      </span>
                      <div className={styles.mobileCardInfo}>
                        <div className={styles.mobileCardName}>{cat?.name || '—'}</div>
                        <div className={styles.mobileCardMeta}>{fmtDate(tx.date)}</div>
                      </div>
                      <span className={`${styles.mobileCardAmount} ${tx.type === 'income' ? styles.incomeAmount : styles.expenseAmount}`}>
                        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                      </span>
                    </div>
                    <div className={styles.mobileCardBottom}>
                      <span className={styles.mobileCardDesc}>
                        {tx.description || <span className={styles.noDesc}>—</span>}
                      </span>
                      {deletingId === tx.id ? (
                        <div className={styles.mobileDeleteConfirm}>
                          <span>{t('deleteConfirm')}</span>
                          <button className={styles.confirmYes} onClick={() => handleDelete(tx.id)} disabled={deleteLoading}>{t('yes')}</button>
                          <button className={styles.confirmNo} onClick={() => setDeletingId(null)}>{t('no')}</button>
                        </div>
                      ) : (
                        <div className={styles.mobileCardActions}>
                          <button className={styles.editBtn} onClick={() => handleEdit(tx)}><Edit2 size={15} /></button>
                          <button className={styles.deleteBtn} onClick={() => setDeletingId(tx.id)}><Trash2 size={15} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop table */}
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
                    const cat = tx.category || getCategoryById(tx.category_id)
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
                            <span className={styles.catName}>{cat?.name || '—'}</span>
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
          onSuccess={refetch}
          transaction={editingTransaction}
        />

      </div>
    
  )
}
