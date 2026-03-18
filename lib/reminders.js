export function checkInactivity(lastTransaction){

  if(!lastTransaction) return true

  const now = new Date()
  const last = new Date(lastTransaction)

  const diff = (now - last) / (1000 * 60 * 60 * 24)

  return diff >= 3
}