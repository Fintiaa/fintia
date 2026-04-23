import { createClient } from '@/lib/supabase/client'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

async function getAuthToken() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}

async function apiFetch(path, options = {}) {
  const token = await getAuthToken()
  if (!token) throw new Error('No autenticado')

  const res = await fetch(`${BACKEND_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `Error ${res.status}`)
  }

  return res.json()
}

export const api = {
  get: (path, params) => {
    const url = params
      ? `${path}?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '')).toString()}`
      : path
    return apiFetch(url)
  },
  post: (path, body) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => apiFetch(path, { method: 'DELETE' }),
}
