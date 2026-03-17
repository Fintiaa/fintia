import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUrl } from '@/lib/gmail/oauth'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_tier !== 'premium') {
      return NextResponse.json({ error: 'Requiere plan Premium' }, { status: 403 })
    }

    const state = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64url')
    const authUrl = getAuthUrl(state)

    return NextResponse.json({ url: authUrl })
  } catch (err) {
    console.error('Gmail auth error:', err)
    return NextResponse.json({ error: 'Error al iniciar conexión' }, { status: 500 })
  }
}
