<script setup>
import { reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { api } from '../services/api'
import { login } from '../services/auth'
const form = reactive({ nombre: '', alias: '', correo: '', password: '' })
const loading = ref(false), error = ref(''), router = useRouter()
async function submit() {
  loading.value = true; error.value = ''
  try { await api('/auth/registro', { method: 'POST', body: form }); await login(form.correo, form.password); await router.push('/perfil') }
  catch (e) { error.value = e.message }
  finally { loading.value = false }
}
</script>
<template>
  <section class="auth-layout"><div class="auth-intro"><span class="eyebrow">ENCUENTRA A TU EQUIPO</span><h1>Tu próxima partida<br>empieza <em>aquí.</em></h1><p>Una comunidad para competir, aprender y celebrar cada victoria. Crea tu cuenta y súmate a GameHub IPVG.</p><div class="feature-list"><div><span>◇</span><div><strong>Forma tu equipo</strong><p>Reúne a tu comunidad de jugadores.</p></div></div><div><span>◈</span><div><strong>Compite con propósito</strong><p>Representa al IPVG en cada partida.</p></div></div><div><span>✦</span><div><strong>Haz crecer tu historia</strong><p>Cada encuentro cuenta.</p></div></div></div></div><div class="panel auth-card"><span class="eyebrow">EL PRIMER PASO</span><h2>Crea tu cuenta</h2><p class="muted">Tu lugar en la comunidad.</p><form @submit.prevent="submit"><div class="field"><label for="nombre">Nombre completo</label><input id="nombre" v-model.trim="form.nombre" required maxlength="100" autocomplete="name" placeholder="Tu nombre"></div><div class="field"><label for="alias">Alias de jugador</label><input id="alias" v-model.trim="form.alias" required maxlength="50" autocomplete="nickname" placeholder="¿Cómo te conocen en el juego?"></div><div class="field"><label for="correo">Correo electrónico</label><input id="correo" v-model.trim="form.correo" type="email" required autocomplete="email" placeholder="tu.correo@ejemplo.cl"></div><div class="field"><label for="password">Contraseña</label><input id="password" v-model="form.password" type="password" minlength="6" required autocomplete="new-password" placeholder="Al menos 6 caracteres"></div><p v-if="error" class="alert alert-error" role="alert">{{ error }}</p><button class="button button-full" :disabled="loading">{{ loading ? 'Creando cuenta…' : 'Unirme a GameHub' }}</button></form><p class="auth-bottom">¿Ya eres parte? <RouterLink to="/login">Inicia sesión</RouterLink></p></div></section>
</template>
