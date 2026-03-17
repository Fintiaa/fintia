import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { createOAuth2Client } from '@/lib/gmail/oauth'
import { decrypt } from '@/lib/gmail/crypto'

export async function GET() {
  const steps = []

  try {
    // Step 1: Check auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado', steps }, { status: 401 })
    }
    steps.push({ step: '1. Auth', status: 'OK', detail: user.email })

    // Step 2: Check gmail connection in DB
    const { data: connection, error: connError } = await supabase
      .from('gmail_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (connError || !connection) {
      steps.push({ step: '2. Gmail Connection', status: 'FAIL', detail: connError?.message || 'No connection found' })
      return NextResponse.json({ steps })
    }
    steps.push({ step: '2. Gmail Connection', status: 'OK', detail: connection.gmail_email })

    // Step 3: Decrypt tokens
    let accessToken, refreshToken
    try {
      accessToken = decrypt(connection.access_token_encrypted)
      refreshToken = decrypt(connection.refresh_token_encrypted)
      steps.push({ step: '3. Token Decrypt', status: 'OK', detail: `access: ${accessToken.substring(0, 10)}..., refresh: ${refreshToken.substring(0, 10)}...` })
    } catch (decryptErr) {
      steps.push({ step: '3. Token Decrypt', status: 'FAIL', detail: decryptErr.message })
      return NextResponse.json({ steps })
    }

    // Step 4: Setup OAuth client
    const oauth2Client = createOAuth2Client()
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: connection.token_expiry ? new Date(connection.token_expiry).getTime() : undefined,
    })
    steps.push({ step: '4. OAuth Client', status: 'OK' })

    // Step 5: Test Gmail API access
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    let profileRes
    try {
      profileRes = await gmail.users.getProfile({ userId: 'me' })
      steps.push({ step: '5. Gmail API Access', status: 'OK', detail: `Email: ${profileRes.data.emailAddress}, Messages: ${profileRes.data.messagesTotal}` })
    } catch (apiErr) {
      steps.push({ step: '5. Gmail API Access', status: 'FAIL', detail: apiErr.message })
      return NextResponse.json({ steps })
    }

    // Step 6: Search with domain-based query (same as fetcher)
    const BANK_DOMAINS = ['bancolombia', 'notificacionesbancolombia', 'davivienda', 'nequi', 'daviplata', 'bbva.com.co', 'lulobank']
    const senderQuery = BANK_DOMAINS.map((d) => `from:${d}`).join(' OR ')
    const fullQuery = `(${senderQuery})`

    steps.push({ step: '6. Gmail Query', status: 'INFO', detail: fullQuery })

    const searchRes = await gmail.users.messages.list({
      userId: 'me',
      q: fullQuery,
      maxResults: 10,
    })

    const messageCount = searchRes.data.messages?.length || 0
    steps.push({ step: '7. Search Results', status: messageCount > 0 ? 'OK' : 'EMPTY', detail: `${messageCount} emails found` })

    // Step 7: Show first few email subjects
    if (searchRes.data.messages) {
      const previews = await Promise.all(
        searchRes.data.messages.slice(0, 5).map(async (msg) => {
          const full = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'metadata',
            metadataHeaders: ['Subject', 'From', 'Date'],
          })
          const headers = full.data.payload.headers
          return {
            id: msg.id,
            subject: headers.find((h) => h.name === 'Subject')?.value || '(no subject)',
            from: headers.find((h) => h.name === 'From')?.value || '(unknown)',
            date: headers.find((h) => h.name === 'Date')?.value || '',
            snippet: full.data.snippet?.substring(0, 150),
          }
        })
      )
      steps.push({ step: '8. Email Previews', status: 'OK', detail: previews })
    }

    // Step 8: Also try a broader search just for "Bancolombia"
    const broadRes = await gmail.users.messages.list({
      userId: 'me',
      q: 'Bancolombia',
      maxResults: 5,
    })
    const broadCount = broadRes.data.messages?.length || 0
    steps.push({ step: '9. Broad Search (Bancolombia)', status: broadCount > 0 ? 'OK' : 'EMPTY', detail: `${broadCount} emails found` })

    if (broadRes.data.messages) {
      const broadPreviews = await Promise.all(
        broadRes.data.messages.slice(0, 3).map(async (msg) => {
          const full = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'metadata',
            metadataHeaders: ['Subject', 'From', 'Date'],
          })
          const headers = full.data.payload.headers
          return {
            id: msg.id,
            subject: headers.find((h) => h.name === 'Subject')?.value || '(no subject)',
            from: headers.find((h) => h.name === 'From')?.value || '(unknown)',
            date: headers.find((h) => h.name === 'Date')?.value || '',
            snippet: full.data.snippet?.substring(0, 150),
          }
        })
      )
      steps.push({ step: '10. Broad Previews', status: 'OK', detail: broadPreviews })
    }

    return NextResponse.json({ steps })
  } catch (err) {
    steps.push({ step: 'UNEXPECTED ERROR', status: 'FAIL', detail: err.message })
    return NextResponse.json({ steps }, { status: 500 })
  }
}
