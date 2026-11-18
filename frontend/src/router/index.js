import { createRouter, createWebHistory } from 'vue-router'
import { h } from 'vue'
import { session, refreshProfile, isAdmin } from '../services/auth'
const EquiposPendiente = { render: () => h('section', { class: 'panel empty-state' }, [h('h2', 'Equipos'), h('p', 'El espacio de equipos estará disponible en el siguiente hito.')]) }
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/perfil' },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { title: 'Iniciar sesión', guest: true } },
    { path: '/registro', name: 'registro', component: () => import('../views/RegisterView.vue'), meta: { title: 'Crear cuenta', guest: true } },
    { path: '/perfil', name: 'perfil', component: () => import('../views/PerfilView.vue'), meta: { title: 'Mi perfil', requiresAuth: true, nav: 'Mi perfil', icon: '◈' } },
    { path: '/equipos', name: 'equipos', component: EquiposPendiente, meta: { title: 'Equipos', nav: 'Equipos', icon: '◇' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
router.beforeEach(async (to) => {
  if ((to.meta.requiresAuth || to.meta.admin) && !session.token) return { name: 'login', query: { redirect: to.fullPath } }
  if (session.token && (to.meta.requiresAuth || to.meta.admin)) {
    try { await refreshProfile() } catch (error) { if (error.status === 401) return { name: 'login', query: { redirect: to.fullPath } }; throw error }
  }
  if (to.meta.admin && !isAdmin.value) return { name: 'perfil' }
  if (to.meta.guest && session.token) return { name: 'perfil' }
  document.title = `${to.meta.title || 'GameHub'} · GameHub IPVG`
})
export default router
