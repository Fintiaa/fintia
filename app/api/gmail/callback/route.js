import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { createOAuth2Client } from '@/lib/gmail/oauth'
import { encrypt } from '@/lib/gmail/crypto'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const baseUrl = new URL(request.url).origin

  if (error) {
    return NextResponse.redirect(`${baseUrl}/dashboard/sync?error=access_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/dashboard/sync?error=missing_params`)
  }

  try {
    const { userId } = JSON.parse(Buffer.from(state, 'base64url').toString())

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return NextResponse.redirect(`${baseUrl}/dashboard/sync?error=auth_mismatch`)
    }

    // Exchange code for tokens
    const oauth2Client = createOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)

    // Get Gmail email address
    oauth2Client.setCredentials(tokens)
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
    const profileRes = await gmail.users.getProfile({ userId: 'me' })
    const gmailEmail = profileRes.data.emailAddress

    // Store encrypted tokens
    const { error: upsertError } = await supabase
      .from('gmail_connections')
      .upsert({
        user_id: userId,
        gmail_email: gmailEmail,
        access_token_encrypted: encrypt(tokens.access_token),
        refresh_token_encrypted: encrypt(tokens.refresh_token),
        token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        is_active: true,
        sync_error: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (upsertError) {
      console.error('Error storing gmail connection:', upsertError)
      return NextResponse.redirect(`${baseUrl}/dashboard/sync?error=storage_error`)
    }

    return NextResponse.redirect(`${baseUrl}/dashboard/sync?success=connected`)
  } catch (err) {
    console.error('Gmail callback error:', err)
    return NextResponse.redirect(`${baseUrl}/dashboard/sync?error=token_exchange`)
  }
}
