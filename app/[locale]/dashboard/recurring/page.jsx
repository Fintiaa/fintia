'use client'

import { Plus, RefreshCw, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { CATEGORIES, getCategoryById } from '@/lib/data/categories'
import { useRecurring } from '@/lib/hooks/useRecurring'
import CurrencyInput from '@/components/dashboard/CurrencyInput'
import styles from './page.module.css'

const DAYS = Array.from({ length: 28 }, (_, i) => i + 1)

export default function RecurringPage() {
  const {
    items,
    loading,
    saving,
    deletingId,
    setDeletingId,
    modalOpen,
    form,
    openModal,
    closeModal,
    setFormField,
    saveRecurring,
    toggleActive,
    deleteItem,
  } = useRecurring()

  const fmt = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

  const categories = CATEGORIES.filter((c) => c.type === form.type)

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1>Transacciones Recurrentes</h1>
            <p>Se registran automáticamente el día configurado de cada mes</p>
          </div>
          <button className={styles.newBtn} onClick={openModal}>
            <Plus size={18} /> Nueva recurrente
          </button>
        </div>

        {loading ? (
          <div className={styles.center}><RefreshCw size={24} className={styles.spin} /></div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            <RefreshCw size={40} className={styles.emptyIcon} />
            <h3>Sin transacciones recurrentes</h3>
            <p>Agrega tu salario, arriendo u otros pagos fijos mensuales.</p>
            <button className={styles.newBtn} onClick={openModal}>
              <Plus size={18} /> Agregar primera
            </button>
          </div>
        ) : (
          <div className={styles.list}>
            {items.map((item) => {
              const cat = getCategoryById(item.category_id)
              return (
                <div key={item.id} className={`${styles.card} ${!item.is_active ? styles.inactive : ''}`}>
                  <div
                    className={styles.catIcon}
                    style={{ background: (cat?.color || '#9ca3af') + '20', color: cat?.color || '#9ca3af' }}
                  >
                    {cat?.icon || '📦'}
                  </div>
                  <div className={styles.info}>
                    <p className={styles.desc}>{item.description || cat?.name}</p>
                    <p className={styles.meta}>
                      {cat?.name} · Día {item.day_of_month} de cada mes
                    </p>
                  </div>
                  <span className={`${styles.amount} ${item.type === 'income' ? styles.income : styles.expense}`}>
                    {item.type === 'income' ? '+' : '-'}{fmt(item.amount)}
                  </span>
                  <div className={styles.actions}>
                    <button
                      className={styles.toggleBtn}
                      onClick={() => toggleActive(item)}
                      title={item.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {item.is_active
                        ? <ToggleRight size={26} style={{ color: '#7ab98d' }} />
                        : <ToggleLeft size={26} style={{ color: '#9ca3af' }} />}
                    </button>
                    {deletingId === item.id ? (
                      <div className={styles.confirmDelete}>
                        <span>¿Eliminar?</span>
                        <button className={styles.confirmYes} onClick={() => deleteItem(item.id)}>Sí</button>
                        <button className={styles.confirmNo} onClick={() => setDeletingId(null)}>No</button>
                      </div>
                    ) : (
                      <button className={styles.deleteBtn} onClick={() => setDeletingId(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className={styles.infoBox}>
          <p>⏰ El sistema registra automáticamente cada transacción en Vercel el día 1 de cada mes a las 9am. Si el día configurado es mayor al 1, se ejecutará igualmente ese día.</p>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Nueva transacción recurrente</h2>
              <button onClick={closeModal}><X size={20} /></button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.typeToggle}>
                <button
                  className={`${styles.typeBtn} ${form.type === 'expense' ? styles.typeBtnActive : ''}`}
                  onClick={() => { setFormField('type', 'expense'); setFormField('category_id', '') }}
                >
                  Gasto
                </button>
                <button
                  className={`${styles.typeBtn} ${form.type === 'income' ? styles.typeBtnActiveIncome : ''}`}
                  onClick={() => { setFormField('type', 'income'); setFormField('category_id', '') }}
                >
                  Ingreso
                </button>
              </div>

              <label className={styles.label}>
                Monto (COP) *
                <CurrencyInput
                  className={styles.input}
                  placeholder="Ej: 1,000,000"
                  value={form.amount}
                  onChange={(val) => setFormField('amount', val)}
                />
              </label>

              <label className={styles.label}>
                Categoría *
                <select
                  className={styles.input}
                  value={form.category_id}
                  onChange={(e) => setFormField('category_id', e.target.value)}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </label>

              <label className={styles.label}>
                Descripción
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Ej: Salario mensual, Arriendo apto..."
                  value={form.description}
                  onChange={(e) => setFormField('description', e.target.value)}
                />
              </label>

              <label className={styles.label}>
                Día del mes (1–28)
                <select
                  className={styles.input}
                  value={form.day_of_month}
                  onChange={(e) => setFormField('day_of_month', e.target.value)}
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>Día {d}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancelar</button>
              <button
                className={styles.saveBtn}
                onClick={saveRecurring}
                disabled={saving || !form.amount || !form.category_id}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
