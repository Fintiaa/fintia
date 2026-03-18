export function getDateRange(period) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  if (period === 'week') {
    const day = now.getDay()
    const diff = day === 0 ? -6 : 1 - day
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff)
    return { from: monday.toISOString().split('T')[0], to: today }
  }
  if (period === 'year') {
    return { from: `${now.getFullYear()}-01-01`, to: today }
  }
  return {
    from: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
    to: today,
  }
}
