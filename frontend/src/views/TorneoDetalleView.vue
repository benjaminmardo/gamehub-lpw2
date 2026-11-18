<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { api } from '../services/api'
import { isAdmin } from '../services/auth'
const route = useRoute(), router = useRouter()
const torneo = ref(null), cargando = ref(true), error = ref(''), eliminando = ref(false)
let version = 0
const fecha = valor => new Date(valor).toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' })
const estado = computed(() => torneo.value?.estado.replaceAll('_', ' '))
async function cargar() {
  const actual = ++version; cargando.value = true; error.value = ''; torneo.value = null
  try { const datos = await api('/torneos/' + route.params.id); if (actual === version) torneo.value = datos }
  catch (e) { if (actual === version) error.value = e.message }
  finally { if (actual === version) cargando.value = false }
}
async function eliminar() {
  if (!window.confirm('¿Eliminar este torneo? Esta acción solo está permitida si no tiene actividad.')) return
  eliminando.value = true; error.value = ''
  try { await api('/torneos/' + torneo.value.id, { method: 'DELETE' }); router.push('/torneos') }
  catch (e) { error.value = e.message }
  finally { eliminando.value = false }
}
watch(() => route.params.id, cargar, { immediate: true })
</script>
<template>
  <section>
    <RouterLink class="back-link" to="/torneos">Volver a torneos</RouterLink>
    <p v-if="cargando" class="panel loading-state" role="status">Cargando torneo…</p>
    <p v-else-if="error && !torneo" class="alert alert-error" role="alert">{{ error }}</p>
    <template v-if="torneo">
      <div class="page-head"><div><span class="eyebrow">{{ torneo.videojuego }} · {{ torneo.modalidad }}</span><h1>{{ torneo.nombre }}</h1><span class="badge" :class="torneo.estado === 'ABIERTO' ? 'badge-mint' : 'badge-neutral'">{{ estado }}</span></div><RouterLink v-if="isAdmin" class="button button-secondary" :to="'/torneos/' + torneo.id + '/editar'">Editar torneo</RouterLink></div>
      <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>
      <div class="detail-grid">
        <article class="panel"><div class="section-head"><h2>Información de la competencia</h2></div><dl class="tournament-info"><div><dt>Videojuego</dt><dd>{{ torneo.videojuego }}</dd></div><div><dt>Formato</dt><dd>{{ torneo.modalidad }}</dd></div><div><dt>Inicio del torneo</dt><dd>{{ fecha(torneo.fechaInicio) }}</dd></div><div><dt>Cierre de inscripciones</dt><dd>{{ fecha(torneo.cierreInscripcion) }}</dd></div><div><dt>Cupo máximo</dt><dd>{{ torneo.cupoMaximo }} equipos</dd></div><div><dt>Empates</dt><dd>{{ torneo.permiteEmpate ? 'Permitidos' : 'No permitidos' }}</dd></div></dl></article>
        <aside class="panel"><span class="eyebrow">PREPARA A TU EQUIPO</span><h2>La competencia empieza contigo.</h2><p class="muted">Organiza tu equipo para participar en los torneos de la comunidad.</p><RouterLink class="button button-secondary" to="/equipos">Ver equipos</RouterLink><div v-if="isAdmin" class="admin-actions"><h3>Administración</h3><p class="muted">Los torneos con inscripciones o partidos conservan su historial. Puedes cambiar su estado a cancelado.</p><button class="button button-danger" :disabled="eliminando" @click="eliminar">{{ eliminando ? 'Eliminando…' : 'Eliminar torneo' }}</button></div></aside>
      </div>
    </template>
  </section>
</template>
<style scoped>
.tournament-info{margin:0}.tournament-info>div{padding:1rem 0;border-top:1px solid var(--line);display:grid;grid-template-columns:1fr 1.2fr;gap:1rem}.tournament-info>div:first-child{border-top:0}.tournament-info dt{color:var(--muted);font-size:.85rem}.tournament-info dd{margin:0;font-size:.9rem;overflow-wrap:anywhere}.admin-actions{border-top:1px solid var(--line);padding-top:1.5rem;margin-top:2rem}.admin-actions p{font-size:.85rem}@media(max-width:550px){.tournament-info>div{grid-template-columns:1fr;gap:.4rem}}
</style>
