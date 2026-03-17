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
  "description": "descripción breve en español"
}

NO incluyas el campo "date" — la fecha la maneja el sistema automáticamente.`

const RECEIPT_PROMPT = `Eres un asistente financiero. Analiza esta imagen de una factura o recibo y extrae la información de la transacción.

CATEGORÍAS DISPONIBLES:
Ingresos: salary, freelance, investment, other_income
Gastos: food, transport, housing, services, entertainment, health, education, other_expense

Responde ÚNICAMENTE con JSON válido:
{
  "is_transaction": true,
  "amount": número_entero_total_en_COP,
  "type": "expense",
  "category_id": "una_de_las_categorías",
  "description": "descripción breve del establecimiento o producto"
}

Si no puedes leer la factura, responde:
{"is_transaction": false, "reply": "No pude leer la factura 😕 Intenta con una foto más clara."}`

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

function twilioAuthHeader() {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) return null
  return 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64')
}

async function fetchTwilioMedia(mediaUrl) {
  const auth = twilioAuthHeader()
  if (!auth) {
    console.error('fetchTwilioMedia: TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN not set')
    throw new Error('Twilio credentials not configured')
  }
  const res = await fetch(mediaUrl, { headers: { Authorization: auth } })
  if (!res.ok) {
    console.error(`fetchTwilioMedia: HTTP ${res.status} for ${mediaUrl}`)
    throw new Error(`Failed to fetch media: ${res.status}`)
  }
  const buffer = await res.arrayBuffer()
  const contentType = res.headers.get('content-type') || 'application/octet-stream'
  // Warn if image is large (>3MB base64 might exceed Groq limits)
  if (buffer.byteLength > 3 * 1024 * 1024) {
    console.warn(`fetchTwilioMedia: large file ${(buffer.byteLength / 1024 / 1024).toFixed(1)}MB`)
  }
  return { buffer, contentType }
}

async function transcribeAudio(mediaUrl, groq) {
  const { buffer, contentType } = await fetchTwilioMedia(mediaUrl)
  const ext = contentType.includes('ogg') ? 'ogg'
    : contentType.includes('mp4') ? 'mp4'
    : contentType.includes('mpeg') ? 'mp3'
    : contentType.includes('wav') ? 'wav'
    : 'ogg'
  const file = new File([buffer], `audio.${ext}`, { type: contentType })
  const transcription = await groq.audio.transcriptions.create({
    file,
    model: 'whisper-large-v3',
    language: 'es',
  })
  return transcription.text
}

async function analyzeReceipt(mediaUrl, groq) {
  const { buffer, contentType } = await fetchTwilioMedia(mediaUrl)
  console.log(`analyzeReceipt: ${contentType}, ${(buffer.byteLength / 1024).toFixed(0)}KB`)

  if (buffer.byteLength > 4 * 1024 * 1024) {
    throw new Error('Image too large for vision model (>4MB)')
  }

  const base64 = Buffer.from(buffer).toString('base64')
  const dataUrl = `data:${contentType};base64,${base64}`

  try {
    // Note: vision models don't support separate system messages with multimodal input
    const completion = await groq.chat.completions.create({
      model: 'llama-3.2-11b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: dataUrl } },
            { type: 'text', text: RECEIPT_PROMPT + '\n\nExtrae la información de esta factura o recibo.' },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.1,
    })
    const text = completion.choices[0].message.content.trim()
    console.log('analyzeReceipt response:', text.slice(0, 200))
    return text
  } catch (groqErr) {
    console.error('analyzeReceipt Groq error:', groqErr?.message, groqErr?.status, JSON.stringify(groqErr?.error))
    throw groqErr
  }
}

async function parseWithGroq(text, groq) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: text },
    ],
    max_tokens: 300,
    temperature: 0.1,
  })
  const responseText = completion.choices[0].message.content.trim()
  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in response')
  return JSON.parse(jsonMatch[0])
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const from = formData.get('From') || ''
    const body = (formData.get('Body') || '').trim()
    const phoneNumber = from.replace('whatsapp:', '')
    const numMedia = parseInt(formData.get('NumMedia') || '0')
    const mediaUrl = numMedia > 0 ? formData.get('MediaUrl0') : null
    const mediaType = numMedia > 0 ? (formData.get('MediaContentType0') || '') : ''

    if (!phoneNumber) return twiml('No pude entender tu mensaje.')

    const supabase = createAdminClient()

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
    if (profile.whatsapp_pending && !mediaUrl) {
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

      // New message while pending — cancel old and process new
      await supabase
        .from('profiles')
        .update({ whatsapp_pending: null })
        .eq('id', profile.id)
    }

    // --- Process media or text ---
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    let parsed

    try {
      if (mediaUrl && mediaType.startsWith('audio/')) {
        // 🎤 Audio message → transcribe → parse
        const transcript = await transcribeAudio(mediaUrl, groq)
        if (!transcript) return twiml('No pude escuchar bien el audio 😕 Intenta de nuevo.')
        parsed = await parseWithGroq(transcript, groq)

      } else if (mediaUrl && mediaType.startsWith('image/')) {
        // 🧾 Receipt image → vision model
        const responseText = await analyzeReceipt(mediaUrl, groq)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON from vision')
        parsed = JSON.parse(jsonMatch[0])

      } else {
        // 💬 Text message
        if (!body) return twiml('No pude entender tu mensaje.')
        parsed = await parseWithGroq(body, groq)
      }
    } catch (err) {
      console.error('Groq parse error:', err.message)
      if (mediaType.startsWith('audio/')) {
        return twiml('No pude procesar el audio 😅 Intenta escribir el gasto.')
      }
      if (mediaType.startsWith('image/')) {
        if (err.message?.includes('credentials')) {
          return twiml('Error de configuración del servidor 🛠️ Contacta al administrador.')
        }
        if (err.message?.includes('large')) {
          return twiml('La foto es muy grande 📷 Intenta con una imagen más pequeña o escribe el monto directamente.')
        }
        return twiml('No pude leer la factura 😕 Intenta con una foto más clara o escribe el monto.')
      }
      return twiml('No entendí bien 😅 Intenta con algo como: _"Gasté 20 mil en el almuerzo"_')
    }

    if (!parsed.is_transaction) {
      return twiml(parsed.reply || 'Cuéntame qué gastaste o recibiste y lo registro por ti 💚')
    }

    const amount = Math.abs(Math.round(Number(parsed.amount)))
    if (!amount || amount <= 0) {
      return twiml('No pude detectar el monto 🤔 Intenta siendo más específico, ej: _"Gasté 15.000 en el bus"_')
    }

    const today = new Date().toISOString().split('T')[0]
    const pending = {
      type: parsed.type,
      amount,
      category_id: parsed.category_id || null,
      description: parsed.description || body.slice(0, 60),
      date: today,
    }

    await supabase
      .from('profiles')
      .update({ whatsapp_pending: pending })
      .eq('id', profile.id)

    const emoji = parsed.type === 'income' ? '💰' : '💸'
    const typeLabel = parsed.type === 'income' ? 'Ingreso' : 'Gasto'
    const sourceLabel = mediaType.startsWith('audio/') ? ' 🎤' : mediaType.startsWith('image/') ? ' 🧾' : ''

    return twiml(
      `${emoji} *${typeLabel}:*${sourceLabel} ${pending.description}\n` +
      `💵 *Monto:* ${fmt(amount)}\n\n` +
      `¿Lo registro? Responde *sí* para confirmar o *no* para cancelar.`
    )
  } catch (err) {
    console.error('WhatsApp webhook error:', err)
    return twiml('Nuestro AI está teniendo problemas en este momento. Intenta más tarde 🙏')
  }
}
