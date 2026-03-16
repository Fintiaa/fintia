import { useState, useEffect } from 'react'
import { getRecurringTransactions, createRecurring, updateRecurring, deleteRecurring } from '@/lib/supabase/recurring'

const emptyForm = {
  type: 'expense',
  amount: '',
  category_id: '',
  description: '',
  day_of_month: 1,
}

export function useRecurring() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const fetchItems = async () => {
    setLoading(true)
    try {
      setItems(await getRecurringTransactions())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const openModal = () => {
    setForm(emptyForm)
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)

  const setFormField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const saveRecurring = async () => {
    if (!form.amount || !form.category_id) return
    setSaving(true)
    try {
      await createRecurring({
        type: form.type,
        amount: Number(form.amount),
        category_id: form.category_id,
        description: form.description,
        day_of_month: Number(form.day_of_month),
      })
      setModalOpen(false)
      setForm(emptyForm)
      fetchItems()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (item) => {
    try {
      await updateRecurring(item.id, { is_active: !item.is_active })
      fetchItems()
    } catch (e) {
      console.error(e)
    }
  }

  const deleteItem = async (id) => {
    try {
      await deleteRecurring(id)
      setDeletingId(null)
      fetchItems()
    } catch (e) {
      console.error(e)
    }
  }

  return {
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
  }
}
