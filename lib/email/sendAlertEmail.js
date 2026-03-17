import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendAlertEmail({ toEmail, categoryName, percentage, amountSpent, budgetAmount, type }) {
  if (!process.env.RESEND_API_KEY) return

  const isExceeded = type === 'exceeded'
  const emoji = isExceeded ? '🚨' : '⚠️'
  const subject = isExceeded
    ? `${emoji} Excediste tu presupuesto de ${categoryName}`
    : `${emoji} Estás cerca del límite en ${categoryName}`

  const fmt = (n) => `$${Number(n).toLocaleString('es-CO')}`

  const html = `
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f7f8f7;">
      <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb;">
        <img src="https://fintia-ten.vercel.app/images/LogoFintia.png" width="40" height="40" style="border-radius: 8px; margin-bottom: 16px;" />
        <h1 style="font-size: 20px; color: #2a2e26; margin: 0 0 8px;">${subject}</h1>
        <p style="color: #6b7280; margin: 0 0 24px; font-size: 15px;">
          ${isExceeded
            ? `Has superado el presupuesto de <strong>${categoryName}</strong>.`
            : `Te estás acercando al límite de tu presupuesto de <strong>${categoryName}</strong>.`}
        </p>

        <div style="background: #f7f8f7; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #6b7280; font-size: 14px;">Gastado</span>
            <span style="font-weight: 700; color: ${isExceeded ? '#ef4444' : '#f59e0b'};">${fmt(amountSpent)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #6b7280; font-size: 14px;">Presupuesto</span>
            <span style="font-weight: 600; color: #2a2e26;">${fmt(budgetAmount)}</span>
          </div>
          <div style="background: #e5e7eb; border-radius: 99px; height: 8px;">
            <div style="background: ${isExceeded ? '#ef4444' : '#f59e0b'}; width: ${Math.min(percentage, 100)}%; height: 8px; border-radius: 99px;"></div>
          </div>
          <p style="text-align: right; font-size: 13px; color: ${isExceeded ? '#ef4444' : '#f59e0b'}; margin: 6px 0 0; font-weight: 600;">${Math.round(percentage)}%</p>
        </div>

        <a href="https://fintia-ten.vercel.app/dashboard/budgets"
           style="display: block; text-align: center; background: #7ab98d; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px;">
          Ver mis presupuestos
        </a>

        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin: 20px 0 0;">
          Fintia · Gestión de finanzas personales
        </p>
      </div>
    </div>
  `

  try {
    await resend.emails.send({
      from: 'Fintia <alertas@fintia-ten.vercel.app>',
      to: toEmail,
      subject,
      html,
    })
  } catch (err) {
    // Don't throw — email failure shouldn't break transaction flow
    console.error('Error sending alert email:', err.message)
  }
}
