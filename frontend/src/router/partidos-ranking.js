export const partidosRankingRoutes = [
  { path: '/partidos', name: 'partidos', component: () => import('../views/PartidosView.vue'), meta: { title: 'Partidos', nav: 'Partidos', icon: '◬' } },
  { path: '/partidos/:id', name: 'partido-detalle', component: () => import('../views/PartidoDetalleView.vue'), meta: { title: 'Detalle del partido' } },
  { path: '/ranking', name: 'ranking', component: () => import('../views/RankingView.vue'), meta: { title: 'Ranking', nav: 'Ranking', icon: '✦' } },
]
