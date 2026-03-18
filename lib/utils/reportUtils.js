export const formatDateISO = (date) => date.toISOString().split('T')[0]

export const datePrefix = (amountDays = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - amountDays)
  return formatDateISO(d)
}

export const escapeCsvField = (value) => {
  if (value === null || value === undefined) return ''
  const str = String(value)
  return `"${str.replace(/"/g, '""')}"`
}

export const computeTotals = (reportType, budgets = [], transactions = []) => {
  if (reportType === 'budgets') {
    const totalBudget = budgets.reduce((acc, b) => acc + Number(b.amount || 0), 0)
    const totalSpent = budgets.reduce((acc, b) => acc + Number(b.spent || 0), 0)
    return { totalBudget, totalSpent, totalProgress: totalBudget === 0 ? 0 : (totalSpent / totalBudget) * 100 }
  }
  const totalAmount = transactions.reduce((acc, tx) => acc + Number(tx.amount || 0), 0)
  const income = transactions.filter((tx) => tx.type === 'income').reduce((acc, tx) => acc + Number(tx.amount || 0), 0)
  const expenses = transactions.filter((tx) => tx.type === 'expense').reduce((acc, tx) => acc + Number(tx.amount || 0), 0)
  return { totalAmount, income, expenses }
}
