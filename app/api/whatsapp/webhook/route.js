import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

const SYSTEM_PROMPT = `Eres un asistente financiero para usuarios colombianos llamado Fintia. Tu tarea es extraer datos de transacciones financieras de mensajes en español colombiano coloquial.

JERGA COLOMBIANA (muy importante):
- "una luca / un lucas / luka / lukas / lucas" = $1.000 COP (mil pesos)
- "2 lukas / 5 lukas / 6lukas / N lukas" = N × 1.000 COP
- "un palo" = $1.000.000 COP (un millón de pesos)
- "medio palo" = $500.000 COP
- "un billete" = $1.000 COP
- "5 mil / 20 mil / 50 mil" = 5.000 / 20.000 / 50.000 COP
- "4k" = 4.000 COP
- "un millón / dos millones" = 1.000.000 / 2.000.000 COP
- La moneda siempre es pesos colombianos (COP)

CATEGORÍAS DISPONIBLES:
Ingresos: salary, freelance, investment, other_income
Gastos: food, transport, housing, services, entertainment, health, education, other_expense

Si el mensaje NO es una transacción financiera, responde:
{"is_transaction": false, "reply": "respuesta amigable aquí"}

Si SÍ es una transacción, responde ÚNICAMENTE con JSON válido:
{
  "is_transaction": true,
  "amount": número_entero_en_COP,
  "type": "income" o "expense",
  "category_id": "una_de_las_categorías",
  "description": "descripción breve en español",
  "date": "YYYY-MM-DD"
}`

const CONFIRM_WORDS = ['sí', 'si', 's', 'yes', 'ok', 'dale', 'listo', 'confirmar', 'confirmo', 'obvio', 'claro']
const CANCEL_WORDS = ['no', 'cancel', 'cancelar', 'nope', 'neg']

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function twiml(message) {
  const safe = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe}</Message></Response>`,
    { headers: { 'Content-Type': 'text/xml' } }
  )
}

function fmt(amount) {
  return `$${Number(amount).toLocaleString('es-CO')}`
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const from = formData.get('From') || ''
    const body = (formData.get('Body') || '').trim()
    const phoneNumber = from.replace('whatsapp:', '')

    if (!phoneNumber || !body) return twiml('No pude entender tu mensaje.')

    const supabase = createAdminClient()

    // Find user by whatsapp_number
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, subscription_tier, whatsapp_pending')
      .eq('whatsapp_number', phoneNumber)
      .single()

    if (!profile) {
      return twiml(
        `👋 No encontré una cuenta de Fintia vinculada a este número.\n\n` +
        `Ve a *fintia-ten.vercel.app/dashboard/settings* y vincula tu número en la sección WhatsApp.`
      )
    }

    if (profile.subscription_tier !== 'premium') {
      return twiml(
        `⭐ El asistente de WhatsApp es una función Premium.\n\n` +
        `Actualiza tu plan en *fintia-ten.vercel.app/dashboard/settings*`
      )
    }

    const lowerBody = body.toLowerCase().trim()

    // --- Handle confirmation of pending transaction ---
    if (profile.whatsapp_pending) {
      if (CONFIRM_WORDS.includes(lowerBody)) {
        const p = profile.whatsapp_pending

        const { error: txError } = await supabase.from('transactions').insert({
          user_id: profile.id,
          type: p.type,
          amount: p.amount,
          category_id: p.category_id || null,
          description: p.description,
          date: p.date,
          source: 'manual',
        })

        if (txError) {
          console.error('Error saving confirmed transaction:', JSON.stringify(txError))
          return twiml('Hubo un error al guardar 😕 Intenta de nuevo.')
        }

        // Only clear pending after successful insert
        await supabase
          .from('profiles')
          .update({ whatsapp_pending: null })
          .eq('id', profile.id)

        return twiml(`✅ ¡Listo! Registré ${p.description} por ${fmt(p.amount)} en tu cuenta Fintia 💚`)
      }

      if (CANCEL_WORDS.includes(lowerBody)) {
        await supabase
          .from('profiles')
          .update({ whatsapp_pending: null })
          .eq('id', profile.id)
        return twiml('Cancelado 👍 Cuéntame si tienes otro gasto o ingreso.')
      }

      // New message while there's a pending — cancel old and process new
      await supabase
        .from('profiles')
        .update({ whatsapp_pending: null })
        .eq('id', profile.id)
    }

    // --- Parse message with Groq ---
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    let parsed

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: body },
        ],
        max_tokens: 300,
        temperature: 0.1,
      })

      const responseText = completion.choices[0].message.content.trim()
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON in response')
      parsed = JSON.parse(jsonMatch[0])
    } catch (err) {
      console.error('Groq parse error:', err.message)
      return twiml('No entendí bien 😅 Intenta con algo como: _"Gasté 20 mil en el almuerzo"_')
    }

    // Not a transaction
    if (!parsed.is_transaction) {
      return twiml(parsed.reply || 'Cuéntame qué gastaste o recibiste y lo registro por ti 💚')
    }

    const amount = Math.abs(Math.round(Number(parsed.amount)))
    if (!amount || amount <= 0) {
      return twiml('No pude detectar el monto 🤔 Intenta siendo más específico, ej: _"Gasté 15.000 en el bus"_')
    }

    const today = new Date().toISOString().split('T')[0]
    const date = /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : today
    const pending = {
      type: parsed.type,
      amount,
      category_id: parsed.category_id || null,
      description: parsed.description || body.slice(0, 60),
      date,
    }

    // Store as pending and ask for confirmation
    await supabase
      .from('profiles')
      .update({ whatsapp_pending: pending })
      .eq('id', profile.id)

    const emoji = parsed.type === 'income' ? '💰' : '💸'
    const typeLabel = parsed.type === 'income' ? 'Ingreso' : 'Gasto'

    return twiml(
      `${emoji} *${typeLabel}:* ${pending.description}\n` +
      `💵 *Monto:* ${fmt(amount)}\n\n` +
      `¿Lo registro? Responde *sí* para confirmar o *no* para cancelar.`
    )
  } catch (err) {
    console.error('WhatsApp webhook error:', err)
    return twiml('Nuestro AI está teniendo problemas en este momento. Intenta más tarde 🙏')
  }
}
