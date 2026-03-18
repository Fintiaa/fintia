/**
 * HU-4: Sincronización Automática de Transacciones (Gmail)
 * Pruebas unitarias para el parser de correos bancarios colombianos
 */

import { parseEmailToTransaction } from '@/lib/gmail/parser'

function makeEmail({ subject = '', body = '', snippet = '', from = '', date = 'Mon, 14 Mar 2026 12:00:00 -0500' } = {}) {
  return {
    headers: [
      { name: 'Subject', value: subject },
      { name: 'From', value: from },
      { name: 'Date', value: date },
    ],
    body,
    snippet,
  }
}

// ─────────────────────────────────────────────
// Detección de monto
// ─────────────────────────────────────────────
describe('HU-4: parseEmailToTransaction — detección de monto', () => {
  test('extrae monto en formato Bancolombia COP20.300,00', async () => {
    const email = makeEmail({
      subject: 'Compra',
      body: 'Compraste COP20.300,00 en MERCADO PAGO',
      from: 'alertasynotificaciones@an.notificacionesbancolombia.com',
    })
    const result = await parseEmailToTransaction(email)
    expect(result.is_transaction).toBe(true)
    expect(result.amount).toBe(20300)
  })

  test('extrae monto en formato Lulo Bank $65,500', async () => {
    const email = makeEmail({
      subject: 'Compra realizada',
      body: 'Realizaste una compra en KRIKA COSMETIC BOGOTA por $65,500',
      from: 'notificaciones@lulobank.com',
    })
    const result = await parseEmailToTransaction(email)
    expect(result.is_transaction).toBe(true)
    expect(result.amount).toBe(65500)
  })

  test('extrae monto con formato $107,780', async () => {
    const email = makeEmail({
      body: 'Realizaste una compra en FARMATODO LA CLJA por $107,780',
      from: 'notificaciones@lulobank.com',
    })
    const result = await parseEmailToTransaction(email)
    expect(result.amount).toBe(107780)
  })

  test('extrae monto grande COP182.309,00', async () => {
    const email = makeEmail({
      body: 'Compraste COP182.309,00 en EDS ARCANGEL SAN RAF',
      from: 'alertasynotificaciones@an.notificacionesbancolombia.com',
    })
    const result = await parseEmailToTransaction(email)
    expect(result.amount).toBe(182309)
  })

  test('retorna is_transaction false si no hay monto', async () => {
    const email = makeEmail({ body: 'Bienvenido a Bancolombia. Tu cuenta está activa.' })
    const result = await parseEmailToTransaction(email)
    expect(result.is_transaction).toBe(false)
  })
})

// ─────────────────────────────────────────────
// Tipo de transacción (gasto / ingreso)
// ─────────────────────────────────────────────
describe('HU-4: parseEmailToTransaction — tipo de transacción', () => {
  test('detecta gasto por "Compraste"', async () => {
    const email = makeEmail({ body: 'Compraste COP50.000,00 en ÉXITO' })
    const result = await parseEmailToTransaction(email)
    expect(result.type).toBe('expense')
  })

  test('detecta gasto por "Realizaste una compra"', async () => {
    const email = makeEmail({ body: 'Realizaste una compra en FARMATODO por $30,000' })
    const result = await parseEmailToTransaction(email)
    expect(result.type).toBe('expense')
  })

  test('detecta ingreso por "recibiste"', async () => {
    const email = makeEmail({ body: 'Recibiste COP500.000,00 por transferencia recibida de Juan' })
    const result = await parseEmailToTransaction(email)
    expect(result.type).toBe('income')
  })

  test('detecta ingreso por "abono"', async () => {
    const email = makeEmail({ body: 'Abono a tu cuenta por COP1.200.000,00 nómina' })
    const result = await parseEmailToTransaction(email)
    expect(result.type).toBe('income')
  })
})

