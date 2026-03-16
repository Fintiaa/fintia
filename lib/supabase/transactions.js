import { createClient } from './client'

export async function getTransactions({ filters = {}, limit } = {}) {
  const supabase = createClient()

  let query = supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters.type) query = query.eq('type', filters.type)
  if (filters.category_id) query = query.eq('category_id', filters.category_id)
  if (filters.from) query = query.gte('date', filters.from)
  if (filters.to) query = query.lte('date', filters.to)
  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createTransaction(transaction) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...transaction, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTransaction(id, updates) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('transactions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTransaction(id) {
  const supabase = createClient()

  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}

export async function getStatsForPeriod(from, to) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .gte('date', from)
    .lte('date', to)
  if (error) throw error
  const income = (data || []).filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expenses = (data || []).filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  return { income, expenses, balance: income - expenses }
}

export async function getCategoryExpenses(from, to) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('category_id, amount')
    .eq('type', 'expense')
    .gte('date', from)
    .lte('date', to)
  if (error) throw error
  const map = {}
  for (const tx of data || []) {
    map[tx.category_id] = (map[tx.category_id] || 0) + Number(tx.amount)
  }
  return map
}

export async function getMonthlyHistory(months = 6, locale = 'es-MX') {
  const supabase = createClient()
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
  const from = startDate.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount, date')
    .gte('date', from)
  if (error) throw error

  const buckets = {}
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets[key] = {
      month: d.toLocaleDateString(locale, { month: 'short' }),
      income: 0,
      expenses: 0,
    }
  }
  for (const tx of data || []) {
    const key = tx.date.substring(0, 7)
    if (buckets[key]) {
      if (tx.type === 'income') buckets[key].income += Number(tx.amount)
      else buckets[key].expenses += Number(tx.amount)
    }
  }
  return Object.values(buckets)
}

export async function getMonthlyStats(year, month) {
  const supabase = createClient()
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .gte('date', from)
    .lte('date', to)

  if (error) throw error

  const income = (data || [])
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expenses = (data || [])
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return { income, expenses, balance: income - expenses }
}
