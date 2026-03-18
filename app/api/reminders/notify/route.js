import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return Response.json({ ok: false, error: 'No API key' }, { status: 500 })
    }

    // Get user session from Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: request.headers.get('Authorization') || '' } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const toEmail = user.email
    const name = user.user_metadata?.full_name?.split(' ')[0] || toEmail.split('@')[0]

    const html = `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f7f8f7;">
        <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb;">
          <img src="https://fintia-ten.vercel.app/images/LogoFintia.png" width="40" height="40" style="border-radius: 8px; margin-bottom: 16px;" />
          <h1 style="font-size: 20px; color: #2a2e26; margin: 0 0 8px;">🔔 Tienes 3 días sin registrar movimientos</h1>
          <p style="color: #6b7280; margin: 0 0 24px; font-size: 15px;">
            Hola ${name}, llevas varios días sin registrar gastos o ingresos en Fintia.
            Mantener tu historial al día te ayuda a entender mejor tus finanzas 💚
          </p>
          <a href="https://fintia-ten.vercel.app/dashboard"
             style="display: block; text-align: center; background: #7ab98d; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Registrar un movimiento
          </a>
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin: 20px 0 0;">
            Puedes desactivar estos recordatorios en <a href="https://fintia-ten.vercel.app/dashboard/settings" style="color: #7ab98d;">Configuración</a>.
          </p>
        </div>
      </div>
    `

    await resend.emails.send({
      from: 'Fintia <onboarding@resend.dev>',
      to: toEmail,
      subject: '🔔 No has registrado gastos en los últimos 3 días',
      html,
    })

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Reminder email error:', err.message)
    return Response.json({ ok: false, error: err.message }, { status: 500 })
  }
}
