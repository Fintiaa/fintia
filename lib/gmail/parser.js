// Regex-based email parser for Colombian bank transaction notifications
// Supports: Bancolombia, Davivienda, BBVA Colombia, Banco de Bogotá, Nequi, Daviplata, Scotiabank Colpatria, Lulo Bank

// Patterns to extract amounts (COP)
const AMOUNT_PATTERNS = [
  /\$\s?([\d.,]+)/,                               // $1.500.000 or $1500000
  /COP\s?([\d.,]+)/i,                             // COP 1500000
  /monto[:\s]+([\d.,]+)/i,                        // Monto: 1500000
  /por\s+\$?\s?([\d.,]+)/i,                       // por $1.500.000
  /valor[:\s]+\$?\s?([\d.,]+)/i,                  // Valor: $1500000
  /total[:\s]+\$?\s?([\d.,]+)/i,                  // Total: $1500000
]

// Patterns that indicate expense
const EXPENSE_KEYWORDS = [
  /compra/i, /pago/i, /retiro/i, /cargo/i, /cobro/i,
  /transferencia enviada/i, /enviaste/i, /débito/i, /debito/i,
  /comisión/i, /comision/i, /pse/i, /transfiya enviada/i,
  /realizaste una compra/i,
]

// Patterns that indicate income
const INCOME_KEYWORDS = [
  /depósito/i, /deposito/i, /abono/i, /transferencia recibida/i,
  /recibiste/i, /crédito/i, /credito/i, /nómina/i, /nomina/i,
  /transfiya recibida/i, /ingreso/i, /consignaci[oó]n/i,
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

// Bank detection (Colombian banks)
const BANK_PATTERNS = [
  { pattern: /bancolombia/i, name: 'Bancolombia' },
  { pattern: /davivienda/i, name: 'Davivienda' },
  { pattern: /bbva/i, name: 'BBVA Colombia' },
  { pattern: /banco\s*de\s*bogot[aá]/i, name: 'Banco de Bogotá' },
  { pattern: /nequi/i, name: 'Nequi' },
  { pattern: /daviplata/i, name: 'Daviplata' },
  { pattern: /scotiabank|colpatria/i, name: 'Scotiabank Colpatria' },
  { pattern: /banco\s*popular/i, name: 'Banco Popular' },
  { pattern: /bancoomeva|comeva/i, name: 'Bancoomeva' },
  { pattern: /itau|ita[uú]/i, name: 'Itaú' },
  { pattern: /banco\s*de\s*occidente/i, name: 'Banco de Occidente' },
  { pattern: /nu\s*bank|nubank/i, name: 'Nu Bank' },
  { pattern: /lulo\s*bank|lulobank/i, name: 'Lulo Bank' },
]

// Category inference rules — ordered from most specific to least specific
// Each rule: [regex, category]. First match wins, so specific patterns go first.
const CATEGORY_RULES = [
  // Food — specific app/store names first
  [/uber\s?eats/i, 'food'],
  [/didi\s?food/i, 'food'],
  [/rappi/i, 'food'],
  [/éxito/i, 'food'],
  [/exito/i, 'food'],
  [/jumbo/i, 'food'],
  [/olímpica/i, 'food'],
  [/olimpica/i, 'food'],
  [/d1\b/i, 'food'],
  [/\bara\b/i, 'food'],
  [/oxxo/i, 'food'],
  [/restaur/i, 'food'],
  [/comida/i, 'food'],
  [/aliment/i, 'food'],
  [/super(?:mercado)?/i, 'food'],
  [/carulla/i, 'food'],
  [/alkosto/i, 'food'],
  [/makro/i, 'food'],
  [/frisby/i, 'food'],
  [/mcdonald/i, 'food'],
  [/burger\s?king/i, 'food'],
  [/domino/i, 'food'],
  [/pizza/i, 'food'],
  [/panaderi/i, 'food'],
  [/tienda/i, 'food'],

  // Transport — specific first, then generic
  [/transmilenio/i, 'transport'],
  [/sitp/i, 'transport'],
  [/mio\b/i, 'transport'],
  [/metro\s?(?:de|bus)/i, 'transport'],
  [/uber(?!\s?eats)/i, 'transport'],
  [/didi(?!\s?food)/i, 'transport'],
  [/indriver/i, 'transport'],
  [/beat/i, 'transport'],
  [/taxi/i, 'transport'],
  [/gasolina/i, 'transport'],
  [/estacionamiento/i, 'transport'],
  [/parqueadero/i, 'transport'],
  [/peaje/i, 'transport'],
  [/eds\b/i, 'transport'],
  [/terpel/i, 'transport'],
  [/primax/i, 'transport'],
  [/biomax/i, 'transport'],

  // Housing
  [/arriendo/i, 'housing'],
  [/hipoteca/i, 'housing'],
  [/alquiler/i, 'housing'],
  [/predial/i, 'housing'],
  [/administraci[oó]n/i, 'housing'],

  // Services
  [/energ[ií]a/i, 'services'],
  [/codensa/i, 'services'],
  [/enel/i, 'services'],
  [/epm/i, 'services'],
  [/acueducto/i, 'services'],
  [/claro/i, 'services'],
  [/movistar/i, 'services'],
  [/tigo/i, 'services'],
  [/une\b/i, 'services'],
  [/etb/i, 'services'],
  [/wom\b/i, 'services'],
  [/internet/i, 'services'],
  [/\bluz\b/i, 'services'],
  [/\bagua\b/i, 'services'],
  [/\bgas\b(?!\s*natural)/i, 'services'],
  [/gas\s*natural/i, 'services'],

  // Entertainment
  [/netflix/i, 'entertainment'],
  [/spotify/i, 'entertainment'],
  [/amazon\s?prime/i, 'entertainment'],
  [/disney/i, 'entertainment'],
  [/hbo/i, 'entertainment'],
  [/cinecolombia/i, 'entertainment'],
  [/cine\s?colombia/i, 'entertainment'],
  [/procinal/i, 'entertainment'],
  [/cine/i, 'entertainment'],
  [/steam/i, 'entertainment'],
  [/xbox/i, 'entertainment'],
  [/playstation/i, 'entertainment'],
  [/youtube\s?premium/i, 'entertainment'],

  // Health
  [/farmatodo/i, 'health'],
  [/farmacia/i, 'health'],
  [/drogu/i, 'health'],
  [/cruz\s?verde/i, 'health'],
  [/locatel/i, 'health'],
  [/m[eé]dico/i, 'health'],
  [/hospital/i, 'health'],
  [/cl[ií]nica/i, 'health'],
  [/doctor/i, 'health'],
  [/salud/i, 'health'],
  [/consultorio/i, 'health'],
  [/\beps\b/i, 'health'],

  // Education
  [/universidad/i, 'education'],
  [/escuela/i, 'education'],
  [/colegio/i, 'education'],
  [/matr[ií]cula/i, 'education'],
  [/curso/i, 'education'],
  [/udemy/i, 'education'],
  [/platzi/i, 'education'],
  [/\bsena\b/i, 'education'],
  [/icetex/i, 'education'],

  // Shopping
  [/falabella/i, 'shopping'],
  [/homecenter/i, 'shopping'],
  [/mercado\s?libre/i, 'shopping'],
  [/mercado\s?pago/i, 'shopping'],
  [/amazon/i, 'shopping'],
  [/zara\b/i, 'shopping'],
  [/shein/i, 'shopping'],
]

function parseAmount(text) {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      // Colombian format uses dots as thousands separators and commas for decimals
      // e.g. 1.500.000,50 or 1500000
      let raw = match[1]
      // If it has dots followed by 3 digits, treat dots as thousands separators
      if (/\.\d{3}/.test(raw)) {
        raw = raw.replace(/\./g, '').replace(/,/g, '.')
      } else {
        raw = raw.replace(/,/g, '')
      }
      const num = parseFloat(raw)
      if (num > 0 && num < 100000000000) return num // COP amounts can be large
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

  for (const [pattern, category] of CATEGORY_RULES) {
    if (pattern.test(text)) return category
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
    /compra en\s+([A-Z][A-Z\s]{2,40}?)(?:\s+por|\s*$)/,  // "compra en KRIKA COSMETIC BOGOTA por"
    /en\s+([A-Z][A-Z\s]{2,30})/,                          // "en WALMART SUPERCENTER"
    /comercio[:\s]+([^\n.]{3,40})/i,                       // "Comercio: UBER"
    /establecimiento[:\s]+([^\n.]{3,40})/i,                // "Establecimiento: OXXO"
    /concepto[:\s]+([^\n.]{3,60})/i,                       // "Concepto: Pago de luz"
    /referencia[:\s]+([^\n.]{3,40})/i,                     // "Referencia: ..."
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
