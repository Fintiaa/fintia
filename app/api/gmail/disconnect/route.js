import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { error } = await supabase
      .from('gmail_connections')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Error al desconectar' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Gmail disconnect error:', err)
    return NextResponse.json({ error: 'Error al desconectar' }, { status: 500 })
  }
}
