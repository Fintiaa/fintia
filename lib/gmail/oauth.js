import { google } from 'googleapis'

export function createOAuth2Client() {
  const clientId = process.env.GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const redirectUri = process.env.GMAIL_REDIRECT_URI

  console.log('[OAuth] Client ID:', clientId ? `${clientId.substring(0, 15)}...` : 'MISSING')
  console.log('[OAuth] Client Secret:', clientSecret ? 'SET' : 'MISSING')
  console.log('[OAuth] Redirect URI:', redirectUri || 'MISSING')

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

export function getAuthUrl(state) {
  const oauth2Client = createOAuth2Client()
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    state,
  })
}
