import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export async function getGoals(limit = 3){

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("created_at",{ascending:false})
    .limit(limit)

  if(error) throw error

  return data
}