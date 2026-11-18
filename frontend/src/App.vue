<script setup>
import { computed, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { session, isAdmin, logout } from './services/auth'
const router = useRouter(), route = useRoute()
const links = computed(() => router.getRoutes().filter(r => r.meta.nav && (!r.meta.admin || isAdmin.value)))
const initials = computed(() => (session.usuario?.nombre || 'GH').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase())
function signOut() { logout(); router.push('/login') }
watch(() => session.token, token => { if (!token && route.meta.requiresAuth) router.push({ name: 'login', query: { redirect: route.fullPath } }) })
</script>
<template>
  <div class="app-shell">
    <aside class="sidebar">
      <RouterLink class="brand" to="/"><span class="brand-mark">GH</span><span>GAMEHUB<small>IPVG · ESPORTS</small></span></RouterLink>
      <div class="sidebar-label">TU ARENA DIGITAL</div>
      <nav class="main-nav" aria-label="Navegación principal"><RouterLink v-for="link in links" :key="link.path" :to="link.path"><span class="nav-icon" aria-hidden="true">{{ link.meta.icon || '◈' }}</span>{{ link.meta.nav }}</RouterLink></nav>
      <div class="community-panel"><span class="community-icon" aria-hidden="true">✦</span><strong>El próximo nivel<br>empieza en equipo.</strong><p>Compite, conecta y representa a tu comunidad.</p></div>
      <div class="sidebar-footer">COMUNIDAD IPVG <span>2026</span></div>
    </aside>
    <div class="main-shell"><header class="topbar"><div class="breadcrumb"><span>GameHub</span><span>/</span><strong>{{ route.meta.title || 'Comunidad' }}</strong></div><div class="account-actions"><template v-if="session.usuario"><span class="account-name">{{ session.usuario.alias || session.usuario.nombre }}<small>{{ isAdmin ? 'Administrador' : 'Estudiante' }}</small></span><RouterLink class="avatar" to="/perfil" aria-label="Abrir mi perfil">{{ initials }}</RouterLink><button class="text-button" @click="signOut">Salir</button></template><template v-else><RouterLink class="text-button" to="/login">Ingresar</RouterLink><RouterLink class="button button-small" to="/registro">Crear cuenta</RouterLink></template></div></header><main class="content"><RouterView /></main><footer class="page-footer"><span>GameHub IPVG</span><span>Tu comunidad. Tu equipo. Tu próxima victoria.</span></footer></div>
  </div>
</template>
