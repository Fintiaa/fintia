// Regex-based email parser for Mexican bank transaction notifications
// Supports: BBVA, Banorte, HSBC, Santander, Citibanamex, Scotiabank

// Patterns to extract amounts (MXN)
const AMOUNT_PATTERNS = [
  /\$\s?([\d,]+\.?\d{0,2})/,                    // $1,500.00 or $1500
  /MXN\s?([\d,]+\.?\d{0,2})/i,                   // MXN 1500.00
  /monto[:\s]+([\d,]+\.?\d{0,2})/i,              // Monto: 1500.00
  /por\s+\$?\s?([\d,]+\.?\d{0,2})/i,             // por $1,500.00
  /importe[:\s]+\$?\s?([\d,]+\.?\d{0,2})/i,      // Importe: $1500
  /total[:\s]+\$?\s?([\d,]+\.?\d{0,2})/i,        // Total: $1500
]

// Patterns that indicate expense
const EXPENSE_KEYWORDS = [
  /compra/i, /pago/i, /retiro/i, /cargo/i, /cobro/i,
  /transferencia enviada/i, /enviaste/i, /débito/i, /debito/i,
  /comisión/i, /comision/i, /spei enviado/i,
]

// Patterns that indicate income
const INCOME_KEYWORDS = [
  /depósito/i, /deposito/i, /abono/i, /transferencia recibida/i,
  /recibiste/i, /crédito/i, /credito/i, /nómina/i, /nomina/i,
  /spei recibido/i, /ingreso/i,
]

// Date patterns
const DATE_PATTERNS = [
  /(\d{1,2})[-/](\d{1,2})[-/](\d{4})/,              // DD/MM/YYYY or DD-MM-YYYY
  /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/,             // YYYY/MM/DD or YYYY-MM-DD
  /(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i,      // 15 de enero de 2026
]

const MONTH_NAMES = {
  enero: '01', febrero: '02', marzo: '03', abril: '04',
  mayo: '05', junio: '06', julio: '07', agosto: '08',
  septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12',
}

// Bank detection
const BANK_PATTERNS = [
  { pattern: /bbva/i, name: 'BBVA' },
  { pattern: /banorte/i, name: 'Banorte' },
  { pattern: /hsbc/i, name: 'HSBC' },
  { pattern: /santander/i, name: 'Santander' },
  { pattern: /banamex|citibanamex/i, name: 'Citibanamex' },
  { pattern: /scotiabank/i, name: 'Scotiabank' },
  { pattern: /banregio/i, name: 'Banregio' },
]

// Category inference based on description keywords
const CATEGORY_KEYWORDS = {
  food: [/super/i, /walmart/i, /soriana/i, /chedraui/i, /oxxo/i, /restaur/i, /comida/i, /aliment/i, /uber\s?eats/i, /didi\s?food/i, /rappi/i],
  transport: [/uber/i, /didi/i, /gasolina/i, /estacionamiento/i, /caseta/i, /taxi/i, /metro/i],
  housing: [/renta/i, /hipoteca/i, /alquiler/i, /predial/i],
  services: [/luz/i, /cfe/i, /agua/i, /gas/i, /internet/i, /telmex/i, /telcel/i, /att/i, /at&t/i, /izzi/i, /totalplay/i],
  entertainment: [/netflix/i, /spotify/i, /amazon\s?prime/i, /disney/i, /cine/i, /cinepolis/i, /cinemex/i, /hbo/i, /steam/i, /xbox/i, /playstation/i],
  health: [/farmacia/i, /médico/i, /medico/i, /hospital/i, /doctor/i, /salud/i, /consultorio/i],
  education: [/universidad/i, /escuela/i, /colegiatura/i, /curso/i, /udemy/i, /platzi/i],
}

function parseAmount(text) {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const raw = match[1].replace(/,/g, '')
      const num = parseFloat(raw)
      if (num > 0 && num < 10000000) return num
    }
  }
  return null
}

