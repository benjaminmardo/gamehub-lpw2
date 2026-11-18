<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { api } from '../services/api'
const route = useRoute(), router = useRouter()
const editando = computed(() => Boolean(route.params.id))
const valoresIniciales = { nombre: '', videojuego: '', modalidad: 'LIGA', fechaInicio: '', cierreInscripcion: '', cupoMaximo: 8, estado: 'ABIERTO', permiteEmpate: true }
const form = reactive({ ...valoresIniciales })
const cargando = ref(false), guardando = ref(false), error = ref(''), disponible = ref(false)
function localDate(valor) { const d = new Date(valor); return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16) }
async function cargar() {
  disponible.value = false; error.value = ''
  if (!editando.value) { Object.assign(form, valoresIniciales); cargando.value = false; disponible.value = true; return }
  cargando.value = true
  try { const t = await api('/torneos/' + route.params.id); Object.assign(form, { nombre: t.nombre, videojuego: t.videojuego, modalidad: t.modalidad, fechaInicio: localDate(t.fechaInicio), cierreInscripcion: localDate(t.cierreInscripcion), cupoMaximo: t.cupoMaximo, estado: t.estado, permiteEmpate: t.permiteEmpate }); disponible.value = true }
  catch (e) { error.value = e.message }
  finally { cargando.value = false }
}
async function guardar() {
  error.value = ''
  if (new Date(form.cierreInscripcion) > new Date(form.fechaInicio)) { error.value = 'El cierre de inscripción debe ser anterior o igual al inicio.'; return }
  guardando.value = true
  try {
    const body = { ...form, nombre: form.nombre.trim(), videojuego: form.videojuego.trim(), cupoMaximo: Number(form.cupoMaximo), fechaInicio: new Date(form.fechaInicio).toISOString(), cierreInscripcion: new Date(form.cierreInscripcion).toISOString() }
    const t = await api(editando.value ? '/torneos/' + route.params.id : '/torneos', { method: editando.value ? 'PATCH' : 'POST', body })
    router.push('/torneos/' + t.id)
  } catch (e) { error.value = e.message }
  finally { guardando.value = false }
}
watch(() => route.params.id, cargar, { immediate: true })
</script>
<template>
  <section class="form-page">
    <RouterLink class="back-link" :to="editando ? '/torneos/' + route.params.id : '/torneos'">Volver a {{ editando ? 'detalle' : 'torneos' }}</RouterLink>
    <div class="page-head"><div><span class="eyebrow">ADMINISTRACIÓN</span><h1>{{ editando ? 'Edita la competencia.' : 'Crea la próxima competencia.' }}</h1><p>Define el juego, las fechas y las reglas del torneo.</p></div></div>
    <p v-if="cargando" class="panel loading-state" role="status">Cargando formulario…</p>
    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>
    <form v-if="disponible" class="panel" @submit.prevent="guardar">
      <div class="field"><label for="torneo-nombre">Nombre del torneo</label><input id="torneo-nombre" v-model="form.nombre" required minlength="2" maxlength="120" placeholder="Copa GameHub IPVG"></div>
      <div class="form-grid"><div class="field"><label for="torneo-juego">Videojuego</label><input id="torneo-juego" v-model="form.videojuego" required minlength="2" maxlength="80" placeholder="Valorant"></div><div class="field"><label for="torneo-modalidad">Modalidad</label><select id="torneo-modalidad" v-model="form.modalidad"><option value="LIGA">Liga</option><option value="ELIMINACION">Eliminación</option></select></div></div>
      <div class="form-grid"><div class="field"><label for="torneo-inicio">Inicio del torneo</label><input id="torneo-inicio" v-model="form.fechaInicio" type="datetime-local" required><small>Hora local de tu dispositivo.</small></div><div class="field"><label for="torneo-cierre">Cierre de inscripciones</label><input id="torneo-cierre" v-model="form.cierreInscripcion" type="datetime-local" required :max="form.fechaInicio || undefined"></div></div>
      <div class="form-grid"><div class="field"><label for="torneo-cupo">Cupo máximo de equipos</label><input id="torneo-cupo" v-model.number="form.cupoMaximo" type="number" min="2" max="256" step="1" required></div><div class="field"><label for="torneo-estado">Estado</label><select id="torneo-estado" v-model="form.estado"><option value="ABIERTO">Abierto</option><option value="EN_CURSO">En curso</option><option value="FINALIZADO">Finalizado</option><option value="CANCELADO">Cancelado</option></select></div></div>
      <label class="checkbox-field"><input v-model="form.permiteEmpate" type="checkbox"><span>Permitir empates en los resultados oficiales</span></label>
      <div class="form-actions"><RouterLink class="button button-secondary" :to="editando ? '/torneos/' + route.params.id : '/torneos'">Cancelar</RouterLink><button class="button" :disabled="guardando">{{ guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Publicar torneo' }}</button></div>
    </form>
  </section>
</template>
<style scoped>
.form-page{max-width:900px;margin:0 auto}.checkbox-field{display:flex;align-items:center;gap:.75rem;font-size:.9rem;padding:.5rem 0}.checkbox-field input{width:20px;height:20px;min-height:20px;accent-color:var(--violet);flex-shrink:0}
</style>
