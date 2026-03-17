// Server-only: contains email sending logic — never import this from client components
import { createClient } from '@supabase/supabase-js'
import { getCategoryById } from '@/lib/data/categories'
import { sendAlertEmail } from '@/lib/email/sendAlertEmail'

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// Checks budgets for all premium users and sends emails for new alerts.
// Called from the daily cron job.
export async function checkBudgetsAndSendEmails() {
  const supabase = createAdminClient()

  // Get all premium users
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, subscription_tier')
    .eq('subscription_tier', 'premium')

  if (!profiles?.length) return { checked: 0, alerts: 0 }

  const now = new Date()
  let totalAlerts = 0

  for (const profile of profiles) {
    const userId = profile.id

    // Get auth user email
    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId)
    const userEmail = authUser?.email
    if (!userEmail) continue

    // Get active budgets for this user
    const { data: budgets } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (!budgets?.length) continue

    for (const budget of budgets) {
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

      const { data: txns } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('category_id', budget.category_id)
        .eq('type', 'expense')
        .gte('date', from)
        .lte('date', to)

      const spent = (txns || []).reduce((sum, t) => sum + Number(t.amount), 0)
      const budgetAmount = Number(budget.amount)
      const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0

      if (percentage < 80) continue

      const alertType = percentage >= 100 ? 'exceeded' : 'warning'

      const { data: existing } = await supabase
        .from('alerts')
        .select('id')
        .eq('budget_id', budget.id)
        .eq('type', alertType)
        .gte('created_at', from)

      if (existing?.length) continue

      const cat = getCategoryById(budget.category_id)
      const categoryName = cat?.name || budget.category_id
      const message = percentage >= 100
        ? `Has excedido tu presupuesto de ${categoryName}. Gastaste ${Math.round(percentage)}% del límite.`
        : `Estás cerca del límite en ${categoryName}. Has usado ${Math.round(percentage)}% de tu presupuesto.`

      const { error: alertError } = await supabase.from('alerts').insert({
        user_id: userId,
        budget_id: budget.id,
        category_id: budget.category_id,
        type: alertType,
        message,
        percentage: Math.round(percentage * 100) / 100,
        amount_spent: spent,
        budget_amount: budgetAmount,
      })

      if (!alertError) {
        totalAlerts++
        sendAlertEmail({ toEmail: userEmail, categoryName, percentage, amountSpent: spent, budgetAmount, type: alertType })
      }
    }
  }

  return { checked: profiles.length, alerts: totalAlerts }
}
