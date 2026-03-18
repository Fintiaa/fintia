'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import EmojiPicker from 'emoji-picker-react'
import DashboardLayout from '@/components/DashboardLayout'
import { useCategories } from '@/lib/hooks/useCategories'
import styles from './page.module.css'

export default function CategoriesPage() {
  const t = useTranslations('Categories')
  const {
    categories,
    loading,
    error,
    createCategory,
    editCategory,
    removeCategory,
  } = useCategories()

  const [name, setName] = useState('')
  const [type, setType] = useState('expense')
  const [icon, setIcon] = useState('')
  const [color, setColor] = useState('#7ab98d')
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const { defaultCategories, customCategories } = useMemo(() => {
    const def = []
    const custom = []

    categories.forEach((c) => {
      if (c.isDefault) def.push(c)
      else custom.push(c)
    })

    return {
      defaultCategories: def,
      customCategories: custom,
    }
  }, [categories])

  const customCount = customCategories.length

  const typeLabel = (value) => {
    if (value === 'expense') return 'Gasto'
    if (value === 'income') return 'Ingreso'
    return value
  }

  const resetForm = () => {
    setName('')
    setType('expense')
    setIcon('')
    setColor('#7ab98d')
    setEditingId(null)
    setShowEmojiPicker(false)
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim() || !icon.trim() || !color) {
      setMessage(t('errorRequired'))
      return
    }

    try {
      if (editingId) {
        await editCategory(editingId, {
          name: name.trim(),
          type,
          icon: icon.trim(),
          color,
        })
        resetForm()
        setMessage(t('successUpdated'))
      } else {
        await createCategory({
          name: name.trim(),
          type,
          icon: icon.trim(),
          color,
        })
        resetForm()
        setMessage(t('successCreated'))
      }
    } catch (err) {
      setMessage(err?.message || t('errorDefault'))
    }
  }

  const startEdit = (cat) => {
    setEditingId(cat.id)
    setName(cat.name)
    setType(cat.type)
    setIcon(cat.icon)
    setColor(cat.color)
    setMessage('')
    setShowEmojiPicker(false)
  }

  const onDelete = async (catId) => {
    if (!window.confirm(t('deleteConfirm'))) return

    try {
      await removeCategory(catId)
      setMessage(t('successDeleted'))
    } catch (err) {
      setMessage(err?.message || t('errorDefault'))
    }
  }

  const onEmojiClick = (emojiData) => {
    setIcon(emojiData.emoji)
    setShowEmojiPicker(false)
  }

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
        </div>

        <div className={styles.card}>
          <h2>{editingId ? t('edit') : t('new')}</h2>

          <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.row}>
              <label htmlFor="category-name">{t('name')}</label>
              <input
                id="category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Transporte"
              />
            </div>

            <div className={styles.row}>
              <label htmlFor="category-type">{t('type')}</label>
              <select
                id="category-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
              </select>
            </div>

            <div className={styles.row}>
              <label>{t('icon')}</label>

              <div className={styles.iconSelector}>
                <button
                  type="button"
                  className={styles.emojiTrigger}
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                >
                  <span className={styles.emojiPreview}>{icon || '🙂'}</span>
                  <span>{icon ? 'Cambiar emoji' : 'Seleccionar emoji'}</span>
                </button>

                {icon && (
                  <button
                    type="button"
                    className={styles.clearEmoji}
                    onClick={() => setIcon('')}
                  >
                    Quitar
                  </button>
                )}
              </div>

              {showEmojiPicker && (
                <div className={styles.pickerWrapper}>
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                    lazyLoadEmojis
                    searchDisabled={false}
                    skinTonesDisabled
                    previewConfig={{ showPreview: false }}
                    width="100%"
                    height={350}
                  />
                </div>
              )}
            </div>

            <div className={styles.row}>
              <label htmlFor="category-color">{t('color')}</label>
              <input
                id="category-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className={styles.colorInput}
              />
            </div>

            <div className={styles.actions}>
              <button type="submit" className={styles.primary} disabled={loading}>
                {editingId ? t('update') : t('add')}
              </button>

              {editingId && (
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={resetForm}
                >
                  {t('cancel')}
                </button>
              )}
            </div>

            {message && <p className={styles.message}>{message}</p>}
            {error && <p className={styles.error}>{error}</p>}
          </form>
        </div>

        <div className={styles.categoriesGrid}>
          <div className={styles.categoryGroup}>
            <div className={styles.groupHeader}>
              <h3>{t('defaultCategories')}</h3>
            </div>

            <div className={styles.list}>
              {defaultCategories.map((cat) => (
                <div key={cat.id} className={styles.categoryTile}>
                  <span
                    className={styles.icon}
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.icon || '•'}
                  </span>

                  <div className={styles.categoryInfo}>
                    <p className={styles.categoryName}>{cat.name}</p>
                    <small className={styles.categoryType}>
                      {typeLabel(cat.type)}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.categoryGroup}>
            <div className={styles.groupHeader}>
              <h3>{t('customCategories')}</h3>
              <p className={styles.limitText}>
                {t('customLimit', { count: customCount, max: 20 })}
              </p>
            </div>

            <div className={styles.list}>
              {customCategories.length === 0 ? (
                <p className={styles.emptyText}>{t('noCustom')}</p>
              ) : (
                customCategories.map((cat) => (
                  <div key={cat.id} className={styles.categoryTile}>
                    <span
                      className={styles.icon}
                      style={{ backgroundColor: cat.color }}
                    >
                      {cat.icon || '•'}
                    </span>

                    <div className={styles.categoryInfo}>
                      <p className={styles.categoryName}>{cat.name}</p>
                      <small className={styles.categoryType}>
                        {typeLabel(cat.type)}
                      </small>
                    </div>

                    <div className={styles.actionsInline}>
                      <button type="button" onClick={() => startEdit(cat)}>
                        {t('edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(cat.id)}
                        className={styles.deleteBtn}
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}