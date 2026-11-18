<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '../services/api'
import { isAdmin, session } from '../services/auth'
const props = defineProps({ torneo: { type: Object, required: true } })
const emit = defineEmits(['creado'])
const equipos = ref([]), equipoId = ref(''), cargando = ref(false), enviando = ref(false), error = ref(''), exito = ref(''), cupoLleno = ref(false)
const disponible = computed(() => props.torneo.estado === 'ABIERTO' && Date.now() < new Date(props.torneo.cierreInscripcion).getTime())
let version = 0
async function cargarEquipos() {
  const actual = ++version; equipos.value = []; equipoId.value = ''; error.value = ''; exito.value = ''
  if (!session.token) return
  cargando.value = true
  try { const lista = await api('/equipos'); if (actual === version) equipos.value = lista.filter(e => isAdmin.value || e.capitanId === session.usuario?.id) }
  catch (e) { if (actual === version) error.value = e.message }
  finally { if (actual === version) cargando.value = false }
}
async function inscribir() {
  error.value = ''; exito.value = ''; cupoLleno.value = false; enviando.value = true
  try {
    await api('/inscripciones', { method: 'POST', body: { torneoId: props.torneo.id, equipoId: Number(equipoId.value) } })
    exito.value = '¡Equipo inscrito! Tu participación está confirmada.'
    emit('creado')
  } catch (e) { cupoLleno.value = e.status === 409 && /cupo/i.test(e.message); error.value = e.message }
  finally { enviando.value = false }
}
watch(() => session.usuario?.id, cargarEquipos, { immediate: true })
watch(() => props.torneo.id, () => { exito.value = ''; error.value = ''; cupoLleno.value = false })
</script>
<template>
  <div>
    <span class="eyebrow">TU EQUIPO EN LA ARENA</span><h2>Reserva tu lugar.</h2>
    <p class="muted">La inscripción confirma la participación de tu equipo. Solo su capitán o un administrador puede realizarla.</p>
    <p v-if="!disponible" class="alert">Las inscripciones de este torneo están cerradas.</p>
    <template v-else-if="!session.token"><p class="muted">Inicia sesión para inscribir a tu equipo.</p><RouterLink class="button" :to="{ path: '/login', query: { redirect: '/torneos/' + torneo.id } }">Iniciar sesión</RouterLink></template>
    <p v-else-if="cargando" class="loading-state" role="status">Buscando tus equipos…</p>
    <template v-else>
      <p v-if="exito" class="alert alert-success" role="status">{{ exito }}</p>
      <div v-if="error" class="alert alert-error" role="alert"><strong v-if="cupoLleno">El torneo está completo. </strong>{{ error }}</div>
      <form v-if="equipos.length" @submit.prevent="inscribir"><div class="field"><label for="inscripcion-equipo">Equipo participante</label><select id="inscripcion-equipo" v-model="equipoId" required :disabled="enviando"><option value="" disabled>Selecciona un equipo</option><option v-for="equipo in equipos" :key="equipo.id" :value="equipo.id">{{ equipo.nombre }}</option></select></div><button class="button button-full" :disabled="enviando || !equipoId || cupoLleno">{{ enviando ? 'Confirmando inscripción…' : 'Inscribir equipo' }}</button></form>
      <template v-else-if="!error"><p class="muted">Aún no eres capitán de ningún equipo.</p><RouterLink class="button button-secondary" to="/equipos">Crear mi equipo</RouterLink></template>
      <button v-if="error && !equipos.length" class="text-button" @click="cargarEquipos">Reintentar carga de equipos</button>
    </template>
  </div>
</template>
<style scoped>
form{margin-top:1.5rem}.alert{margin-bottom:1rem}
</style>
