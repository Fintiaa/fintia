import OpenAI from 'openai'
import { CATEGORIES } from '@/lib/data/categories'

let _openai = null
function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _openai
}

const CATEGORY_LIST = CATEGORIES.map((c) => `${c.id}: ${c.name} (${c.type})`).join('\n')

export async function parseEmailToTransaction(email) {
  const subject = email.headers.find((h) => h.name === 'Subject')?.value || ''
  const from = email.headers.find((h) => h.name === 'From')?.value || ''
  const date = email.headers.find((h) => h.name === 'Date')?.value || ''

  const prompt = `Analiza este correo electrónico de un banco mexicano y extrae la información de la transacción financiera.

Correo:
De: ${from}
Asunto: ${subject}
Fecha: ${date}
Contenido: ${(email.body || email.snippet || '').substring(0, 2000)}

Categorías disponibles:
${CATEGORY_LIST}

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin backticks) con esta estructura:
{
  "is_transaction": true,
  "type": "income" o "expense",
  "amount": número decimal sin signo (ej: 1500.00),
  "description": "descripción breve",
  "date": "YYYY-MM-DD",
  "category_id": "id de categoría más apropiada",
  "confidence": 0.0 a 1.0,
  "bank": "nombre del banco"
}

Si el correo NO es una notificación de transacción (es marketing, actualización, etc.), responde:
{"is_transaction": false}

Notas:
- Montos MXN pueden aparecer como $1,500.00 o MXN 1500
- Compra/retiro/pago = expense, depósito/transferencia recibida = income
- Usa la fecha de la transacción, no la de envío del correo`

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente que extrae datos de transacciones de correos bancarios mexicanos. Responde solo con JSON válido.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 300,
    })

    const text = completion.choices[0].message.content.trim()
    return JSON.parse(text)
  } catch (err) {
    console.error('GPT parse error:', err)
    return { is_transaction: false, error: err.message }
  }
}
