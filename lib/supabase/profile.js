import { createClient } from './client'

export async function updateProfile(userId, updates) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single()

  if (error) throw error
  return data
}
