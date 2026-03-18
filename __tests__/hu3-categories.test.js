/**
 * HU-3: Categorización de Transacciones
 * Pruebas unitarias para el sistema de categorías
 */

import { CATEGORIES, getCategoryById, getCategoriesByType } from '@/lib/data/categories'

describe('HU-3: CATEGORIES - estructura de datos', () => {
  test('existe al menos una categoría de ingreso y una de gasto', () => {
    const incomes = CATEGORIES.filter((c) => c.type === 'income')
    const expenses = CATEGORIES.filter((c) => c.type === 'expense')
    expect(incomes.length).toBeGreaterThan(0)
    expect(expenses.length).toBeGreaterThan(0)
  })

  test('cada categoría tiene los campos obligatorios: id, name, type, icon, color', () => {
    CATEGORIES.forEach((cat) => {
      expect(cat).toHaveProperty('id')
      expect(cat).toHaveProperty('name')
      expect(cat).toHaveProperty('type')
      expect(cat).toHaveProperty('icon')
      expect(cat).toHaveProperty('color')
    })
  })

  test('no hay ids duplicados entre categorías', () => {
    const ids = CATEGORIES.map((c) => c.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  test('el campo type solo tiene valores "income" o "expense"', () => {
    CATEGORIES.forEach((cat) => {
      expect(['income', 'expense']).toContain(cat.type)
    })
  })
})

describe('HU-3: getCategoryById', () => {
  test('retorna la categoría correcta por id', () => {
    const cat = getCategoryById('food')
    expect(cat).toBeDefined()
    expect(cat.id).toBe('food')
    expect(cat.name).toBe('Alimentación')
  })

  test('retorna undefined para un id inexistente', () => {
    const cat = getCategoryById('categoria-inexistente')
    expect(cat).toBeUndefined()
  })

  test('retorna la categoría salario correctamente', () => {
    const cat = getCategoryById('salary')
    expect(cat).toBeDefined()
    expect(cat.type).toBe('income')
  })

  test('retorna undefined si se pasa null o undefined', () => {
    expect(getCategoryById(null)).toBeUndefined()
    expect(getCategoryById(undefined)).toBeUndefined()
  })
})

describe('HU-3: getCategoriesByType', () => {
  test('retorna solo categorías de tipo income', () => {
    const incomes = getCategoriesByType('income')
    expect(incomes.length).toBeGreaterThan(0)
    incomes.forEach((c) => expect(c.type).toBe('income'))
  })

  test('retorna solo categorías de tipo expense', () => {
    const expenses = getCategoriesByType('expense')
    expect(expenses.length).toBeGreaterThan(0)
    expenses.forEach((c) => expect(c.type).toBe('expense'))
  })

  test('la suma de ingresos y gastos es igual al total de categorías', () => {
    const incomes = getCategoriesByType('income')
    const expenses = getCategoriesByType('expense')
    expect(incomes.length + expenses.length).toBe(CATEGORIES.length)
  })

  test('retorna arreglo vacío para tipo desconocido', () => {
    const result = getCategoriesByType('unknown')
    expect(result).toHaveLength(0)
  })

  test('las categorías de gasto incluyen food y transport', () => {
    const expenses = getCategoriesByType('expense')
    const ids = expenses.map((c) => c.id)
    expect(ids).toContain('food')
    expect(ids).toContain('transport')
  })
})
