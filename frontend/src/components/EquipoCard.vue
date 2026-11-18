<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
const props = defineProps({ equipo: { type: Object, required: true } })
const initials = computed(() => props.equipo.nombre.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase())
</script>
<template><RouterLink :to="`/equipos/${equipo.id}`" class="panel team-card"><div class="team-card-top"><div class="team-emblem">{{ initials }}</div><span class="badge badge-neutral">{{ equipo.videojuego }}</span></div><div><h2>{{ equipo.nombre }}</h2><p>{{ equipo.descripcion || 'Un equipo listo para el próximo desafío.' }}</p></div><div class="team-card-foot"><span>{{ equipo.integrantes?.length || 0 }} integrantes</span><span>Cap. {{ equipo.capitan?.alias || equipo.capitan?.nombre }}</span></div></RouterLink></template>
