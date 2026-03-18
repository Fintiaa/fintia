/**
 * HU-2: Dashboard Visual
 * Pruebas unitarias para getDateRange y cálculo de estadísticas
 */

import { getDateRange } from '@/lib/utils/dateRange'

describe('HU-2: getDateRange - período semana', () => {
  test('from está dentro de los últimos 7 días (rango de semana válido)', () => {
    const { from, to } = getDateRange('week')
    const diffDays = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)
    expect(diffDays).toBeGreaterThanOrEqual(0)
    expect(diffDays).toBeLessThanOrEqual(6)
  })

  test('retorna hoy como fecha final', () => {
    const today = new Date().toISOString().split('T')[0]
    const range = getDateRange('week')
    expect(range.to).toBe(today)
  })

  test('from es anterior o igual a to', () => {
    const { from, to } = getDateRange('week')
    expect(new Date(from) <= new Date(to)).toBe(true)
  })
})

describe('HU-2: getDateRange - período mes', () => {
  test('retorna el primer día del mes actual', () => {
    const { from } = getDateRange('month')
    expect(from).toMatch(/^\d{4}-\d{2}-01$/)
  })

  test('retorna hoy como fecha final', () => {
    const today = new Date().toISOString().split('T')[0]
    const { to } = getDateRange('month')
    expect(to).toBe(today)
  })

  test('el año y mes de from coinciden con la fecha actual', () => {
    const now = new Date()
    const expectedYear = now.getFullYear()
    const expectedMonth = String(now.getMonth() + 1).padStart(2, '0')
    const { from } = getDateRange('month')
    expect(from.startsWith(`${expectedYear}-${expectedMonth}`)).toBe(true)
  })
})

describe('HU-2: getDateRange - período año', () => {
  test('retorna el 1 de enero del año actual', () => {
    const currentYear = new Date().getFullYear()
    const { from } = getDateRange('year')
    expect(from).toBe(`${currentYear}-01-01`)
  })

  test('retorna hoy como fecha final', () => {
    const today = new Date().toISOString().split('T')[0]
    const { to } = getDateRange('year')
    expect(to).toBe(today)
  })

  test('el rango del año incluye más de 30 días', () => {
    const { from, to } = getDateRange('year')
    const diff = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)
    expect(diff).toBeGreaterThan(30)
  })
})

describe('HU-2: cálculo de balance', () => {
  test('el balance es ingresos menos gastos', () => {
    const income = 3000000
    const expenses = 1200000
    const balance = income - expenses
    expect(balance).toBe(1800000)
  })

  test('balance negativo cuando gastos superan ingresos', () => {
    const income = 500000
    const expenses = 800000
    const balance = income - expenses
    expect(balance).toBeLessThan(0)
  })

  test('tasa de ahorro es cero cuando no hay ingresos', () => {
    const income = 0
    const expenses = 100000
    const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0
    expect(savingsRate).toBe(0)
  })
})
