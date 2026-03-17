import { createClient } from './client'
import { getCategoryById } from '@/lib/data/categories'
import { sendAlertEmail } from '@/lib/email/sendAlertEmail'

export async function getAlerts({ unreadOnly = false, limit = 50 } = {}) {
  const supabase = createClient()

  let query = supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getUnreadAlertCount() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('alerts')
    .select('id')
    .eq('is_read', false)

  if (error) throw error
  return (data || []).length
}

export async function markAlertAsRead(id) {
  const supabase = createClient()
  const { error } = await supabase
    .from('alerts')
    .update({ is_read: true })
    .eq('id', id)

  if (error) throw error
}

export async function markAllAlertsAsRead() {
  const supabase = createClient()
  const { error } = await supabase
    .from('alerts')
    .update({ is_read: true })
    .eq('is_read', false)

  if (error) throw error
}

export async function checkBudgetsAndCreateAlerts() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get all active budgets
  const { data: budgets, error: budgetError } = await supabase
    .from('budgets')
    .select('*')
    .eq('is_active', true)

  if (budgetError || !budgets?.length) return []

  const now = new Date()
  const newAlerts = []

  for (const budget of budgets) {
    // Calculate period dates
    let from, to
    if (budget.period === 'monthly') {
      from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      to = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    } else {
      const dayOfWeek = now.getDay()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      from = startOfWeek.toISOString().split('T')[0]
      to = endOfWeek.toISOString().split('T')[0]
    }

    // Get spending for this category in period
    const { data: txns, error: txnError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('category_id', budget.category_id)
      .eq('type', 'expense')
      .gte('date', from)
      .lte('date', to)

    if (txnError) continue

    const spent = (txns || []).reduce((sum, t) => sum + Number(t.amount), 0)
    const budgetAmount = Number(budget.amount)
    const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0

    if (percentage < 80) continue

    // Check if we already have an alert for this budget+type in this period
    const alertType = percentage >= 100 ? 'exceeded' : 'warning'

    const { data: existingAlerts } = await supabase
      .from('alerts')
      .select('id')
      .eq('budget_id', budget.id)
      .eq('type', alertType)
      .gte('created_at', from)

    if (existingAlerts && existingAlerts.length > 0) continue

    // Create alert with readable category name
    const cat = getCategoryById(budget.category_id)
    const categoryName = cat?.name || budget.category_id

    const message = percentage >= 100
      ? `Has excedido tu presupuesto de ${categoryName}. Gastaste ${Math.round(percentage)}% del límite.`
      : `Estás cerca del límite en ${categoryName}. Has usado ${Math.round(percentage)}% de tu presupuesto.`

    const { data: alert, error: alertError } = await supabase
      .from('alerts')
      .insert({
        user_id: user.id,
        budget_id: budget.id,
        category_id: budget.category_id,
        type: alertType,
        message,
        percentage: Math.round(percentage * 100) / 100,
        amount_spent: spent,
        budget_amount: budgetAmount,
      })
      .select()
      .single()

    if (!alertError && alert) {
      newAlerts.push(alert)
      // Send email notification (non-blocking)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser?.email) {
        sendAlertEmail({
          toEmail: authUser.email,
          categoryName,
          percentage,
          amountSpent: spent,
          budgetAmount,
          type: alertType,
        })
      }
    }
  }

  return newAlerts
}
