import { createClient } from './client'

export async function getBudgets() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createBudget(budget) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('budgets')
    .insert({ ...budget, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateBudget(id, updates) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('budgets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteBudget(id) {
  const supabase = createClient()
  const { error } = await supabase.from('budgets').delete().eq('id', id)
  if (error) throw error
}

export async function getBudgetSpending(categoryId, period = 'monthly') {
  const supabase = createClient()
  const now = new Date()

  let from, to
  if (period === 'monthly') {
    from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    to = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  } else {
    // weekly
    const dayOfWeek = now.getDay()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    from = startOfWeek.toISOString().split('T')[0]
    to = endOfWeek.toISOString().split('T')[0]
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('category_id', categoryId)
    .eq('type', 'expense')
    .gte('date', from)
    .lte('date', to)

  if (error) throw error
  return (data || []).reduce((sum, t) => sum + Number(t.amount), 0)
}

export async function getAllBudgetsWithSpending() {
  const budgets = await getBudgets()

  const withSpending = await Promise.all(
    budgets.map(async (budget) => {
      const spent = await getBudgetSpending(budget.category_id, budget.period)
      const percentage = budget.amount > 0 ? (spent / Number(budget.amount)) * 100 : 0
      return {
        ...budget,
        spent,
        percentage: Math.round(percentage * 100) / 100,
      }
    })
  )

  return withSpending
}
