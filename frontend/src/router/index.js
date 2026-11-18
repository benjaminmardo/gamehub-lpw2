import { createRouter, createWebHistory } from 'vue-router'
import { reactive } from 'vue'
import { session, refreshProfile, isAdmin } from '../services/auth'
import { partidosRankingRoutes } from './partidos-ranking'
export const navigationFailure = reactive({ message: '', path: '' })
const router = createRouter({
 history: createWebHistory(),
 routes: [
    ...partidosRankingRoutes,
  { path: '/', redirect: '/torneos' },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { title: 'Iniciar sesión', guest: true } },
  { path: '/registro', name: 'registro', component: () => import('../views/RegisterView.vue'), meta: { title: 'Crear cuenta', guest: true } },
  { path: '/perfil', name: 'perfil', component: () => import('../views/PerfilView.vue'), meta: { title: 'Mi perfil', requiresAuth: true, nav: 'Mi perfil', icon: '◈' } },
  { path: '/equipos', name: 'equipos', component: () => import('../views/EquiposView.vue'), meta: { title: 'Equipos', nav: 'Equipos', icon: '◇' } },
  { path: '/equipos/:id', name: 'equipo-detalle', component: () => import('../views/EquipoDetalleView.vue'), meta: { title: 'Detalle del equipo' } },
  { path: '/torneos', name: 'torneos', component: () => import('../views/TorneosView.vue'), meta: { title: 'Torneos', nav: 'Torneos', icon: '✦' } },
  { path: '/torneos/nuevo', name: 'torneo-nuevo', component: () => import('../views/TorneoFormView.vue'), meta: { title: 'Crear torneo', requiresAuth: true, admin: true } },
  { path: '/torneos/:id/editar', name: 'torneo-editar', component: () => import('../views/TorneoFormView.vue'), meta: { title: 'Editar torneo', requiresAuth: true, admin: true } },
  { path: '/torneos/:id', name: 'torneo-detalle', component: () => import('../views/TorneoDetalleView.vue'), meta: { title: 'Detalle del torneo' } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
 ],
})
router.beforeEach(async (to) => {
 navigationFailure.message = ''
 if ((to.meta.requiresAuth || to.meta.admin) && !session.token) return { name: 'login', query: { redirect: to.fullPath } }
 if (session.token && (to.meta.requiresAuth || to.meta.admin)) {
  try { await refreshProfile() } catch (error) {
   if (error.status === 401) return { name: 'login', query: { redirect: to.fullPath } }
   navigationFailure.message = error.message
   navigationFailure.path = to.fullPath
   return false
  }
 }
 if (to.meta.admin && !isAdmin.value) return { name: 'perfil' }
 if (to.meta.guest && session.token) return { name: 'perfil' }
 document.title = `${to.meta.title || 'GameHub'} · GameHub IPVG`
})
export default router
