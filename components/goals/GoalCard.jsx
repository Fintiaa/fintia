'use client'

import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import styles from './goals.module.css'

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(n || 0))

export default function GoalCard({ goal, onAdd, onDelete }) {
  const [amount, setAmount] = useState('')

  const percent = goal.target > 0 ? Math.min((goal.saved / goal.target) * 100, 100) : 0
  const done = percent >= 100

  const addMoney = () => {
    const value = Number(amount)
    if (!value) return
    onAdd(goal.id, value)
    setAmount('')
  }

  return (
    <div className={styles.goalCard}>
      <div className={styles.goalCardHeader}>
        <h3 className={styles.goalName}>{goal.name}</h3>
        <button className={styles.deleteBtn} onClick={() => onDelete(goal.id)} title="Eliminar">
          <Trash2 size={13} />
        </button>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.amounts}>
          <span className={styles.amountSaved}>{fmt(goal.saved)}</span>
          <span className={styles.amountTarget}>de {fmt(goal.target)}</span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressFill} ${done ? styles.progressFillDone : ''}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className={styles.progressInfo}>
          <span>{done ? '¡Meta alcanzada! 🎉' : `Faltan ${fmt(goal.target - goal.saved)}`}</span>
          <span className={styles.progressPct}>{percent.toFixed(0)}%</span>
        </div>
      </div>

      {done ? (
        <div className={styles.completedBadge}>✅ Completada</div>
      ) : (
        <div className={styles.addRow}>
          <input
            className={styles.addInput}
            type="number"
            placeholder="Añadir monto"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMoney()}
          />
          <button className={styles.addBtn} onClick={addMoney}>
            <Plus size={13} /> Añadir
          </button>
        </div>
      )}
    </div>
  )
}