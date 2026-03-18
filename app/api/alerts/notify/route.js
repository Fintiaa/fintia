import { sendAlertEmail } from '@/lib/email/sendAlertEmail'

export async function POST(request) {
  try {
    const body = await request.json()
    const { toEmail, categoryName, percentage, amountSpent, budgetAmount, type } = body

    if (!toEmail || !categoryName) {
      return Response.json({ error: 'Missing fields' }, { status: 400 })
    }

    await sendAlertEmail({ toEmail, categoryName, percentage, amountSpent, budgetAmount, type })
    return Response.json({ ok: true })
  } catch (err) {
    console.error('Alert notify error:', err.message)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
