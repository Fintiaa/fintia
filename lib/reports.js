import { createClient } from "@/lib/supabase/client"

export async function getMonthlyTotal(year, month, type) {

  const supabase = createClient()

  const start = `${year}-${month}-01`
  const endDate = new Date(year, month, 0)
  const end = `${year}-${month}-${endDate.getDate()}`

  const { data, error } = await supabase
    .from("transactions")
    .select("amount,type")
    .eq("type", type)
    .gte("date", start)
    .lte("date", end)

  if (error) {
    console.error(error)
    return 0
  }

  return data.reduce((sum, t) => sum + t.amount, 0)
}

export function calculatePercentage(oldValue, newValue) {

  if (oldValue === 0) return 100

  return ((newValue - oldValue) / oldValue) * 100
}