// ─────────────────────────────────────────────
// Detección de banco
// ─────────────────────────────────────────────
describe('HU-4: parseEmailToTransaction — detección de banco', () => {
  test('detecta Bancolombia por remitente', async () => {
    const email = makeEmail({
      body: 'Compraste COP20.300,00 en MERCADO PAGO',
      from: 'alertasynotificaciones@an.notificacionesbancolombia.com',
    })
    const result = await parseEmailToTransaction(email)
    expect(result.bank).toBe('Bancolombia')
  })

  test('detecta Lulo Bank por remitente', async () => {
    const email = makeEmail({
      body: 'Realizaste una compra en KRIKA COSMETIC por $65,500',
      from: 'notificaciones@lulobank.com',
    })
    const result = await parseEmailToTransaction(email)
    expect(result.bank).toBe('Lulo Bank')
  })

  test('detecta Nequi por contenido del body', async () => {
    const email = makeEmail({
      body: 'Nequi: Enviaste $50,000 a Pedro',
      from: 'no-reply@nequi.com.co',
    })
    const result = await parseEmailToTransaction(email)
    expect(result.bank).toBe('Nequi')
  })

  test('retorna Desconocido si no reconoce el banco', async () => {
    const email = makeEmail({ body: 'Tu pago de $10,000 fue procesado.' })
    const result = await parseEmailToTransaction(email)
    expect(result.bank).toBe('Desconocido')
  })
})

// ─────────────────────────────────────────────
// Inferencia de categoría
// ─────────────────────────────────────────────
describe('HU-4: parseEmailToTransaction — categoría inferida', () => {
  test('categoriza Uber como transporte (no comida)', async () => {
    const email = makeEmail({ body: 'Compraste COP15.000,00 en UBER RIDE BOGOTA' })
    const result = await parseEmailToTransaction(email)
    expect(result.category_id).toBe('transport')
  })

  test('categoriza Uber Eats como comida', async () => {
    const email = makeEmail({ body: 'Compraste COP35.000,00 en UBER EATS' })
    const result = await parseEmailToTransaction(email)
    expect(result.category_id).toBe('food')
  })

  test('categoriza Farmatodo como salud', async () => {
    const email = makeEmail({ body: 'Realizaste una compra en FARMATODO LA CLJA por $107,780' })
    const result = await parseEmailToTransaction(email)
    expect(result.category_id).toBe('health')
  })

  test('categoriza Éxito como alimentación', async () => {
    const email = makeEmail({ body: 'Compraste COP80.000,00 en ÉXITO CHAPINERO' })
    const result = await parseEmailToTransaction(email)
    expect(result.category_id).toBe('food')
  })

  test('categoriza EDS (gasolinera) como transporte', async () => {
    const email = makeEmail({ body: 'Compraste COP182.309,00 en EDS ARCANGEL SAN RAF' })
    const result = await parseEmailToTransaction(email)
    expect(result.category_id).toBe('transport')
  })

  test('categoriza Netflix como entretenimiento', async () => {
    const email = makeEmail({ body: 'Pago de $17,900 en NETFLIX' })
    const result = await parseEmailToTransaction(email)
    expect(result.category_id).toBe('entertainment')
  })

  test('usa other_expense si no reconoce el comercio', async () => {
    const email = makeEmail({ body: 'Compraste COP25.000,00 en COMERCIO XYZ DESCONOCIDO' })
    const result = await parseEmailToTransaction(email)
    expect(result.category_id).toBe('other_expense')
  })
})

// ─────────────────────────────────────────────
// Fecha
// ─────────────────────────────────────────────
describe('HU-4: parseEmailToTransaction — fecha', () => {
  test('parsea fecha "14 de marzo de 2026"', async () => {
    const email = makeEmail({
      body: 'Realizaste una compra en KRIKA por $65,500\nFecha 14 de marzo de 2026',
    })
    const result = await parseEmailToTransaction(email)
    expect(result.date).toBe('2026-03-14')
  })

  test('usa la fecha del email si no encuentra fecha en el cuerpo', async () => {
    const email = makeEmail({
      body: 'Compraste COP50.000,00 en TIENDA',
      date: 'Mon, 10 Mar 2026 08:30:00 -0500',
    })
    const result = await parseEmailToTransaction(email)
    expect(result.date).toBe('2026-03-10')
  })
})
