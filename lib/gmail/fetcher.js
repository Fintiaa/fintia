import { google } from 'googleapis'
import { createOAuth2Client } from './oauth'
import { decrypt } from './crypto'

const BANK_SENDERS = [
  // Bancolombia
  'alertasynotificaciones@bancolombia.com.co',
  'notificaciones@bancolombia.com.co',
  // Davivienda
  'notificaciones@davivienda.com',
  'alertas@davivienda.com',
  // BBVA Colombia
  'notificaciones@bbva.com.co',
  'alertas@bbva.com.co',
  // Banco de Bogotá
  'notificaciones@bancodebogota.com.co',
  'alertas@bancodebogota.com.co',
  // Nequi
  'notificaciones@nequi.com.co',
  'nequi@nequi.com.co',
  // Scotiabank Colpatria
  'notificaciones@colpatria.com',
  'alertas@scotiabankcolpatria.com',
  // Banco Popular
  'notificaciones@bancopopular.com.co',
  // Banco de Occidente
  'notificaciones@bancodeoccidente.com.co',
]

export async function fetchBankEmails(connection, sinceDate = null) {
  const oauth2Client = createOAuth2Client()

  const accessToken = decrypt(connection.access_token_encrypted)
  const refreshToken = decrypt(connection.refresh_token_encrypted)

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: connection.token_expiry ? new Date(connection.token_expiry).getTime() : undefined,
  })

  // Capture refreshed tokens
  let newTokens = null
  oauth2Client.on('tokens', (tokens) => {
    newTokens = tokens
  })

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

  const senderQuery = BANK_SENDERS.map((s) => `from:${s}`).join(' OR ')
  // Also search by bank keywords in case sender address varies
  const bankKeywords = ['Bancolombia', 'Davivienda', 'BBVA', 'Nequi', 'Daviplata', 'Banco de Bogota', 'Colpatria']
  const keywordQuery = bankKeywords.map((k) => `subject:${k}`).join(' OR ')
  let query = `(${senderQuery} OR ${keywordQuery})`
  if (sinceDate) {
    query += ` after:${sinceDate}`
  }

  const res = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 50,
  })

  if (!res.data.messages) {
    return { emails: [], newTokens }
  }

  const emails = await Promise.all(
    res.data.messages.map(async (msg) => {
      const full = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full',
      })
      return {
        id: msg.id,
        headers: full.data.payload.headers,
        snippet: full.data.snippet,
        body: extractBody(full.data.payload),
        internalDate: full.data.internalDate,
      }
    })
  )

  return { emails, newTokens }
}

function extractBody(payload) {
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64url').toString('utf8')
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64url').toString('utf8')
      }
    }
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64url').toString('utf8')
      }
    }
  }
  return ''
}
