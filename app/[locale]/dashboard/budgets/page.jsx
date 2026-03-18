'use client'

import { useState, useEffect } from 'react'
import {
  PieChart,
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react'
import { getAllBudgetsWithSpending, createBudget, updateBudget, deleteBudget } from '@/lib/supabase/budgets'
import { getCategoryById, getCategoriesByType } from '@/lib/data/categories'
import styles from './page.module.css'

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchBudgets = async () => {
    try {
      const data = await getAllBudgetsWithSpending()
      setBudgets(data)
    } catch (err) {
      console.error('Error fetching budgets:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [])

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id)
      setBudgets((prev) => prev.filter((b) => b.id !== id))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Error deleting budget:', err)
    }
  }

  const handleEdit = (budget) => {
    setEditingBudget(budget)
    setModalOpen(true)
  }

  const handleCreate = () => {
    setEditingBudget(null)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditingBudget(null)
  }

  const handleModalSuccess = () => {
    handleModalClose()
    fetchBudgets()
  }

  const fmt = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(n)

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'var(--error)'
    if (percentage >= 80) return 'var(--warning)'
    return 'var(--success)'
  }

  const getStatusLabel = (percentage) => {
    if (percentage >= 100) return 'Excedido'
    if (percentage >= 80) return 'Cerca del límite'
    return 'En control'
  }

  // Categories already used in budgets
  const usedCategoryIds = budgets.map((b) => b.category_id)

  return (
    
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1>Presupuestos</h1>
            <p>Configura límites de gasto por categoría</p>
          </div>
          <button className={styles.newBtn} onClick={handleCreate}>
            <Plus size={18} />
            Nuevo presupuesto
          </button>
        </div>

        {loading ? (
          <p className={styles.loadingText}>Cargando presupuestos...</p>
        ) : budgets.length === 0 ? (
          <div className={styles.emptyState}>
            <PieChart size={48} className={styles.emptyIcon} />
            <h3>No tienes presupuestos configurados</h3>
            <p>Crea tu primer presupuesto para controlar tus gastos por categoría.</p>
            <button className={styles.emptyBtn} onClick={handleCreate}>
              <Plus size={16} /> Crear presupuesto
            </button>
          </div>
        ) : (
          <div className={styles.budgetGrid}>
            {budgets.map((budget) => {
              const cat = getCategoryById(budget.category_id)
              const progressColor = getProgressColor(budget.percentage)
              const statusLabel = getStatusLabel(budget.percentage)

              return (
                <div key={budget.id} className={styles.budgetCard}>
                  <div className={styles.budgetCardHeader}>
                    <div className={styles.budgetCategory}>
                      <span
                        className={styles.categoryIcon}
                        style={{
                          background: (cat?.color || '#9ca3af') + '20',
                          color: cat?.color || '#9ca3af',
                        }}
                      >
                        {cat?.icon || '📦'}
                      </span>
                      <div>
                        <h3>{cat?.name || budget.category_id}</h3>
                        <span className={styles.periodLabel}>
                          {budget.period === 'monthly' ? 'Mensual' : 'Semanal'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.budgetActions}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => handleEdit(budget)}
                        title="Editar"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        onClick={() => setDeleteConfirm(budget.id)}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.budgetAmounts}>
                    <span className={styles.budgetSpent}>{fmt(budget.spent)}</span>
                    <span className={styles.budgetLimit}> / {fmt(Number(budget.amount))}</span>
                  </div>

                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${Math.min(budget.percentage, 100)}%`,
                        background: progressColor,
                      }}
                    />
                  </div>

                  <div className={styles.budgetFooter}>
                    <span
                      className={styles.statusBadge}
                      style={{ color: progressColor }}
                    >
                      {budget.percentage >= 80 && <AlertTriangle size={14} />}
                      {statusLabel}
                    </span>
                    <span className={styles.percentText}>{budget.percentage.toFixed(0)}%</span>
                  </div>

                  {/* Delete confirmation */}
                  {deleteConfirm === budget.id && (
                    <div className={styles.deleteOverlay}>
                      <p>¿Eliminar este presupuesto?</p>
                      <div className={styles.deleteActions}>
                        <button
                          className={styles.deleteConfirmBtn}
                          onClick={() => handleDelete(budget.id)}
                        >
                          Eliminar
                        </button>
                        <button
                          className={styles.deleteCancelBtn}
                          onClick={() => setDeleteConfirm(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Budget Modal */}
        {modalOpen && (
          <BudgetModal
            budget={editingBudget}
            usedCategoryIds={usedCategoryIds}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
          />
        )}
      </div>
    
  )
}

function BudgetModal({ budget, usedCategoryIds, onClose, onSuccess }) {
  const isEditing = !!budget
  const expenseCategories = getCategoriesByType('expense')

  const [categoryId, setCategoryId] = useState(budget?.category_id || '')
  const [amount, setAmount] = useState(budget ? Number(budget.amount) : '')
  const [period, setPeriod] = useState(budget?.period || 'monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Filter out already-used categories (except current one if editing)
  const availableCategories = expenseCategories.filter(
    (c) => !usedCategoryIds.includes(c.id) || c.id === budget?.category_id
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!categoryId || !amount || Number(amount) <= 0) {
      setError('Completa todos los campos correctamente.')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (isEditing) {
        await updateBudget(budget.id, { category_id: categoryId, amount: Number(amount), period })
      } else {
        await createBudget({ category_id: categoryId, amount: Number(amount), period })
      }
      onSuccess()
    } catch (err) {
      if (err.message?.includes('duplicate') || err.message?.includes('unique')) {
        setError('Ya existe un presupuesto para esta categoría.')
      } else {
        setError(err.message || 'Error al guardar.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{isEditing ? 'Editar presupuesto' : 'Nuevo presupuesto'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Categoría</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              disabled={isEditing}
            >
              <option value="">Seleccionar categoría...</option>
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Límite de gasto (COP)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ej: 5000"
              min="1"
              step="0.01"
              required
            />
          </div>

          <div className={styles.field}>
            <label>Período</label>
            <div className={styles.periodToggle}>
              <button
                type="button"
                className={`${styles.periodOption} ${period === 'monthly' ? styles.periodActive : ''}`}
                onClick={() => setPeriod('monthly')}
              >
                Mensual
              </button>
              <button
                type="button"
                className={`${styles.periodOption} ${period === 'weekly' ? styles.periodActive : ''}`}
                onClick={() => setPeriod('weekly')}
              >
                Semanal
              </button>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear presupuesto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
