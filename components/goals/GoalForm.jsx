'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import styles from './goals.module.css'

export default function GoalForm({ onCreate }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim() || !Number(amount)) return
    onCreate({ name: name.trim(), target: Number(amount), saved: 0 })
    setName('')
    setAmount('')
  }

  return (
    <div className={styles.formCard}>
      <p className={styles.formTitle}>Nueva meta de ahorro</p>
      <form onSubmit={submit}>
        <div className={styles.formRow}>
          <div className={styles.field}>
            <label>Nombre</label>
            <input
              placeholder="Ej: Viaje a Cartagena"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>Monto objetivo (COP)</label>
            <input
              type="number"
              placeholder="Ej: 500000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              required
            />
          </div>
          <button type="submit" className={styles.createBtn}>
            <Plus size={16} /> Crear
          </button>
        </div>
      </form>
    </div>
  )
}