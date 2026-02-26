export const CATEGORIES = [
  // Ingresos
  { id: 'salary',        name: 'Salario',         type: 'income',  icon: '💰', color: '#22c55e' },
  { id: 'freelance',     name: 'Freelance',        type: 'income',  icon: '💼', color: '#10b981' },
  { id: 'investment',    name: 'Inversiones',      type: 'income',  icon: '📈', color: '#3b82f6' },
  { id: 'other_income',  name: 'Otros ingresos',   type: 'income',  icon: '✨', color: '#6366f1' },
  // Egresos
  { id: 'food',          name: 'Alimentación',     type: 'expense', icon: '🛒', color: '#ef4444' },
  { id: 'transport',     name: 'Transporte',       type: 'expense', icon: '🚗', color: '#f97316' },
  { id: 'housing',       name: 'Vivienda',         type: 'expense', icon: '🏠', color: '#8b5cf6' },
  { id: 'services',      name: 'Servicios',        type: 'expense', icon: '⚡', color: '#f59e0b' },
  { id: 'entertainment', name: 'Entretenimiento',  type: 'expense', icon: '🎬', color: '#ec4899' },
  { id: 'health',        name: 'Salud',            type: 'expense', icon: '🏥', color: '#14b8a6' },
  { id: 'education',     name: 'Educación',        type: 'expense', icon: '📚', color: '#6366f1' },
  { id: 'other_expense', name: 'Otros gastos',     type: 'expense', icon: '📦', color: '#9ca3af' },
]

export const getCategoryById = (id) => CATEGORIES.find((c) => c.id === id)

export const getCategoriesByType = (type) => CATEGORIES.filter((c) => c.type === type)
