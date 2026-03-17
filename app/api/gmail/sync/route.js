import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchBankEmails } from '@/lib/gmail/fetcher'
import { parseEmailToTransaction } from '@/lib/gmail/parser'
import { encrypt } from '@/lib/gmail/crypto'

export async function POST(request) {
  try {
    const url = new URL(request.url)
    const forceFullSync = url.searchParams.get('full') === 'true'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: connection } = await supabase
      .from('gmail_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!connection) {
      return NextResponse.json({ error: 'Gmail no conectado' }, { status: 404 })
    }

    // Check if this is the first real sync (no synced emails yet)
    const { count: syncedCount } = await supabase
      .from('synced_emails')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // First sync or forced full sync: look back 90 days to get history
    const isFirstSync = (syncedCount || 0) < 5 || forceFullSync
    const sinceDate = isFirstSync
      ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0].replace(/-/g, '/')
      : connection.last_sync_at
        ? new Date(connection.last_sync_at).toISOString().split('T')[0].replace(/-/g, '/')
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0].replace(/-/g, '/')

    console.log('[Sync] forceFullSync:', forceFullSync, 'syncedCount:', syncedCount, 'isFirstSync:', isFirstSync, 'sinceDate:', sinceDate)

    const { emails, newTokens } = await fetchBankEmails(connection, sinceDate, isFirstSync ? 200 : 50)

    console.log('[Sync] Fetched', emails.length, 'emails from Gmail')

    // Get already-synced IDs for deduplication
    const { data: existingSynced } = await supabase
      .from('synced_emails')
      .select('gmail_message_id')
      .eq('user_id', user.id)

    const existingIds = new Set((existingSynced || []).map((e) => e.gmail_message_id))
    const newEmails = emails.filter((e) => !existingIds.has(e.id))

    let created = 0
    let skipped = 0
    let errors = 0

    for (const email of newEmails) {
      try {
        const parsed = await parseEmailToTransaction(email)
        const subject = email.headers.find((h) => h.name === 'Subject')?.value || ''
        const from = email.headers.find((h) => h.name === 'From')?.value || ''

        if (!parsed.is_transaction) {
          await supabase.from('synced_emails').insert({
            user_id: user.id,
            gmail_message_id: email.id,
            subject,
            sender: from,
            received_at: new Date(parseInt(email.internalDate)).toISOString(),
            raw_snippet: email.snippet?.substring(0, 200),
            parsed_data: parsed,
            status: 'skipped',
          })
          skipped++
          continue
        }

        const { data: txn, error: txnError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: parsed.type,
            amount: parsed.amount,
            category_id: parsed.category_id,
            description: parsed.description,
            date: parsed.date,
            source: 'email',
            metadata: {
              gmail_message_id: email.id,
              bank: parsed.bank,
              confidence: parsed.confidence,
              original_subject: subject,
            },
          })
          .select()
          .single()

        if (txnError) throw txnError

        await supabase.from('synced_emails').insert({
          user_id: user.id,
          gmail_message_id: email.id,
          subject,
          sender: from,
          received_at: new Date(parseInt(email.internalDate)).toISOString(),
          raw_snippet: email.snippet?.substring(0, 200),
          parsed_data: parsed,
          transaction_id: txn.id,
          status: 'created',
        })
        created++
      } catch (emailErr) {
        console.error('Error processing email:', email.id, emailErr)
        await supabase.from('synced_emails').insert({
          user_id: user.id,
          gmail_message_id: email.id,
          subject: email.headers.find((h) => h.name === 'Subject')?.value || '',
          sender: email.headers.find((h) => h.name === 'From')?.value || '',
          status: 'error',
          error_message: emailErr.message,
        })
        errors++
      }
    }

    // Update last_sync_at and refreshed tokens
    const updates = {
      last_sync_at: new Date().toISOString(),
      sync_error: null,
      updated_at: new Date().toISOString(),
    }

    if (newTokens?.access_token) {
      updates.access_token_encrypted = encrypt(newTokens.access_token)
    }
    if (newTokens?.expiry_date) {
      updates.token_expiry = new Date(newTokens.expiry_date).toISOString()
    }

    await supabase
      .from('gmail_connections')
      .update(updates)
      .eq('id', connection.id)

    return NextResponse.json({
      success: true,
      summary: { total: newEmails.length, created, skipped, errors },
      debug: { isFirstSync, sinceDate, emailsFetched: emails.length, alreadySynced: existingIds.size },
    })
  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.json(
      { error: 'Error durante sincronización', details: err.message },
      { status: 500 }
    )
  }
}
