# Entrega GameHub IPVG

La versión integrada se encuentra en `rama-susana`. `main` conserva el scaffold original `ac46200`; no se reescribió el historial remoto existente. Se continuó desde los dos primeros commits de Benjamín que ya estaban publicados.

## Hitos y ramas

Benjamín, cinco hitos sobre main:

1. `4de5306` Auth JWT (existente).
2. `8e500f8` Usuarios (existente).
3. `e16a7ad` Equipos y reparación de endpoints heredados, Passport y configuración de pruebas.
4. `369fd40` Login, registro, perfil y navegación protegida.
5. `52b67e4` Listado y detalle de equipos.

Gian, cinco hitos nuevos sobre rama-benjamin:

1. `0350c29` CRUD administrativo de torneos.
2. `01165e3` Inscripciones transaccionales.
3. `c932135` Filtros combinables de API.
4. `3fd472d` Vistas y formularios de torneos.
5. `721dab7` Filtros e inscripciones en Vue.

Susana, cinco hitos nuevos sobre rama-gian:

1. `5d39d40` Programación y validación de partidos.
2. `510e1e5` Resultados oficiales transaccionales.
3. `ec29289` Ranking y pruebas de puntos.
4. `f782a3c` Swagger completo, corrección de compilación y prueba integral MySQL.
5. `feat(frontend-partidos-ranking): vistas Partidos, Resultados y Ranking` (consultar el hash final con `git log -1 rama-susana`).

Las integraciones son avances rápidos: los commits de las ramas anteriores son ancestros, no nuevos aportes de la fase siguiente. Conteo reproducible:

```powershell
git rev-list --count main..rama-benjamin
git rev-list --count rama-benjamin..rama-gian
git rev-list --count rama-gian..rama-susana
```

Cada comando debe devolver 5. La identidad Git configurada se mantuvo en todos los commits; esta automatización no simula autorías de Gian ni Susana. Cada integrante debe revisar su código y cumplir la política académica de su curso sobre asistencia de IA.

## Reglas de negocio

- Registro público crea estudiantes; promoción de un administrador únicamente mediante script local.
- Solo capitán o administrador modifica equipos; el capitán siempre integra su equipo.
- Inscripciones se confirman automáticamente. El bloqueo pesimista de la fila del torneo serializa solicitudes y cambios de cupo. Un índice único impide duplicar la pareja torneo-equipo.
- Solo se inscribe antes del cierre y con torneo ABIERTO. No se puede reducir el cupo por debajo de los inscritos.
- Solo administrador programa partidos y registra resultados. Los equipos deben ser diferentes y tener inscripción CONFIRMADA en el mismo torneo.
- Resultado único por partido; ganador y registrador se calculan en el servidor. Guardar el resultado y finalizar el partido forman una sola transacción.
- Puntos: victoria 3, empate 1, derrota 0. Ranking calculado desde resultados oficiales; incluye inscritos sin partidos. Desempate por diferencia y luego nombre.
- La regla de empate se conserva desde que hay partidos programados.
- Las eliminaciones de equipos/torneos con dependencias se rechazan; el torneo puede cancelarse.
- Fechas persistidas/filtradas en UTC; formularios convierten desde hora local. El filtro de fecha selecciona el día UTC.
- La sesión Vue usa localStorage; no protege frente a JavaScript inyectado. En una publicación de producción se debe aplicar CSP, HTTPS y evaluar cookies HttpOnly. La API siempre vuelve a comprobar identidad y rol.

## Verificación reproducible

```powershell
npm --prefix backend run build
npm --prefix backend test -- --runInBand
npm --prefix frontend run build
npm --prefix backend run test:e2e
git diff --check
```

La prueba integral requiere MySQL local y `backend/.env` completo. Inicia una API temporal en el puerto 3100, crea datos con nombres exclusivos, verifica autorización, concurrencia del último cupo, partidos, resultados, empate, ranking, filtros y esquemas Swagger. Elimina exclusivamente esos datos al terminar y detiene su API. No ejecutarla contra una base de producción: el arranque usa la configuración local de sincronización del esquema.

La sincronización de TypeORM se reserva al desarrollo local. No se incluyen despliegue público, brackets automáticos ni corrección de resultados ya oficiales: el alcance es programación manual y un registro oficial por partido.

## Resultado de la verificación del 18 de noviembre de 2026

- Backend y frontend compilan correctamente.
- Jest: 12 suites y 59 pruebas aprobadas.
- Prueba integral: 51 comprobaciones HTTP/MySQL aprobadas; los datos de prueba fueron eliminados.
- Navegador: conexión real, catálogo, partidos y ranking vacíos, redirección de perfil a Login y mensaje de credenciales inválidas comprobados. La consola quedó sin errores en la revisión final.
- Se corrigieron reintentos de partidos, errores recuperables del guard y respuestas tardías del formulario de torneos antes de la compilación final.
- No se publicaron credenciales ni archivos `.env`. Los servidores usados para QA se detuvieron al finalizar.
