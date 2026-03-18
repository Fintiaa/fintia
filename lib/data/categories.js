export const CATEGORIES = [
  // Ingresos — tonos de la paleta Fintia
  { id: 'salary',        name: 'Salario',         type: 'income',  icon: '💰', color: '#B9D8C2', isDefault: true },
  { id: 'freelance',     name: 'Freelance',       type: 'income',  icon: '💼', color: '#9AC2C9', isDefault: true },
  { id: 'investment',    name: 'Inversiones',     type: 'income',  icon: '📈', color: '#8AA1B1', isDefault: true },
  { id: 'other_income',  name: 'Otros ingresos',  type: 'income',  icon: '✨', color: '#4A5043', isDefault: true },
  // Egresos — variaciones de la paleta + acento
  { id: 'food',          name: 'Alimentación',    type: 'expense', icon: '🛒', color: '#FFCB47', isDefault: true },
  { id: 'transport',     name: 'Transporte',      type: 'expense', icon: '🚗', color: '#9AC2C9', isDefault: true },
  { id: 'housing',       name: 'Vivienda',        type: 'expense', icon: '🏠', color: '#4A5043', isDefault: true },
  { id: 'services',      name: 'Servicios',       type: 'expense', icon: '⚡', color: '#8AA1B1', isDefault: true },
  { id: 'entertainment', name: 'Entretenimiento', type: 'expense', icon: '🎬', color: '#B9D8C2', isDefault: true },
  { id: 'health',        name: 'Salud',           type: 'expense', icon: '🏥', color: '#7ab98d', isDefault: true },
  { id: 'education',     name: 'Educación',       type: 'expense', icon: '📚', color: '#d4e8da', isDefault: true },
  { id: 'other_expense', name: 'Otros gastos',    type: 'expense', icon: '📦', color: '#c8d8c0', isDefault: true },
]

const CUSTOM_KEY = 'fintia_custom_categories'

const isBrowser = () => typeof window !== 'undefined'

export const getCustomCategories = () => {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(CUSTOM_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const saveCustomCategories = (categories) => {
  if (!isBrowser()) return
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(categories))
}

export const getAllCategories = () => {
  return [...CATEGORIES, ...getCustomCategories()]
}

export const getCategoryById = (id) => {
  return getAllCategories().find((c) => c.id === id)
}

export const getCategoriesByType = (type) => {
  return getAllCategories().filter((c) => c.type === type)
}

const normalizeId = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')

export const addCustomCategory = (category) => {
  const existing = getAllCategories().find((c) => c.name.toLowerCase() === category.name.toLowerCase())
  if (existing) {
    throw new Error('Ya existe una categoría con este nombre.')
  }

  const custom = getCustomCategories()
  if (custom.length >= 20) {
    throw new Error('Has alcanzado el máximo de categorías personalizadas (20).')
  }

  const newCategory = {
    ...category,
    id: normalizeId(category.name),
    isDefault: false,
  }

  const result = [...custom, newCategory]
  saveCustomCategories(result)
  return newCategory
}

export const updateCustomCategory = (categoryId, updates) => {
  const custom = getCustomCategories()
  const idx = custom.findIndex((c) => c.id === categoryId)
  if (idx === -1) throw new Error('Categoría no encontrada.')

  const newName = updates.name?.trim()
  if (newName) {
    const duplicate = getAllCategories().find((c) => c.name.toLowerCase() === newName.toLowerCase() && c.id !== categoryId)
    if (duplicate) {
      throw new Error('Ya existe una categoría con este nombre.')
    }
  }

  const updated = {
    ...custom[idx],
    ...updates,
    id: newName ? normalizeId(newName) : custom[idx].id,
  }

  const result = [...custom]
  result[idx] = updated
  saveCustomCategories(result)
  return updated
}

export const deleteCustomCategory = (categoryId) => {
  const custom = getCustomCategories()
  const filtered = custom.filter((c) => c.id !== categoryId)
  saveCustomCategories(filtered)
  return filtered
}
