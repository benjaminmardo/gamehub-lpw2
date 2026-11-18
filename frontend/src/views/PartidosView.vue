<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { api } from '../services/api'
import { isAdmin, session, refreshProfile } from '../services/auth'
const route = useRoute()
const torneos = ref([]), torneoId = ref(''), partidos = ref([]), inscritos = ref([])
const loading = ref(true), error = ref(''), formOpen = ref(false), saving = ref(false), actionError = ref(''), success = ref('')
const form = reactive({ equipoLocalId: '', equipoVisitanteId: '', fechaHora: '', ronda: '' })
const torneo = computed(() => torneos.value.find(t => t.id === Number(torneoId.value)))
const equipos = computed(() => inscritos.value.filter(i => i.estado === 'CONFIRMADA').map(i => i.equipo))
const pendientes = computed(() => partidos.value.filter(p => p.estado === 'PROGRAMADO').length)
const finalizados = computed(() => partidos.value.filter(p => p.estado === 'FINALIZADO').length)
const formatDate = fecha => new Date(fecha).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
let request = 0
async function loadMatches() {
  const current = ++request
  loading.value = true; error.value = ''; actionError.value = ''; inscritos.value = []
  try {
    const suffix = torneoId.value ? `?torneoId=${Number(torneoId.value)}` : ''
    const [matches, registrations] = await Promise.all([api(`/partidos${suffix}`), torneoId.value ? api(`/inscripciones${suffix}`) : Promise.resolve([])])
    if (current !== request) return
    partidos.value = matches; inscritos.value = registrations
  } catch (e) { if (current === request) error.value = e.message }
  finally { if (current === request) loading.value = false }
}
watch(torneoId, () => { Object.assign(form, { equipoLocalId: '', equipoVisitanteId: '', fechaHora: '', ronda: '' }); success.value = ''; loadMatches() })
async function initialize() {
  loading.value = true; error.value = ''
  try {
    if (session.token) { try { await refreshProfile() } catch { /* Las consultas públicas siguen disponibles al vencer la sesión. */ } }
    torneos.value = await api('/torneos')
    const initial = route.query.torneoId
    if (initial && Number.isInteger(Number(initial)) && Number(initial) > 0 && torneoId.value !== String(Number(initial))) torneoId.value = String(Number(initial))
    else await loadMatches()
  } catch (e) { error.value = e.message; loading.value = false }
}
async function createMatch() {
  saving.value = true; actionError.value = ''; success.value = ''
  try {
    if (!torneoId.value) throw new Error('Selecciona el torneo donde se jugará el partido.')
    if (form.equipoLocalId === form.equipoVisitanteId) throw new Error('Selecciona dos equipos diferentes.')
    const fechaHora = new Date(form.fechaHora)
    if (Number.isNaN(fechaHora.getTime())) throw new Error('Ingresa una fecha y hora válidas.')
    await api('/partidos', { method: 'POST', body: { torneoId: Number(torneoId.value), equipoLocalId: Number(form.equipoLocalId), equipoVisitanteId: Number(form.equipoVisitanteId), fechaHora: fechaHora.toISOString(), ronda: form.ronda } })
    success.value = 'Partido programado. Los equipos ya tienen su próximo desafío.'
    Object.assign(form, { equipoLocalId: '', equipoVisitanteId: '', fechaHora: '', ronda: '' })
    formOpen.value = false; await loadMatches()
  } catch (e) { actionError.value = e.message }
  finally { saving.value = false }
}
onMounted(initialize)
</script>
<template>
  <div class="page-head"><div><span class="eyebrow">CADA ENCUENTRO CUENTA</span><h1>El próximo desafío<span class="accent">.</span></h1><p>Consulta los enfrentamientos y sigue a tu equipo.</p></div><button v-if="isAdmin" class="button" @click="formOpen = !formOpen">{{ formOpen ? 'Cerrar formulario' : '+ Programar partido' }}</button></div>
  <div class="toolbar"><div class="field" style="margin:0;min-width:250px"><label for="torneo-partidos">Filtrar por torneo</label><select id="torneo-partidos" v-model="torneoId"><option value="">Todos los torneos</option><option v-for="item in torneos" :key="item.id" :value="String(item.id)">{{ item.nombre }}</option></select></div><RouterLink v-if="torneoId" class="button button-secondary" :to="`/ranking?torneoId=${torneoId}`">Ver clasificación</RouterLink></div>
  <p v-if="success" class="alert alert-success" role="status">{{ success }}</p><p v-if="actionError" class="alert alert-error" role="alert">{{ actionError }}</p>
  <section v-if="isAdmin && formOpen" class="panel match-form-panel"><div class="section-head"><div><span class="eyebrow">PROGRAMACIÓN OFICIAL</span><h2>Prepara el encuentro</h2></div></div><p v-if="!torneoId" class="muted">Selecciona un torneo para ver sus equipos inscritos.</p><p v-else-if="equipos.length < 2" class="alert" role="status">Se necesitan al menos dos equipos inscritos en este torneo.</p><form v-else @submit.prevent="createMatch"><p class="muted">{{ torneo?.nombre }} · Solo participan equipos con inscripción confirmada.</p><div class="form-grid"><div class="field"><label for="local">Equipo local</label><select id="local" v-model="form.equipoLocalId" required><option value="" disabled>Seleccionar equipo</option><option v-for="equipo in equipos" :key="equipo.id" :value="String(equipo.id)">{{ equipo.nombre }}</option></select></div><div class="field"><label for="visita">Equipo visitante</label><select id="visita" v-model="form.equipoVisitanteId" required><option value="" disabled>Seleccionar equipo</option><option v-for="equipo in equipos" :key="equipo.id" :value="String(equipo.id)" :disabled="String(equipo.id) === form.equipoLocalId">{{ equipo.nombre }}</option></select></div><div class="field"><label for="fecha-partido">Fecha y hora local</label><input id="fecha-partido" v-model="form.fechaHora" type="datetime-local" required></div><div class="field"><label for="ronda">Ronda</label><input id="ronda" v-model.trim="form.ronda" required maxlength="80" placeholder="Ej. Jornada 1"></div></div><div class="form-actions"><button class="button" :disabled="saving">{{ saving ? 'Programando…' : 'Programar encuentro' }}</button></div></form></section>
  <p v-if="loading" class="loading-state" role="status">Cargando encuentros…</p><div v-else-if="error" class="alert alert-error" role="alert">{{ error }} <button class="text-button" @click="initialize">Reintentar</button></div><template v-else><div class="stats-grid"><div class="stat"><strong>{{ partidos.length }}</strong><span>Encuentros en el calendario</span></div><div class="stat"><strong>{{ pendientes }}</strong><span>Por disputar</span></div><div class="stat"><strong>{{ finalizados }}</strong><span>Con resultado oficial</span></div></div><div v-if="!partidos.length" class="panel empty-state"><span class="empty-icon" aria-hidden="true">◬</span><h2>La arena se está preparando</h2><p>Aún no hay partidos programados{{ torneoId ? ' para este torneo' : '' }}.</p></div><div v-else class="card-grid"><RouterLink v-for="partido in partidos" :key="partido.id" :to="`/partidos/${partido.id}`" class="panel team-card match-card"><div class="team-card-top"><span class="badge" :class="partido.estado === 'FINALIZADO' ? 'badge-mint' : 'badge-neutral'">{{ partido.estado === 'FINALIZADO' ? 'Finalizado' : 'Programado' }}</span><span class="match-round">{{ partido.ronda }}</span></div><p>{{ partido.torneo?.nombre }}</p><div class="match-teams"><strong>{{ partido.equipoLocal?.nombre }}</strong><span>VS</span><strong>{{ partido.equipoVisitante?.nombre }}</strong></div><div class="team-card-foot"><time :datetime="partido.fechaHora">{{ formatDate(partido.fechaHora) }}</time><span>Ver encuentro</span></div></RouterLink></div></template>
</template>
<style scoped>.match-form-panel{margin-bottom:1.5rem}.match-teams{display:flex;flex-direction:column;gap:.7rem;margin:.3rem 0 1rem}.match-teams strong{font-size:1.2rem}.match-teams>span{font-family:'Barlow Condensed',Impact,sans-serif;color:#9683b8;font-size:.9rem;letter-spacing:.1em}.match-round{color:#939bb3;font-size:.8rem}.toolbar{flex-wrap:wrap;align-items:flex-end}.match-card .team-card-foot{flex-wrap:wrap}</style>
