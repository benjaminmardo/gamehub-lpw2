import { computed, reactive } from 'vue'
import { api, clearSession, TOKEN_KEY, USER_KEY } from './api'
function storedUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') }
  catch { localStorage.removeItem(USER_KEY); return null }
}
export const session = reactive({ token: localStorage.getItem(TOKEN_KEY), usuario: storedUser() })
export const isAdmin = computed(() => session.usuario?.rol === 'admin')
window.addEventListener('gamehub:unauthorized', () => { session.token = null; session.usuario = null })
export async function login(correo, password) {
  const data = await api('/auth/login', { method: 'POST', body: { correo, password } })
  localStorage.setItem(TOKEN_KEY, data.access_token)
  localStorage.setItem(USER_KEY, JSON.stringify(data.usuario))
  session.token = data.access_token
  session.usuario = data.usuario
  return data.usuario
}
export function logout() { clearSession() }
export async function refreshProfile() {
  if (!session.token) return null
  const usuario = await api('/usuarios/perfil')
  session.usuario = usuario
  localStorage.setItem(USER_KEY, JSON.stringify(usuario))
  return usuario
}
