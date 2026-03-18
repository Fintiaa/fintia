/**
 * HU-9: Insights financieros
 * Pruebas unitarias para generador de insights
 */

import { buildInsights } from '@/lib/utils/insights'

describe('HU-9: buildInsights', () => {
  test('genera insights para balance positivo y categoría top', () => {
    const transactions = [
      { type: 'income', amount: 1000 },
      { type: 'expense', amount: 250 },
    ]
    const stats = { income: 1000, expenses: 250, balance: 750 }
    const categoryData = { food: 200, transport: 50 }

    const insights = buildInsights(transactions, stats, categoryData, 'es-CO')
    expect(insights.length).toBeGreaterThan(0)
    expect(insights.some((item) => item.title.includes('Ahorro') || item.title.includes('Balance positivo'))).toBe(true)
    expect(insights.some((item) => item.title.includes('Mayor gasto por categoría'))).toBe(true)
  })

  test('genera insight de ahorro bajo', () => {
    const stats = { income: 1000, expenses: 950, balance: 50 }
    const categoryData = { food: 500, housing: 300 }

    const insights = buildInsights([], stats, categoryData, 'es-CO')
    expect(insights.some((item) => item.title === 'Ahorro bajo')).toBe(true)
  })

  test('genera insight de balance negativo', () => {
    const stats = { income: 1000, expenses: 1200, balance: -200 }
    const categoryData = { food: 700 }

    const insights = buildInsights([], stats, categoryData, 'es-CO')
    expect(insights.some((item) => item.title === 'Balance negativo')).toBe(true)
  })

  test('limita insights a máximo 5', () => {
    const stats = { income: 100000, expenses: 100, balance: 99900 }
    const categoryData = { food: 10, transport: 9, housing: 8, services: 7, entertainment: 6 }

    const insights = buildInsights([], stats, categoryData, 'es-CO')
    expect(insights.length).toBeLessThanOrEqual(5)
  })
})
