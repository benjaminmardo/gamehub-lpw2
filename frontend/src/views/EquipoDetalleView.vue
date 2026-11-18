<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { api } from '../services/api'
import { isAdmin, session } from '../services/auth'
const route = useRoute(), router = useRouter()
const equipo = ref(null), loading = ref(true), error = ref(''), editing = ref(false), saving = ref(false), success = ref(''), actionError = ref('')
const form = reactive({ nombre: '', videojuego: '', descripcion: '', integrantes: '' })
const canManage = computed(() => equipo.value && session.token && (isAdmin.value || equipo.value.capitanId === session.usuario?.id))
async function load() {
 loading.value = true; error.value = ''
 try { equipo.value = await api(`/equipos/${route.params.id}`) }
 catch (e) { error.value = e.message }
 finally { loading.value = false }
}
function edit() { Object.assign(form, { nombre: equipo.value.nombre, videojuego: equipo.value.videojuego, descripcion: equipo.value.descripcion, integrantes: equipo.value.integrantes.map(u => u.id).join(', ') }); editing.value = true; actionError.value = ''; success.value = '' }
async function save() {
 saving.value = true; actionError.value = ''; success.value = ''
 try {
  const integranteIds = form.integrantes.trim() ? form.integrantes.split(',').map(id => Number(id.trim())) : []
  if (integranteIds.some(id => !Number.isInteger(id) || id < 1) || new Set(integranteIds).size !== integranteIds.length) throw new Error('Los integrantes deben ser IDs positivos, sin repetir y separados por comas.')
  equipo.value = await api(`/equipos/${equipo.value.id}`, { method: 'PATCH', body: { nombre: form.nombre, videojuego: form.videojuego, descripcion: form.descripcion, integranteIds } })
  editing.value = false; success.value = 'Los cambios de tu equipo se guardaron.'
 } catch (e) { actionError.value = e.message } finally { saving.value = false }
}
async function remove() {
 if (!window.confirm(`¿Eliminar el equipo "${equipo.value.nombre}"? Esta acción no se puede deshacer.`)) return
 saving.value = true; actionError.value = ''
 try { await api(`/equipos/${equipo.value.id}`, { method: 'DELETE' }); await router.push('/equipos') }
 catch (e) { actionError.value = e.message }
 finally { saving.value = false }
}
onMounted(load)
</script>
<template>
 <RouterLink class="back-link" to="/equipos">Volver a equipos</RouterLink>
 <p v-if="loading" class="loading-state" role="status">Cargando equipo…</p><div v-else-if="error" class="alert alert-error" role="alert">{{ error }} <button class="text-button" @click="load">Reintentar</button></div>
 <template v-else-if="equipo"><div class="page-head"><div><span class="eyebrow">EQUIPO DE LA COMUNIDAD</span><h1>{{ equipo.nombre }}<span class="accent">.</span></h1><p>Capitán: {{ equipo.capitan?.alias || equipo.capitan?.nombre }}</p></div><span class="badge">{{ equipo.videojuego }}</span></div>
 <p v-if="success" class="alert alert-success" role="status">{{ success }}</p><p v-if="actionError" class="alert alert-error" role="alert">{{ actionError }}</p>
 <div class="detail-grid"><section class="panel"><div class="section-head"><h2>{{ editing ? 'Editar equipo' : 'Acerca del equipo' }}</h2><button v-if="canManage && !editing" class="button button-secondary button-small" @click="edit">Editar equipo</button></div>
 <form v-if="editing" @submit.prevent="save"><div class="field"><label for="nombre">Nombre del equipo</label><input id="nombre" v-model.trim="form.nombre" required minlength="2" maxlength="80"></div><div class="field"><label for="videojuego">Videojuego</label><input id="videojuego" v-model.trim="form.videojuego" required minlength="2" maxlength="80"></div><div class="field"><label for="descripcion">Descripción</label><textarea id="descripcion" v-model.trim="form.descripcion" maxlength="500"></textarea></div><div class="field"><label for="integrantes">Integrantes</label><input id="integrantes" v-model="form.integrantes"><small>IDs existentes separados por comas. El capitán siempre permanece en el equipo.</small></div><div class="form-actions"><button type="button" class="button button-secondary" :disabled="saving" @click="editing = false">Cancelar</button><button class="button" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar cambios' }}</button></div></form>
 <template v-else><p class="detail-description">{{ equipo.descripcion || 'Este equipo todavía no agregó una descripción.' }}</p><dl class="profile-data"><div><dt>Videojuego</dt><dd>{{ equipo.videojuego }}</dd></div><div><dt>Creado el</dt><dd>{{ new Date(equipo.creadoEn).toLocaleDateString('es-CL') }}</dd></div></dl><div v-if="canManage" class="form-actions"><button class="button button-danger button-small" :disabled="saving" @click="remove">{{ saving ? 'Procesando…' : 'Eliminar equipo' }}</button></div></template></section>
 <section class="panel"><div class="section-head"><h2>La formación</h2><span class="badge badge-neutral">{{ equipo.integrantes.length }} jugadores</span></div><ul class="member-list"><li v-for="miembro in equipo.integrantes" :key="miembro.id"><span class="avatar">{{ (miembro.alias || miembro.nombre).slice(0,2).toUpperCase() }}</span><div><strong>{{ miembro.nombre }}</strong><small>@{{ miembro.alias }} · ID {{ miembro.id }}</small></div><span v-if="miembro.id === equipo.capitanId" class="badge badge-mint">Capitán</span></li></ul></section></div></template>
</template>
