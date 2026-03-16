import { createClient } from '@supabase/supabase-js'

// Cliente admin que bypasea RLS para procesar todos los usuarios
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function GET(request) {
  // Verificar que la llamada viene de Vercel Cron (o testing manual con secret)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const today = now.getDate()

    // Obtener todas las recurrentes activas que no se han ejecutado este mes
    // y cuyo día coincide con hoy (o si ya pasó el día, igual las ejecutamos)
    const { data: recurring, error: fetchError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('is_active', true)
      .or(`last_executed_month.is.null,last_executed_month.neq.${currentMonth}`)

    if (fetchError) throw fetchError

    const results = { processed: 0, skipped: 0, errors: [] }

    for (const rec of recurring || []) {
      try {
        // Solo ejecutar si hoy es >= al día configurado (para no crear antes de tiempo)
        if (today < rec.day_of_month) {
          results.skipped++
          continue
        }

        // Crear la transacción
        const transactionDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(rec.day_of_month).padStart(2, '0')}`

        const { error: insertError } = await supabase
          .from('transactions')
          .insert({
            user_id: rec.user_id,
            amount: rec.amount,
            type: rec.type,
            category_id: rec.category_id,
            description: rec.description,
            date: transactionDate,
            source: 'recurring',
          })

        if (insertError) throw insertError

        // Marcar como ejecutada este mes
        await supabase
          .from('recurring_transactions')
          .update({ last_executed_month: currentMonth })
          .eq('id', rec.id)

        results.processed++
      } catch (err) {
        results.errors.push({ id: rec.id, error: err.message })
      }
    }

    console.log(`Cron recurring: ${JSON.stringify(results)}`)
    return Response.json({ success: true, month: currentMonth, ...results })
  } catch (error) {
    console.error('Cron error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
