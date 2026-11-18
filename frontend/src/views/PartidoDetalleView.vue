<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { api } from '../services/api'
import { isAdmin, session, refreshProfile } from '../services/auth'
const route = useRoute()
const partido = ref(null), resultado = ref(null), loading = ref(true), error = ref(''), actionError = ref(''), success = ref(''), saving = ref(false)
const form = reactive({ puntajeLocal: 0, puntajeVisitante: 0 })
const winner = computed(() => resultado.value?.ganadorId ? resultado.value.ganadorId === partido.value.equipoLocalId ? partido.value.equipoLocal?.nombre : partido.value.equipoVisitante?.nombre : 'Empate')
const formatDate = fecha => new Date(fecha).toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' })
let request = 0
async function load() {
  const current = ++request; loading.value = true; error.value = ''
  try {
    if (session.token) { try { await refreshProfile() } catch { /* El detalle continúa disponible sin sesión. */ } }
    const [match, results] = await Promise.all([api(`/partidos/${route.params.id}`), api(`/resultados?partidoId=${route.params.id}`)])
    if (current !== request) return
    partido.value = match; resultado.value = results[0] || null
  } catch (e) { if (current === request) error.value = e.message }
  finally { if (current === request) loading.value = false }
}
async function submit() {
  saving.value = true; actionError.value = ''; success.value = ''
  try {
    const local = Number(form.puntajeLocal), visita = Number(form.puntajeVisitante)
    if (![local, visita].every(score => Number.isInteger(score) && score >= 0 && score <= 1000000)) throw new Error('Los puntajes deben ser números enteros entre 0 y 1.000.000.')
    if (local === visita && !partido.value.torneo.permiteEmpate) throw new Error('Este torneo no permite empates. Ingresa un marcador con un ganador.')
    await api('/resultados', { method: 'POST', body: { partidoId: partido.value.id, puntajeLocal: local, puntajeVisitante: visita } })
    success.value = 'Resultado oficial registrado. La clasificación ya está actualizada.'
    await load()
  } catch (e) { actionError.value = e.message }
  finally { saving.value = false }
}
watch(() => route.params.id, () => { success.value = ''; actionError.value = ''; load() })
onMounted(load)
</script>
<template>
  <RouterLink class="back-link" :to="partido ? `/partidos?torneoId=${partido.torneoId}` : '/partidos'">Volver a partidos</RouterLink><p v-if="loading" class="loading-state" role="status">Cargando encuentro…</p><div v-else-if="error" class="alert alert-error" role="alert">{{ error }} <button class="text-button" @click="load">Reintentar</button></div><template v-else-if="partido"><div class="page-head"><div><span class="eyebrow">{{ partido.torneo?.nombre }}</span><h1>Todo se juega aquí<span class="accent">.</span></h1><p>{{ partido.ronda }} · {{ formatDate(partido.fechaHora) }}</p></div><span class="badge" :class="resultado ? 'badge-mint' : 'badge-neutral'">{{ resultado ? 'Resultado oficial' : 'Programado' }}</span></div><p v-if="success" class="alert alert-success" role="status">{{ success }}</p><p v-if="actionError" class="alert alert-error" role="alert">{{ actionError }}</p>
  <section class="panel scoreboard"><div class="score-team"><span class="team-emblem">{{ partido.equipoLocal?.nombre.slice(0,2).toUpperCase() }}</span><RouterLink :to="`/equipos/${partido.equipoLocalId}`">{{ partido.equipoLocal?.nombre }}</RouterLink><small>LOCAL</small></div><div class="score-center"><div v-if="resultado" class="score-numbers"><strong>{{ resultado.puntajeLocal }}</strong><span>:</span><strong>{{ resultado.puntajeVisitante }}</strong></div><span v-else class="vs">VS</span><span class="badge" :class="resultado ? 'badge-mint' : 'badge-neutral'">{{ resultado ? winner : 'Por disputar' }}</span></div><div class="score-team"><span class="team-emblem">{{ partido.equipoVisitante?.nombre.slice(0,2).toUpperCase() }}</span><RouterLink :to="`/equipos/${partido.equipoVisitanteId}`">{{ partido.equipoVisitante?.nombre }}</RouterLink><small>VISITANTE</small></div></section>
  <div class="detail-grid"><section v-if="isAdmin && !resultado" class="panel"><span class="eyebrow">SOLO ADMINISTRACIÓN</span><h2>Registrar resultado oficial</h2><p class="muted">El marcador se incorpora automáticamente a la clasificación del torneo.</p><form @submit.prevent="submit"><div class="form-grid"><div class="field"><label for="puntaje-local">{{ partido.equipoLocal?.nombre }}</label><input id="puntaje-local" v-model.number="form.puntajeLocal" type="number" min="0" max="1000000" step="1" required></div><div class="field"><label for="puntaje-visita">{{ partido.equipoVisitante?.nombre }}</label><input id="puntaje-visita" v-model.number="form.puntajeVisitante" type="number" min="0" max="1000000" step="1" required></div></div><p class="muted">{{ partido.torneo.permiteEmpate ? 'Este torneo permite empates.' : 'Este torneo requiere un ganador: no permite empates.' }}</p><div class="form-actions"><button class="button" :disabled="saving">{{ saving ? 'Registrando…' : 'Confirmar resultado oficial' }}</button></div></form></section><section v-else class="panel"><span class="eyebrow">EL ENCUENTRO</span><h2>{{ resultado ? 'Marcador confirmado' : 'La partida está por comenzar' }}</h2><p class="muted">{{ resultado ? 'Este resultado ya forma parte de la clasificación oficial.' : 'El resultado estará disponible cuando un administrador registre el marcador oficial.' }}</p></section><section class="panel"><h2>Continúa en la arena</h2><p class="muted">Consulta los próximos enfrentamientos y la posición de cada equipo.</p><div class="form-actions"><RouterLink class="button button-secondary" :to="`/torneos/${partido.torneoId}`">Ver torneo</RouterLink><RouterLink class="button" :to="`/ranking?torneoId=${partido.torneoId}`">Ver ranking</RouterLink></div></section></div></template>
</template>
<style scoped>.scoreboard{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;align-items:center;padding:2.5rem;margin-bottom:1.5rem;background:radial-gradient(ellipse at 50% 0,#49376155,transparent 70%),#141722}.score-team{display:flex;flex-direction:column;align-items:center;gap:.9rem;text-align:center}.score-team>a{font-weight:700;font-size:1.3rem;color:#ede9f7;overflow-wrap:anywhere}.score-team small{font-size:.75rem;color:#939bb5;letter-spacing:.13em}.score-team .team-emblem{width:76px;height:76px;font-size:2rem}.score-center{display:flex;flex-direction:column;align-items:center;gap:1rem}.score-numbers{display:flex;align-items:center;gap:1rem;font-family:'Barlow Condensed',Impact,sans-serif;font-size:4.5rem}.score-numbers>span{color:#665b7e}.vs{font-family:'Barlow Condensed',Impact,sans-serif;font-size:3rem;color:#b9a7de}@media(max-width:550px){.scoreboard{padding:1.4rem .8rem;gap:.5rem}.score-team .team-emblem{width:52px;height:52px;font-size:1.4rem}.score-team>a{font-size:.95rem}.score-numbers{font-size:3rem;gap:.4rem}.score-center .badge{font-size:.7rem;white-space:normal;text-align:center}}</style>
