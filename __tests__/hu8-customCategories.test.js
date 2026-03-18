/**
 * HU-8: Categorías personalizadas
 * Pruebas unitarias para APIs de categoría (localStorage)
 */

import {
  CATEGORIES,
  getAllCategories,
  getCustomCategories,
  addCustomCategory,
  updateCustomCategory,
  deleteCustomCategory,
  getCategoryById,
  getCategoriesByType,
} from '@/lib/data/categories'

beforeEach(() => {
  localStorage.clear()
})

describe('HU-8: categorías base', () => {
  test('CATEGORIES contiene ingresos y gastos', () => {
    expect(CATEGORIES.filter((c) => c.type === 'income').length).toBeGreaterThan(0)
    expect(CATEGORIES.filter((c) => c.type === 'expense').length).toBeGreaterThan(0)
  })

  test('getCategoriesByType funciona correctamente', () => {
    const incomes = getCategoriesByType('income')
    const expenses = getCategoriesByType('expense')
    expect(incomes.every((c) => c.type === 'income')).toBe(true)
    expect(expenses.every((c) => c.type === 'expense')).toBe(true)
  })
})

describe('HU-8: CRUD de categorías personalizadas', () => {
  test('addCustomCategory añade categoría personalizada', () => {
    const newCat = addCustomCategory({ name: 'Mascotas', type: 'expense', icon: '🐶', color: '#ff00aa' })
    expect(newCat).toMatchObject({ name: 'Mascotas', type: 'expense', icon: '🐶', color: '#ff00aa' })
    expect(getCustomCategories()).toHaveLength(1)
    expect(getAllCategories().some((c) => c.id === newCat.id)).toBe(true)
  })

  test('updateCustomCategory actualiza nombre y color', () => {
    const newCat = addCustomCategory({ name: 'Mascotas', type: 'expense', icon: '🐶', color: '#ff00aa' })
    const updated = updateCustomCategory(newCat.id, { name: 'Pets', color: '#00aaff' })
    expect(updated.name).toBe('Pets')
    expect(updated.color).toBe('#00aaff')
    expect(getCustomCategories()[0].name).toBe('Pets')
  })

  test('deleteCustomCategory elimina correctamente', () => {
    const newCat = addCustomCategory({ name: 'Cine', type: 'expense', icon: '🎬', color: '#aa00ff' })
    const afterDelete = deleteCustomCategory(newCat.id)
    expect(afterDelete.some((c) => c.id === newCat.id)).toBe(false)
    expect(getCustomCategories()).toHaveLength(0)
  })

  test('no permite categoría duplicada', () => {
    addCustomCategory({ name: 'Cine', type: 'expense', icon: '🎬', color: '#aa00ff' })
    expect(() => addCustomCategory({ name: 'Cine', type: 'expense', icon: '🎬', color: '#aa00ff' })).toThrow()
  })

  test('limite de 20 categorías custom', () => {
    for (let i = 0; i < 20; i++) {
      addCustomCategory({ name: `X${i}`, type: 'expense', icon: '⭐', color: '#abcdef' })
    }
    expect(() => addCustomCategory({ name: 'X20', type: 'expense', icon: '⭐', color: '#abcdef' })).toThrow()
  })
})
