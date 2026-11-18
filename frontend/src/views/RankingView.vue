<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { api } from '../services/api'
import TablaRanking from '../components/TablaRanking.vue'
const route = useRoute()
const torneos = ref([]), torneoId = ref(''), filas = ref([]), loading = ref(true), error = ref('')
const torneo = computed(() => torneos.value.find(t => t.id === Number(torneoId.value)))
const partidosJugados = computed(() => filas.value.reduce((total, fila) => total + fila.jugados, 0) / 2)
let request = 0
async function loadRanking() {
 const current = ++request; error.value = ''; filas.value = []
 if (!torneoId.value) { loading.value = false; return }
 loading.value = true
 try { const data = await api(`/torneos/${Number(torneoId.value)}/ranking`); if (current === request) filas.value = data }
 catch (e) { if (current === request) error.value = e.message }
 finally { if (current === request) loading.value = false }
}
watch(torneoId, loadRanking)
async function initialize() {
 loading.value = true; error.value = ''
 try { torneos.value = await api('/torneos'); const id = Number(route.query.torneoId); if (id > 0 && Number.isInteger(id)) torneoId.value = String(id); else if (torneos.value.length) torneoId.value = String(torneos.value[0].id); else loading.value = false }
 catch (e) { error.value = e.message; loading.value = false }
}
onMounted(initialize)
</script>
<template>
 <div class="page-head"><div><span class="eyebrow">GANADO EN LA ARENA</span><h1>Cada punto, una historia<span class="accent">.</span></h1><p>La clasificación se calcula desde los resultados oficiales.</p></div><span class="badge badge-mint">3 victoria · 1 empate · 0 derrota</span></div><div class="toolbar"><div class="field" style="margin:0;min-width:250px"><label for="torneo-ranking">Torneo</label><select id="torneo-ranking" v-model="torneoId"><option value="" disabled>Selecciona un torneo</option><option v-for="item in torneos" :key="item.id" :value="String(item.id)">{{ item.nombre }}</option></select></div><RouterLink v-if="torneoId" class="button button-secondary" :to="`/partidos?torneoId=${torneoId}`">Ver partidos</RouterLink></div>
 <p v-if="loading" class="loading-state" role="status">Calculando clasificación…</p><div v-else-if="error" class="alert alert-error" role="alert">{{ error }} <button class="text-button" @click="torneoId ? loadRanking() : initialize()">Reintentar</button></div><div v-else-if="!torneos.length" class="panel empty-state"><span class="empty-icon" aria-hidden="true">✦</span><h2>La próxima liga está por comenzar</h2><p>Las clasificaciones aparecerán cuando se creen torneos.</p></div><div v-else-if="!filas.length" class="panel empty-state"><span class="empty-icon" aria-hidden="true">✦</span><h2>El tablero está listo</h2><p>Este torneo todavía no tiene equipos inscritos.</p><RouterLink v-if="torneoId" class="button button-secondary" :to="`/torneos/${torneoId}`">Explorar torneo</RouterLink></div><template v-else><div class="stats-grid"><div class="stat"><strong>{{ filas.length }}</strong><span>Equipos en {{ torneo?.nombre || 'el torneo' }}</span></div><div class="stat"><strong>{{ partidosJugados }}</strong><span>Partidos con resultado oficial</span></div><div class="stat"><strong>3 / 1 / 0</strong><span>Puntos por victoria, empate y derrota</span></div></div><TablaRanking :filas="filas" /></template>
</template>
<style scoped>.toolbar{align-items:flex-end;flex-wrap:wrap}</style>