function parseType(text) {
  let expenseScore = 0
  let incomeScore = 0

  for (const kw of EXPENSE_KEYWORDS) {
    if (kw.test(text)) expenseScore++
  }
  for (const kw of INCOME_KEYWORDS) {
    if (kw.test(text)) incomeScore++
  }

  if (incomeScore > expenseScore) return 'income'
  if (expenseScore > 0) return 'expense'
  return 'expense' // default to expense
}

function parseDate(text, emailDate) {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      // DD/MM/YYYY
      if (match[3] && match[3].length === 4 && !match[1].match(/^\d{4}$/)) {
        const day = match[1].padStart(2, '0')
        const monthRaw = match[2]
        const year = match[3]
        const month = MONTH_NAMES[monthRaw.toLowerCase()] || monthRaw.padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      // YYYY/MM/DD
      if (match[1] && match[1].length === 4) {
        return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
      }
    }
  }

  // Fallback to email date
  if (emailDate) {
    try {
      const d = new Date(emailDate)
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0]
      }
    } catch {
      // ignore
    }
  }

  return new Date().toISOString().split('T')[0]
}

function inferCategory(text, type) {
  if (type === 'income') {
    if (/nómina|nomina|salario|sueldo/i.test(text)) return 'salary'
    if (/freelance/i.test(text)) return 'freelance'
    if (/inversión|inversion|rendimiento|dividendo/i.test(text)) return 'investment'
    return 'other_income'
  }

  for (const [categoryId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (kw.test(text)) return categoryId
    }
  }

  return 'other_expense'
}

function detectBank(text) {
  for (const { pattern, name } of BANK_PATTERNS) {
    if (pattern.test(text)) return name
  }
  return 'Desconocido'
}

function buildDescription(subject, text, type) {
  // Try to extract merchant/concept from common patterns
  const merchantPatterns = [
    /en\s+([A-Z\s]{3,30})/,                        // "en WALMART SUPERCENTER"
    /comercio[:\s]+([^\n.]{3,40})/i,                // "Comercio: UBER"
    /establecimiento[:\s]+([^\n.]{3,40})/i,         // "Establecimiento: OXXO"
    /concepto[:\s]+([^\n.]{3,60})/i,                // "Concepto: Pago de luz"
    /referencia[:\s]+([^\n.]{3,40})/i,              // "Referencia: ..."
  ]

  for (const pattern of merchantPatterns) {
    const match = text.match(pattern)
    if (match) return match[1].trim().substring(0, 60)
  }

  // Fallback to subject line cleaned up
  if (subject) {
    const cleaned = subject
      .replace(/notificaci[oó]n/i, '')
      .replace(/alerta/i, '')
      .replace(/aviso/i, '')
      .replace(/bancario/i, '')
      .trim()
    if (cleaned.length > 3) return cleaned.substring(0, 60)
  }

  return type === 'income' ? 'Ingreso bancario' : 'Gasto bancario'
}

export async function parseEmailToTransaction(email) {
  const subject = email.headers.find((h) => h.name === 'Subject')?.value || ''
  const from = email.headers.find((h) => h.name === 'From')?.value || ''
  const emailDate = email.headers.find((h) => h.name === 'Date')?.value || ''

  const fullText = `${subject} ${email.body || ''} ${email.snippet || ''}`

  // Extract amount - if no amount found, it's not a transaction email
  const amount = parseAmount(fullText)
  if (!amount) {
    return { is_transaction: false }
  }

  const type = parseType(fullText)
  const date = parseDate(fullText, emailDate)
  const categoryId = inferCategory(fullText, type)
  const bank = detectBank(`${from} ${fullText}`)
  const description = buildDescription(subject, fullText, type)

  return {
    is_transaction: true,
    type,
    amount,
    description,
    date,
    category_id: categoryId,
    confidence: 0.7,
    bank,
  }
}
