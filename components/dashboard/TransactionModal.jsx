'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { getCategoriesByType } from '@/lib/data/categories'
import { createTransaction, updateTransaction } from '@/lib/supabase/transactions'
import { useTranslations } from 'next-intl'
import CurrencyInput from './CurrencyInput'
import styles from './TransactionModal.module.css'

export default function TransactionModal({ isOpen, onClose, onSuccess, transaction = null }) {
  const t = useTranslations('TransactionModal')
  const isEditing = Boolean(transaction)

  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    if (transaction) {
      setType(transaction.type)
      setAmount(String(transaction.amount))
      setCategoryId(transaction.category_id)
      setDescription(transaction.description || '')
      setDate(transaction.date)
    } else {
      setType('expense')
      setAmount('')
      setCategoryId('')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])
    }
    setError('')
  }, [transaction, isOpen])

  const handleTypeChange = (newType) => {
    setType(newType)
    setCategoryId('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || !categoryId || !date) {
      setError(t('errorRequired'))
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = {
        type,
        amount: parseFloat(amount),
        category_id: categoryId,
        description: description.trim() || null,
        date,
      }
      if (isEditing) {
        await updateTransaction(transaction.id, payload)
      } else {
        await createTransaction(payload)
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message || t('errorSave'))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const categories = getCategoriesByType(type)

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{isEditing ? t('titleEdit') : t('titleNew')}</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <div className={styles.typeToggle}>
          <button
            type="button"
            className={`${styles.typeBtn} ${type === 'expense' ? styles.expenseActive : ''}`}
            onClick={() => handleTypeChange('expense')}
          >
            {t('typeExpense')}
          </button>
          <button
            type="button"
            className={`${styles.typeBtn} ${type === 'income' ? styles.incomeActive : ''}`}
            onClick={() => handleTypeChange('income')}
          >
            {t('typeIncome')}
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="modal-amount">{t('amount')}</label>
              <div className={styles.inputWrapper}>
                <span className={styles.prefix}>$</span>
                <CurrencyInput
                  id="modal-amount"
                  value={amount}
                  onChange={setAmount}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="modal-date">{t('date')}</label>
              <input
                id="modal-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="modal-category">{t('category')}</label>
            <select
              id="modal-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">{t('categoryPlaceholder')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="modal-desc">{t('description')}</label>
            <input
              id="modal-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              maxLength={200}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              {t('cancel')}
            </button>
            <button
              type="submit"
              className={`${styles.submitBtn} ${type === 'income' ? styles.incomeSubmit : styles.expenseSubmit}`}
              disabled={loading}
            >
              {loading ? t('saving') : isEditing ? t('saveChanges') : t('register')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
