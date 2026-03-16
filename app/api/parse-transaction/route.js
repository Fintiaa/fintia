import Groq from 'groq-sdk'

const SYSTEM_PROMPT = `Eres un asistente financiero para usuarios colombianos. Tu tarea es extraer datos de transacciones financieras de mensajes en español colombiano coloquial o de imágenes de facturas/recibos.

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
Gastos: food (Alimentación - cafetería, supermercado, restaurante, café, tinto, almuerzo), transport (Transporte - taxi, bus, Uber, Transmilenio, SITP), housing (Vivienda - arriendo, servicios domiciliarios), services (Servicios - internet, agua, luz, gas, celular), entertainment (Entretenimiento - cine, rumba, bar, Netflix, conciertos), health (Salud - farmacia, médico, droguería), education (Educación - universidad, cursos, libros), other_expense (Otros gastos)

Para imágenes de facturas:
- Lee el total o subtotal más alto como el monto
- Identifica el tipo de negocio para asignar la categoría correcta
- Extrae la fecha si aparece en formato visible

RESPONDE ÚNICAMENTE con un JSON válido (sin markdown, sin texto extra):
{
  "amount": número_entero_en_COP,
  "type": "income" o "expense",
  "category_id": "una_de_las_categorías",
  "description": "descripción breve y clara en español",
  "date": "YYYY-MM-DD o null si no se menciona",
  "confidence": "high" si estás seguro, "medium" si hay algo ambiguo, "low" si estás adivinando,
  "message": "mensaje corto y amigable en español colombiano casual confirmando lo que entendiste (máx 1 oración)"
}`

export async function GET() {
  return Response.json({ groqKeySet: !!process.env.GROQ_API_KEY })
}

export async function POST(request) {
  try {
    const { text, imageBase64, mimeType } = await request.json()

    if (!text && !imageBase64) {
      return Response.json({ error: 'Sin entrada' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'GROQ_API_KEY no configurada en .env.local' }, { status: 500 })
    }

    const groq = new Groq({ apiKey })

    let responseText

    if (imageBase64) {
      // Usar modelo con visión para imágenes
      const completion = await groq.chat.completions.create({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` },
              },
              {
                type: 'text',
                text: text || 'Extrae la transacción de esta factura o recibo.',
              },
            ],
          },
        ],
        max_tokens: 512,
        temperature: 0.1,
      })
      responseText = completion.choices[0].message.content.trim()
    } else {
      // Solo texto
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
        max_tokens: 512,
        temperature: 0.1,
      })
      responseText = completion.choices[0].message.content.trim()
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error(`No encontré JSON en la respuesta: ${responseText.slice(0, 100)}`)

    const parsed = JSON.parse(jsonMatch[0])

    if (!parsed.date) {
      parsed.date = new Date().toISOString().split('T')[0]
    }

    parsed.amount = Math.abs(Math.round(Number(parsed.amount)))

    return Response.json(parsed)
  } catch (error) {
    console.error('Error parse-transaction:', error)
    return Response.json({ error: error?.message || 'Error desconocido' }, { status: 500 })
  }
}
