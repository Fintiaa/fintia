import { getCategoryById } from '@/lib/data/categories'

function formatCurrency(value, locale) {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function buildInsights(transactions, stats, categoryData, locale) {
  const insights = []
  const totalExpenses = stats.expenses
  const totalIncome = stats.income
  const balance = stats.balance

  if (totalIncome > 0) {
    const savingRate = Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
    insights.push({
      title: 'Tasa de ahorro',
      detail: `Tu tasa de ahorro actual es de ${savingRate}%.`,
    })
    if (savingRate < 10) {
      insights.push({
        title: 'Ahorro bajo',
        detail: 'Tu ahorro es menor al 10%. Intenta eliminar un gasto recurrente no esencial.',
      })
    } else if (savingRate >= 30) {
      insights.push({
        title: 'Buen progreso',
        detail: 'Excelente, estás ahorrando más del 30%.',
      })
    }
  }

  const categoryEntries = Object.entries(categoryData).sort((a, b) => b[1] - a[1])
  if (categoryEntries.length > 0) {
    const [topCategoryId, topAmount] = categoryEntries[0]
    const topCategory = getCategoryById(topCategoryId)
    insights.push({
      title: 'Mayor gasto por categoría',
      detail: `Gastaste ${formatCurrency(topAmount, locale)} en ${topCategory?.name || topCategoryId}.`,
    })
    if (categoryEntries.length > 1) {
      const [secondId, secondAmount] = categoryEntries[1]
      const secondCategory = getCategoryById(secondId)
      insights.push({
        title: 'Segunda categoría con más peso',
        detail: `También estás gastando ${formatCurrency(secondAmount, locale)} en ${secondCategory?.name || secondId}.`,
      })
    }
  }

  if (balance > 0) {
    insights.push({ title: 'Balance positivo', detail: `Tu balance es ${formatCurrency(balance, locale)}.` })
  } else if (balance < 0) {
    insights.push({ title: 'Balance negativo', detail: `Tu balance es ${formatCurrency(balance, locale)}.` })
  }

  return insights.slice(0, 5)
}
