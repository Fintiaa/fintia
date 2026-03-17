import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: connection } = await supabase
      .from('gmail_connections')
      .select('id, gmail_email, is_active, last_sync_at, sync_error, created_at')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({ connection: connection || null })
  } catch (err) {
    console.error('Gmail status error:', err)
    return NextResponse.json({ connection: null })
  }
}
