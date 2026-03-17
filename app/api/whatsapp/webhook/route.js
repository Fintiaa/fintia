import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

const SYSTEM_PROMPT = `Eres un asistente financiero para usuarios colombianos llamado Fintia. Tu tarea es extraer datos de transacciones financieras de mensajes en español colombiano coloquial.

JERGA COLOMBIANA (muy importante):
- "una luca / un lucas / luka / lukas / lucas" = $1.000 COP (mil pesos)
- "2 lukas / 5 lukas / N lukas" = N × 1.000 COP
- "un palo" = $1.000.000 COP (un millón de pesos)
- "medio palo" = $500.000 COP
- "un billete" = $1.000 COP
- "plata / platica" = dinero en general (NO es una cantidad específica)
- "5 mil / 20 mil / 50 mil" = 5.000 / 20.000 / 50.000 COP
- "un millón / dos millones" = 1.000.000 / 2.000.000 COP
- La moneda siempre es pesos colombianos (COP)

CATEGORÍAS DISPONIBLES:
Ingresos: salary (Salario/sueldo), freelance (Freelance/trabajo independiente), investment (Inversiones), other_income (Otros ingresos)
Gastos: food (Alimentación), transport (Transporte), housing (Vivienda), services (Servicios), entertainment (Entretenimiento), health (Salud), education (Educación), other_expense (Otros gastos)

Si el mensaje NO es una transacción financiera, responde con:
{"is_transaction": false, "reply": "tu respuesta amigable aquí"}

Si SÍ es una transacción, responde ÚNICAMENTE con JSON válido:
{
  "is_transaction": true,
  "amount": número_entero_en_COP,
  "type": "income" o "expense",
  "category_id": "una_de_las_categorías",
  "description": "descripción breve en español",
  "date": "YYYY-MM-DD",
  "reply": "mensaje confirmando en tono casual colombiano, máx 1 oración, incluye el monto formateado con puntos (ej: $50.000)"
}`

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function twimlReply(message) {
  // Escape XML special chars
  const safe = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe}</Message></Response>`,
    { headers: { 'Content-Type': 'text/xml' } }
  )
}

export async function POST(request) {
  try {
    // Twilio sends URL-encoded form data
    const formData = await request.formData()
    const from = formData.get('From') || ''          // "whatsapp:+573001234567"
    const body = (formData.get('Body') || '').trim()

    const phoneNumber = from.replace('whatsapp:', '')

    if (!phoneNumber || !body) {
      return twimlReply('No pude entender tu mensaje. Intenta de nuevo.')
    }

    // Find user by whatsapp_number (service role to bypass RLS)
    const supabase = createAdminClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, subscription_tier')
      .eq('whatsapp_number', phoneNumber)
      .single()

    if (!profile) {
      return twimlReply(
        `👋 Hola! No encontré una cuenta de Fintia vinculada a este número.\n\n` +
        `Para vincular tu WhatsApp ve a:\n` +
        `🔗 https://fintia-ten.vercel.app/dashboard/settings\n\n` +
        `En la sección "WhatsApp" ingresa tu número y ya podrás registrar gastos por aquí.`
      )
    }

    // Check premium
    if (profile.subscription_tier !== 'premium') {
      return twimlReply(
        `⭐ El asistente de WhatsApp es una función Premium.\n\n` +
        `Actualiza tu plan en:\n` +
        `🔗 https://fintia-ten.vercel.app/dashboard/settings`
      )
    }

    // Process with Groq
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: body },
      ],
      max_tokens: 512,
      temperature: 0.1,
    })

    const responseText = completion.choices[0].message.content.trim()
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return twimlReply('No entendí bien. Intenta con algo como: "Gasté 20 mil en el almuerzo"')
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Not a transaction — just a conversational reply
    if (!parsed.is_transaction) {
      return twimlReply(parsed.reply || 'Cuéntame qué gastaste o recibiste y lo registro por ti 💚')
    }

    // Save transaction
    const amount = Math.abs(Math.round(Number(parsed.amount)))
    const date = parsed.date || new Date().toISOString().split('T')[0]

    const { error: txError } = await supabase.from('transactions').insert({
      user_id: profile.id,
      type: parsed.type,
      amount,
      category_id: parsed.category_id,
      description: parsed.description || body.slice(0, 60),
      date,
      source: 'whatsapp',
    })

    if (txError) {
      console.error('Error saving transaction from WhatsApp:', txError)
      return twimlReply('Hubo un error guardando la transacción. Intenta de nuevo.')
    }

    return twimlReply(parsed.reply || `✅ Registrado: ${parsed.description} por $${amount.toLocaleString('es-CO')}`)
  } catch (err) {
    console.error('WhatsApp webhook error:', err)
    return twimlReply('Nuestro AI está teniendo problemas en este momento. Intenta más tarde 🙏')
  }
}
