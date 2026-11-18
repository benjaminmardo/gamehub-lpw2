<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '../services/api'
import { isAdmin } from '../services/auth'
import FiltrosTorneos from '../components/FiltrosTorneos.vue'
const filtros = ref({ q: '', videojuego: '', estado: '', modalidad: '', fecha: '' })
let version = 0, demora
const torneos = ref([]), cargando = ref(true), error = ref('')
const abiertos = computed(() => torneos.value.filter(t => t.estado === 'ABIERTO').length)
const fecha = valor => new Date(valor).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
async function cargar() {
  const actual = ++version; cargando.value = true; error.value = ''
  const parametros = new URLSearchParams(Object.entries(filtros.value).filter(([, valor]) => valor))
  try { const datos = await api('/torneos?' + parametros.toString()); if (actual === version) torneos.value = datos }
  catch (e) { if (actual === version) error.value = e.message }
  finally { if (actual === version) cargando.value = false }
}
watch(filtros, () => { clearTimeout(demora); ++version; cargando.value = true; demora = setTimeout(cargar, 300) }, { deep: true })
onMounted(cargar)
onBeforeUnmount(() => { clearTimeout(demora); ++version })
</script>
<template>
  <section>
    <div class="page-head"><div><span class="eyebrow">ELIGE TU PRÓXIMO DESAFÍO</span><h1>La arena te espera.</h1><p>Encuentra un torneo, reúne a tu equipo y representa a IPVG.</p></div><RouterLink v-if="isAdmin" class="button" to="/torneos/nuevo">Crear torneo</RouterLink></div>
    <div class="arena-banner panel"><div><span class="badge badge-mint">COMUNIDAD COMPETITIVA</span><h2>Juega en equipo.<br><span>Haz historia en la arena.</span></h2><p>Torneos organizados por tu comunidad, desde la primera partida hasta el último punto.</p></div><div class="trophy-art" aria-hidden="true"><span>✦</span><strong>GH</strong><small>GAME ON</small></div></div>
    <FiltrosTorneos v-model="filtros" />
    <div class="section-head"><h2>Explora los torneos</h2><span v-if="!cargando && !error" class="result-count">{{ torneos.length }} torneos · {{ abiertos }} abiertos</span></div>
    <p v-if="cargando" class="panel loading-state" role="status">Cargando torneos…</p>
    <div v-else-if="error" class="alert alert-error" role="alert">{{ error }} <button class="text-button" @click="cargar">Reintentar</button></div>
    <div v-else-if="!torneos.length" class="panel empty-state"><span class="empty-icon" aria-hidden="true">✦</span><h2>No encontramos torneos</h2><p>Prueba otra búsqueda o cambia los filtros seleccionados.</p></div>
    <div v-else class="card-grid">
      <RouterLink v-for="torneo in torneos" :key="torneo.id" class="panel tournament-card" :to="'/torneos/' + torneo.id">
        <div class="game-art" :class="{ 'game-art-mint': torneo.id % 2 === 0 }"><span>{{ torneo.videojuego }}</span><strong aria-hidden="true">✦</strong><small>IPVG ESPORTS</small></div>
        <div class="tournament-copy"><span class="badge" :class="torneo.estado === 'ABIERTO' ? 'badge-mint' : 'badge-neutral'">{{ torneo.estado.replaceAll('_', ' ') }}</span><h3>{{ torneo.nombre }}</h3><p>{{ torneo.modalidad }} · {{ torneo.cupoMaximo }} equipos</p><div class="tournament-date">Inicio · {{ fecha(torneo.fechaInicio) }}</div></div>
      </RouterLink>
    </div>
  </section>
</template>
<style scoped>
.arena-banner{display:flex;justify-content:space-between;align-items:center;gap:2rem;padding:2.5rem;margin-bottom:2.5rem;overflow:hidden;background:radial-gradient(ellipse at 80% 45%,#4f3b7138,transparent 55%),linear-gradient(120deg,#232037,#121823)}.arena-banner h2{font-family:'Barlow Condensed',Impact,sans-serif;font-size:clamp(2rem,3.3vw,3.2rem);line-height:1.1;margin:1.1rem 0}.arena-banner h2 span{color:#bba6f3}.arena-banner p{max-width:480px;color:var(--muted);margin:0;font-size:.9rem}.trophy-art{width:200px;height:180px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;color:var(--mint)}.trophy-art:before,.trophy-art:after{content:'';position:absolute;inset:12px 25px;border:1px solid #67527f;transform:rotate(45deg)}.trophy-art:after{inset:30px 45px;border-color:#383347}.trophy-art>span{font-size:2rem;z-index:1}.trophy-art strong{font-family:'Barlow Condensed',Impact,sans-serif;font-size:4rem;line-height:1;z-index:1}.trophy-art small{font-size:.65rem;letter-spacing:.25em;margin-top:.5rem;z-index:1}.tournament-card{padding:0;overflow:hidden;display:flex;flex-direction:column;color:inherit;transition:transform .2s,border-color .2s}.tournament-card:hover{transform:translateY(-3px);border-color:#73618e}.game-art{min-height:155px;padding:1.3rem;position:relative;overflow:hidden;background:linear-gradient(135deg,#352648,#191726)}.game-art:after{content:'';position:absolute;width:160px;height:160px;right:-20px;top:5px;border:1px solid #baa0f744;transform:rotate(35deg)}.game-art>span{display:block;max-width:80%;font-family:'Barlow Condensed',Impact,sans-serif;font-size:2rem;line-height:1;overflow-wrap:anywhere;color:#d5c6f5}.game-art strong{position:absolute;right:22px;bottom:15px;font-size:4rem;font-weight:400;color:#b99be066}.game-art small{position:absolute;bottom:1.2rem;left:1.3rem;font-size:.65rem;letter-spacing:.18em;color:#a28bbd}.game-art-mint{background:linear-gradient(135deg,#1d3b38,#14212a)}.game-art-mint>span{color:#b6e4d4}.game-art-mint strong{color:#8cc3ae66}.game-art-mint small{color:#80b29f}.tournament-copy{padding:1.25rem}.tournament-copy h3{font-size:1.15rem;margin:1rem 0 .5rem}.tournament-copy p{font-size:.85rem;color:var(--muted);margin-bottom:1rem}.tournament-date{border-top:1px solid var(--line);padding-top:.9rem;color:#b5bcd1;font-size:.8rem}@media(max-width:700px){.arena-banner{padding:1.5rem}.trophy-art{display:none}.arena-banner h2{font-size:2.4rem}.section-head{flex-wrap:wrap}}
</style>
