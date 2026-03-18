import { createClient } from "@/lib/supabase/client"

export async function getGoals() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data || []
}

export async function createGoal({ name, target, deadline }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from("goals")
    .insert({ name, target: Number(target), saved: 0, deadline: deadline || null, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function addSavingsToGoal(id, amount) {
  const supabase = createClient()
  const { data: goal, error: fetchErr } = await supabase
    .from("goals")
    .select("saved, target")
    .eq("id", id)
    .single()
  if (fetchErr) throw fetchErr
  const newSaved = Math.min(Number(goal.saved) + Number(amount), Number(goal.target))
  const { data, error } = await supabase
    .from("goals")
    .update({ saved: newSaved })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteGoal(id) {
  const supabase = createClient()
  const { error } = await supabase.from("goals").delete().eq("id", id)
  if (error) throw error
}