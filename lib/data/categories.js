export const CATEGORIES = [
  // Ingresos — tonos de la paleta Fintia
  { id: 'salary',        name: 'Salario',         type: 'income',  icon: '💰', color: '#B9D8C2' },
  { id: 'freelance',     name: 'Freelance',        type: 'income',  icon: '💼', color: '#9AC2C9' },
  { id: 'investment',    name: 'Inversiones',      type: 'income',  icon: '📈', color: '#8AA1B1' },
  { id: 'other_income',  name: 'Otros ingresos',   type: 'income',  icon: '✨', color: '#4A5043' },
  // Egresos — variaciones de la paleta + acento
  { id: 'food',          name: 'Alimentación',     type: 'expense', icon: '🛒', color: '#FFCB47' },
  { id: 'transport',     name: 'Transporte',       type: 'expense', icon: '🚗', color: '#9AC2C9' },
  { id: 'housing',       name: 'Vivienda',         type: 'expense', icon: '🏠', color: '#4A5043' },
  { id: 'services',      name: 'Servicios',        type: 'expense', icon: '⚡', color: '#8AA1B1' },
  { id: 'entertainment', name: 'Entretenimiento',  type: 'expense', icon: '🎬', color: '#B9D8C2' },
  { id: 'health',        name: 'Salud',            type: 'expense', icon: '🏥', color: '#7ab98d' },
  { id: 'education',     name: 'Educación',        type: 'expense', icon: '📚', color: '#d4e8da' },
  { id: 'other_expense', name: 'Otros gastos',     type: 'expense', icon: '📦', color: '#c8d8c0' },
]

export const getCategoryById = (id) => CATEGORIES.find((c) => c.id === id)

export const getCategoriesByType = (type) => CATEGORIES.filter((c) => c.type === type)
