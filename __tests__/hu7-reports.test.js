/**
 * HU-7: Exportación de reportes
 * Pruebas unitarias para utilidades de reportes
 */

import {
  datePrefix,
  formatDateISO,
  escapeCsvField,
  computeTotals,
} from '@/lib/utils/reportUtils'

describe('HU-7: utils de reportes', () => {
  test('formatDateISO formatea fecha en YYYY-MM-DD', () => {
    const d = new Date('2026-03-17T10:00:00.000Z')
    expect(formatDateISO(d)).toBe('2026-03-17')
  })

  test('datePrefix devuelve fecha actual menos días correctly', () => {
    const today = new Date()
    const expected = today.toISOString().split('T')[0]
    expect(datePrefix(0)).toBe(expected)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    expect(datePrefix(1)).toBe(yesterday.toISOString().split('T')[0])
  })

  test('escapeCsvField escapa comillas y envuelve en comillas', () => {
    expect(escapeCsvField('hello')).toBe('"hello"')
    expect(escapeCsvField('te"st')).toBe('"te""st"')
    expect(escapeCsvField(null)).toBe('')
    expect(escapeCsvField(undefined)).toBe('')
  })

  test('computeTotals: presupuestos', () => {
    const budgets = [
      { amount: 100, spent: 60 },
      { amount: 200, spent: 150 },
    ]
    const result = computeTotals('budgets', budgets, [])
    expect(result.totalBudget).toBe(300)
    expect(result.totalSpent).toBe(210)
    expect(result.totalProgress).toBeCloseTo(70)
  })

  test('computeTotals: transacciones', () => {
    const transactions = [
      { type: 'income', amount: 100 },
      { type: 'expense', amount: 40 },
      { type: 'income', amount: 60 },
    ]
    const result = computeTotals('complete', [], transactions)
    expect(result.totalAmount).toBe(200)
    expect(result.income).toBe(160)
    expect(result.expenses).toBe(40)
  })
})
