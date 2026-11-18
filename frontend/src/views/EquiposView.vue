<script setup>
import { computed, nextTick, onMounted, onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { api } from '../services/api'
import { session } from '../services/auth'
import EquipoCard from '../components/EquipoCard.vue'
const equipos = ref([]), search = ref(''), loading = ref(true), error = ref(''), creating = ref(false), modal = ref(false), createError = ref('')
const nameInput = ref(null), createButton = ref(null)
const form = reactive({ nombre: '', videojuego: '', descripcion: '', integrantes: '' })
const router = useRouter()
const filtered = computed(() => { const q = search.value.toLocaleLowerCase('es').trim(); return equipos.value.filter(e => [e.nombre, e.videojuego, e.capitan?.alias].some(v => (v || '').toLocaleLowerCase('es').includes(q))) })
async function load() { loading.value = true; error.value = ''; try { equipos.value = await api('/equipos') } catch (e) { error.value = e.message } finally { loading.value = false } }
async function openModal() { modal.value = true; createError.value = ''; await nextTick(); nameInput.value?.focus() }
async function closeModal() { if (creating.value) return; modal.value = false; await nextTick(); createButton.value?.focus() }
function keydown(e) {
  if (!modal.value) return
  if (e.key === 'Escape') closeModal()
  if (e.key === 'Tab') {
    const elements = [...document.querySelectorAll('[role="dialog"] button, [role="dialog"] input, [role="dialog"] textarea')].filter(el => !el.disabled)
    const first = elements[0], last = elements.at(-1)
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
  }
}
async function create() {
  creating.value = true; createError.value = ''
  try {
    const integranteIds = form.integrantes.trim() ? form.integrantes.split(',').map(id => Number(id.trim())) : []
    if (integranteIds.some(id => !Number.isInteger(id) || id < 1) || new Set(integranteIds).size !== integranteIds.length) throw new Error('Ingresa IDs de usuario positivos, sin repetir y separados por comas.')
    const equipo = await api('/equipos', { method: 'POST', body: { nombre: form.nombre, videojuego: form.videojuego, descripcion: form.descripcion, integranteIds } })
    modal.value = false; await router.push(`/equipos/${equipo.id}`)
  } catch (e) { createError.value = e.message } finally { creating.value = false }
}
onMounted(() => { load(); window.addEventListener('keydown', keydown) })
onBeforeUnmount(() => window.removeEventListener('keydown', keydown))
</script>
<template>
  <div class="page-head"><div><span class="eyebrow">JUNTOS LLEGAMOS MÁS LEJOS</span><h1>Encuentra tu equipo<span class="accent">.</span></h1><p>Conoce a los equipos que hacen grande a nuestra comunidad.</p></div><button v-if="session.token" ref="createButton" class="button" @click="openModal">+ Crear equipo</button><RouterLink v-else class="button" to="/login">Ingresar para crear equipo</RouterLink></div>
  <div class="toolbar"><label for="buscar" class="sr-only">Buscar equipos</label><input id="buscar" v-model="search" class="search-input" type="search" placeholder="Buscar equipo, juego o capitán…"><span class="result-count">{{ filtered.length }} {{ filtered.length === 1 ? 'equipo' : 'equipos' }}</span></div>
  <p v-if="loading" class="loading-state" role="status">Cargando equipos…</p><div v-else-if="error" class="alert alert-error" role="alert">{{ error }} <button class="text-button" @click="load">Reintentar</button></div><div v-else-if="!filtered.length" class="panel empty-state"><span class="empty-icon" aria-hidden="true">◇</span><h2>{{ search ? 'No encontramos coincidencias' : 'La próxima historia comienza contigo' }}</h2><p>{{ search ? 'Prueba con otro nombre, juego o capitán.' : 'Crea el primer equipo y prepárate para competir.' }}</p></div><div v-else class="card-grid"><EquipoCard v-for="equipo in filtered" :key="equipo.id" :equipo="equipo" /></div>
  <Teleport to="body"><div v-if="modal" class="modal-backdrop" @click.self="closeModal"><section class="panel modal" role="dialog" aria-modal="true" aria-labelledby="crear-titulo"><div class="modal-head"><div><h2 id="crear-titulo">Tu próximo gran equipo</h2><p>Serás su capitán y primer integrante.</p></div><button class="icon-button" aria-label="Cerrar formulario" :disabled="creating" @click="closeModal">×</button></div><form @submit.prevent="create"><div class="field"><label for="equipo-nombre">Nombre del equipo</label><input id="equipo-nombre" ref="nameInput" v-model.trim="form.nombre" required minlength="2" maxlength="80" placeholder="Un nombre para representar"></div><div class="field"><label for="equipo-juego">Videojuego</label><input id="equipo-juego" v-model.trim="form.videojuego" required minlength="2" maxlength="80" placeholder="Ej. Valorant"></div><div class="field"><label for="equipo-descripcion">Acerca del equipo</label><textarea id="equipo-descripcion" v-model.trim="form.descripcion" maxlength="500" placeholder="Cuéntale a la comunidad quiénes son"></textarea></div><div class="field"><label for="equipo-integrantes">Integrantes (opcional)</label><input id="equipo-integrantes" v-model="form.integrantes" placeholder="Ej. 2, 3, 4"><small>IDs de usuarios existentes, separados por comas. Tu usuario se incluye automáticamente.</small></div><p v-if="createError" class="alert alert-error" role="alert">{{ createError }}</p><div class="form-actions"><button type="button" class="button button-secondary" :disabled="creating" @click="closeModal">Cancelar</button><button class="button" :disabled="creating">{{ creating ? 'Creando…' : 'Crear equipo' }}</button></div></form></section></div></Teleport>
</template>
