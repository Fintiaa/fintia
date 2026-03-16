import { createClient } from './client'

export async function getRecurringTransactions() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('recurring_transactions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createRecurring(recurring) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('recurring_transactions')
    .insert({ ...recurring, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRecurring(id, updates) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('recurring_transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRecurring(id) {
  const supabase = createClient()
  const { error } = await supabase.from('recurring_transactions').delete().eq('id', id)
  if (error) throw error
}
