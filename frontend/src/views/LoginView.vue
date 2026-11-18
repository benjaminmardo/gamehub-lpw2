<script setup>
import { ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { login } from '../services/auth'
const correo = ref(''), password = ref(''), loading = ref(false), error = ref('')
const route = useRoute(), router = useRouter()
async function submit() {
  loading.value = true; error.value = ''
  try { await login(correo.value, password.value); const target = route.query.redirect; await router.push(typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') ? target : '/perfil') }
  catch (e) { error.value = e.message }
  finally { loading.value = false }
}
</script>
<template>
  <section class="auth-layout"><div class="auth-intro"><span class="eyebrow">BIENVENIDO A TU ARENA</span><h1>El juego se disfruta.<br>La victoria se <em>comparte.</em></h1><p>Conecta con jugadores del IPVG, forma tu equipo y encuentra tu próximo desafío.</p><div class="arena-art" aria-hidden="true"><div class="arena-ring"></div><span class="arena-symbol">✦</span><span class="arena-label">PLAY TOGETHER · RISE TOGETHER</span></div><span class="subtle">HECHO PARA NUESTRA COMUNIDAD</span></div><div class="panel auth-card"><span class="eyebrow">VUELVE A LA PARTIDA</span><h2>Inicia sesión</h2><p class="muted">Tu equipo te está esperando.</p><form @submit.prevent="submit"><div class="field"><label for="correo">Correo electrónico</label><input id="correo" v-model.trim="correo" type="email" required autocomplete="email" placeholder="tu.correo@ejemplo.cl"></div><div class="field"><label for="password">Contraseña</label><input id="password" v-model="password" type="password" required autocomplete="current-password" placeholder="Tu contraseña"></div><p v-if="error" class="alert alert-error" role="alert">{{ error }}</p><button class="button button-full" :disabled="loading">{{ loading ? 'Ingresando…' : 'Entrar a GameHub' }}</button></form><p class="auth-bottom">¿Aún no tienes cuenta? <RouterLink to="/registro">Regístrate</RouterLink></p></div></section>
</template>
