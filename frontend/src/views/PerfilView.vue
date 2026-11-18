<script setup>
import { onMounted, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { session, isAdmin, refreshProfile } from '../services/auth'
const loading = ref(true), error = ref('')
const initials = computed(() => (session.usuario?.nombre || '').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase())
onMounted(async () => { try { await refreshProfile() } catch (e) { error.value = e.message } finally { loading.value = false } })
</script>
<template>
  <div class="page-head"><div><span class="eyebrow">TU ESPACIO EN GAMEHUB</span><h1>Hola, {{ session.usuario?.alias || 'jugador' }}<span class="accent">.</span></h1><p>Todo listo para tu próximo desafío.</p></div><span class="badge">{{ isAdmin ? 'Administrador' : 'Estudiante IPVG' }}</span></div><p v-if="loading" class="loading-state" role="status">Cargando tu perfil…</p><p v-else-if="error" class="alert alert-error" role="alert">{{ error }}</p><section v-else-if="session.usuario" class="profile-grid"><div class="panel profile-card"><div class="avatar avatar-large">{{ initials }}</div><h2>{{ session.usuario.nombre }}</h2><p class="player-alias">@{{ session.usuario.alias }}</p><span class="badge badge-mint">Cuenta activa</span><dl class="profile-data"><div><dt>Correo electrónico</dt><dd>{{ session.usuario.correo }}</dd></div><div><dt>Rol en la comunidad</dt><dd>{{ isAdmin ? 'Administrador' : 'Estudiante' }}</dd></div><div v-if="session.usuario.creadoEn"><dt>Miembro desde</dt><dd>{{ new Date(session.usuario.creadoEn).toLocaleDateString('es-CL') }}</dd></div></dl></div><div class="panel profile-next"><span class="eyebrow">LA COMUNIDAD TE ESPERA</span><h2>Las mejores partidas<br>se juegan en equipo.</h2><p>Explora los equipos de GameHub, reúne a tus compañeros y prepárate para competir.</p><RouterLink class="button" to="/equipos">Explorar equipos</RouterLink><div class="next-art" aria-hidden="true"><span>◇</span><span>✦</span><span>◇</span></div></div></section>
</template>
