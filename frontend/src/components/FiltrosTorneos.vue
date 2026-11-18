<script setup>
import { computed, ref } from 'vue'
const props = defineProps({ modelValue: { type: Object, required: true } })
const emit = defineEmits(['update:modelValue'])
const visible = ref(true)
const activos = computed(() => Object.values(props.modelValue).filter(Boolean).length)
function cambiar(campo, valor) { emit('update:modelValue', { ...props.modelValue, [campo]: valor }) }
function limpiar() { emit('update:modelValue', { q: '', videojuego: '', estado: '', modalidad: '', fecha: '' }) }
</script>
<template>
  <section class="panel filters" aria-label="Filtros de torneos">
    <div class="filter-top"><div><strong>Encuentra tu competencia</strong><span class="muted">{{ activos ? activos + ' filtros activos' : 'Combina los filtros para afinar tu búsqueda.' }}</span></div><button class="text-button" :aria-expanded="visible" aria-controls="torneo-filtros" @click="visible = !visible">{{ visible ? 'Ocultar filtros' : 'Mostrar filtros' }}</button></div>
    <div id="torneo-filtros" v-show="visible">
      <div class="field"><label for="filtro-texto">Buscar torneo o videojuego</label><input id="filtro-texto" type="search" :value="modelValue.q" maxlength="120" placeholder="Busca tu próximo desafío…" @input="cambiar('q', $event.target.value)"></div>
      <div class="filter-grid">
        <div class="field"><label for="filtro-juego">Videojuego exacto</label><input id="filtro-juego" :value="modelValue.videojuego" list="juegos-sugeridos" maxlength="80" placeholder="Todos los videojuegos" @input="cambiar('videojuego', $event.target.value)"><datalist id="juegos-sugeridos"><option>Valorant</option><option>League of Legends</option><option>Counter-Strike 2</option><option>EA Sports FC</option></datalist></div>
        <div class="field"><label for="filtro-estado">Estado</label><select id="filtro-estado" :value="modelValue.estado" @change="cambiar('estado', $event.target.value)"><option value="">Todos los estados</option><option value="ABIERTO">Abierto</option><option value="EN_CURSO">En curso</option><option value="FINALIZADO">Finalizado</option><option value="CANCELADO">Cancelado</option></select></div>
        <div class="field"><label for="filtro-modalidad">Modalidad</label><select id="filtro-modalidad" :value="modelValue.modalidad" @change="cambiar('modalidad', $event.target.value)"><option value="">Todas las modalidades</option><option value="LIGA">Liga</option><option value="ELIMINACION">Eliminación</option></select></div>
        <div class="field"><label for="filtro-fecha">Día de inicio (UTC)</label><input id="filtro-fecha" type="date" :value="modelValue.fecha" @change="cambiar('fecha', $event.target.value)"></div>
      </div>
      <button v-if="activos" class="text-button clear-filters" @click="limpiar">Limpiar filtros</button>
    </div>
  </section>
</template>
<style scoped>
.filters{margin-bottom:1.5rem}.filter-top{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;margin-bottom:1.5rem}.filter-top strong{display:block;font-size:1rem}.filter-top span{font-size:.8rem;display:block;margin-top:.4rem}.filter-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem}.filter-grid .field{margin-bottom:0}.clear-filters{margin-top:1rem;padding-left:0}@media(max-width:1100px){.filter-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:550px){.filter-grid{grid-template-columns:1fr}.filter-top{gap:.5rem}.filter-top .text-button{font-size:.75rem;white-space:nowrap}}
</style>
