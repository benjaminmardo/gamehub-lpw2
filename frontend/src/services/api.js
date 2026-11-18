const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')
export const TOKEN_KEY = 'gamehub_token'
export const USER_KEY = 'gamehub_usuario'
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new Event('gamehub:unauthorized'))
}
export async function api(path, options = {}) {
  const headers = new Headers(options.headers)
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  let body = options.body
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(body)
  }
  let response
  try { response = await fetch(`${BASE_URL}${path}`, { ...options, headers, body }) }
  catch { throw new Error('No se pudo conectar con GameHub. Comprueba que la API esté disponible.') }
  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    if (response.status === 401) clearSession()
    const error = new Error(Array.isArray(data?.message) ? data.message.join('. ') : data?.message || `Error HTTP ${response.status}`)
    error.status = response.status
    throw error
  }
  return data
}
