# Guía de trabajo para GameHub IPVG con tres integrantes

Este plan adapta la pauta de trabajo3.docx a tres personas. La solución será una SPA en Vue 3 que consume una API NestJS y guarda los datos en MySQL mediante TypeORM. Cada integrante desarrollará funcionalidades tanto en frontend como en backend y realizará cinco commits técnicos significativos y progresivos, integrados mediante Pull Requests.

La pauta habla de parejas: validen con el docente que acepta tres integrantes. La planificación de abajo asume que sí. La pauta exige **al menos cinco commits por integrante**, por lo que pueden agregar correcciones reales si las necesitan. No creen commits artificiales para alcanzar un número.

El límite indicado en la pauta es el **lunes 23 de noviembre de 2026 a las 17:00**. Este calendario toma esa hora como hora local de Chile, America/Santiago; verifiquen el criterio horario del curso si se encuentran en otro lugar. Dejen la versión integrada el día anterior.

## 1. Acordar el alcance antes de programar

Implementen una liga con programación manual de partidos. Mantengan las seis entidades obligatorias: Usuario, Equipo, Torneo, Inscripcion, Partido y Resultado. Docker no es obligatorio.

Acuerdos propuestos que deben registrar en el README:

- Roles: `ADMINISTRADOR` y `ESTUDIANTE`. El registro público siempre crea estudiantes. El administrador se crea con un proceso local de datos de prueba.
- El capitán administra su equipo y solicita su inscripción; el administrador acepta, rechaza o cancela inscripciones.
- Estados del torneo: `ABIERTO`, `EN_CURSO`, `FINALIZADO`, `CANCELADO`. Una fecha de cierre vencida también bloquea nuevas solicitudes.
- Estados de inscripción: `PENDIENTE`, `ACEPTADA`, `RECHAZADA`, `CANCELADA`. Pendientes y aceptadas reservan cupo; rechazar o cancelar libera el cupo. Definan si permiten reactivar la misma inscripción: nunca creen una segunda fila para la misma pareja torneo-equipo.
- Solamente los equipos con inscripción `ACEPTADA` pueden disputar partidos.
- Una inscripción aceptada con cualquier partido asociado, pendiente o finalizado, no puede rechazarse ni cancelarse. Así se preservan los participantes y resultados del ranking.
- Modalidad inicial: `LIGA`. Un campo adicional `permiteEmpate` permite declarar la regla de cada torneo. Victoria: 3 puntos; empate permitido: 1; derrota: 0. Si un videojuego no admite empates, rechacen puntajes iguales.
- Ranking ordenado por puntos, diferencia de puntaje y nombre del equipo como orden estable. El criterio debe estar documentado.
- Un resultado oficial por partido. La corrección actualiza ese resultado y vuelve a calcular el ranking desde los resultados guardados.
- La eliminación de un torneo sin actividad se permite con confirmación. Si tiene inscripciones o partidos asociados, la API responde con un conflicto y la interfaz explica el motivo; se puede cancelar el torneo.

Estos acuerdos son decisiones propuestas de implementación. La pauta no fija exactamente estos nombres de estados, puntos ni desempates.

## 2. Crear el repositorio y el tablero

1. Creen **un único repositorio público** en GitHub, por ejemplo `gamehub-LPW2`.
2. Inicialícenlo con un README mínimo para disponer de una rama `main` que sirva de base a los PR. Ese commit inicial de preparación no cuenta como uno de los cinco aportes técnicos de nadie. Todo el desarrollo posterior se realiza en ramas y entra por PR.
3. Agreguen a los tres integrantes como colaboradores. Cada uno usa su cuenta y configura su nombre y correo propios en su copia local.
4. Creen un tablero con `Pendiente`, `En proceso` y `Terminado`.
5. Creen las quince tarjetas A1–C5 descritas más abajo. Cada tarjeta tendrá responsable, alcance, criterio de aceptación y enlaces al commit y al PR. Pueden subdividirlas si lo necesitan.
6. Registren decisiones, bloqueos y cambios de alcance en `docs/bitacora.md` durante el trabajo.

En una carpeta de trabajo nueva, cada integrante clona el repositorio:

```powershell
git clone https://github.com/ORGANIZACION_O_USUARIO/gamehub-LPW2.git
cd gamehub-LPW2
git config user.name "Tu nombre real"
git config user.email "Tu correo asociado a GitHub"
git switch -c codex/benja
```

Reemplacen la URL por la real. Benja usará `codex/benja`, Gian usará `codex/gian` y Susana usará `codex/susana`.

La carpeta local revisada estaba vacía, con Git inicializado en `master`, sin commits y sin remoto. Si quieren reutilizar **esa carpeta**, después de crear el repositorio remoto con README pueden conectarla así, en lugar de volver a clonar:

```powershell
git remote add origin https://github.com/ORGANIZACION_O_USUARIO/gamehub-LPW2.git
git fetch origin
git switch -c main --track origin/main
git switch -c codex/benja
```

Esta guía es un archivo de planificación; no la cuenten como sustituto de un aporte técnico.

## 3. Repartir el trabajo por funcionalidades completas

Cada bloque indica qué programar, qué comprobar y el mensaje sugerido del commit. Hagan el commit cuando el avance correspondiente funcione; no ejecuten los quince mensajes al final. Los nombres se pueden adaptar sin cambiar el reparto.

### Benja — Acceso, perfil, equipos y base compartida

**A1 — Base ejecutable de ambas aplicaciones**

- Crear `frontend/` y `backend/`, conexión MySQL, configuración de entorno y `.gitignore`.
- Preparar CORS, validación global, Swagger, Router y un cliente compartido con `fetch()`.
- Acordar el modelo y las rutas con los otros dos integrantes. Preparar una vista que consulte un endpoint de comprobación de la API.
- Aceptación: ambas aplicaciones arrancan; Vue recibe una respuesta real de Nest; Swagger abre y la API se conecta a MySQL.
- Commit: `chore: configurar Vue NestJS MySQL y entorno del proyecto`.
- Abrir e integrar un primer PR pequeño con esta base para desbloquear al equipo.

**A2 — Registro e inicio de sesión**

- Entidad Usuario, correo único, DTO, registro, verificación del hash de contraseña y emisión de JWT.
- Formularios Vue de registro/login, mensajes de error, cierre de sesión y envío de token en operaciones protegidas.
- El registro ignora o rechaza la elección de un rol administrativo. Nunca devolver el hash de contraseña.
- Aceptación: usuario nuevo puede ingresar; contraseña incorrecta y correo repetido generan errores visibles; endpoint protegido rechaza un token inválido.
- Commit: `feat: implementar registro e inicio de sesion`.

**A3 — Perfil y autorización compartida**

- Consultar y editar nombre/alias del usuario autenticado; impedir cambiar el rol mediante el perfil.
- Guards de autenticación y roles, decorador de roles y navegación protegida en Vue.
- Menú y acciones visibles según permisos; manejo de sesión vencida.
- Aceptación: un estudiante no puede ejecutar una operación administrativa enviando HTTP directamente; perfil solo modifica al usuario autenticado.
- Commit: `feat: agregar perfil y permisos por rol`.
- Integrar este contrato de seguridad antes de incorporar acciones administrativas de otros módulos.

**A4 — Equipos con capitán e integrantes**

- Entidad Equipo, relación con capitán e integrantes y endpoints de creación, listado, detalle, edición y gestión de miembros.
- Vistas/formularios Vue y ruta `/equipos/:id`; controles de propiedad en el servicio NestJS.
- El creador queda como capitán e integrante; añadir miembros existentes sin duplicarlos. Un estudiante no puede administrar equipos ajenos.
- Aceptación: crear un equipo, añadir un integrante y consultar el detalle real desde MySQL; otra cuenta no puede editarlo.
- Commit: `feat: implementar equipos con capitan e integrantes`.

**A5 — Verificar acceso y equipos**

- Pruebas automáticas de autenticación, permisos y propiedad de equipos; corregir los errores encontrados.
- Datos de usuarios/equipos, manejo visible de errores y documentación de estos módulos en Swagger y README.
- Aceptación: pruebas pasan y los datos permiten probar con un administrador, capitanes y estudiantes.
- Commit: `test: verificar autenticacion permisos y equipos`.

### Gian — Torneos e inscripciones

**B1 — Gestión administrativa de torneos**

- Entidad Torneo, DTO, repositorio, servicio y CRUD REST; crear/editar/eliminar solo con rol administrador.
- Formularios y acciones Vue con validación y confirmación de eliminación.
- Aceptación: el administrador administra un torneo persistido; un estudiante recibe 403 al intentar modificarlo; la consulta sigue disponible a estudiantes.
- Commit: `feat: implementar gestion administrativa de torneos`.

**B2 — Catálogo y detalle con búsqueda y filtros**

- Listado, consulta por ID y ruta `/torneos/:id`.
- Búsqueda por texto y dos filtros combinables: videojuego y estado. Enviar los filtros a la API y aplicarlos conjuntamente.
- Mostrar carga, error, lista vacía y éxito; usar `computed` para un resumen de resultados y `v-show` en el panel de filtros.
- Aceptación: texto y ambos filtros funcionan al mismo tiempo; un ID inexistente informa 404 de forma comprensible.
- Commit: `feat: agregar catalogo y detalle de torneos con filtros`.

**B3 — Solicitud de inscripción**

- Entidad Inscripcion y relación entre Equipo y Torneo; acción Vue para el capitán.
- Comprobar duplicado, cierre de inscripción, estado del torneo y cupo en backend. Añadir restricción única sobre `(torneoId, equipoId)`.
- Comprobar el cupo dentro de una transacción que bloquee la fila del torneo; una validación aislada antes de insertar no protege contra solicitudes simultáneas.
- Aceptación: se crea una inscripción pendiente válida y se rechazan duplicados, torneo cerrado y cupo completo.
- Commit: `feat: implementar inscripcion de equipos a torneos`.

**B4 — Administración de inscripciones**

- Listado por torneo y cambios de estado autorizados para administrador; cancelación por el capitán según la política acordada.
- Panel Vue que muestre solicitudes, estado y cupos restantes.
- Rechazar transiciones incoherentes. Si una transición vuelve a reservar cupo, comprobarlo dentro de la misma transacción y bloqueo del torneo usados en B3. Impedir rechazar o cancelar una inscripción aceptada que ya tenga cualquier partido asociado, pendiente o finalizado.
- Aceptación: aceptar/rechazar/cancelar modifica correctamente la disponibilidad; solo los aceptados aparecen como elegibles al programar.
- Commit: `feat: agregar administracion de inscripciones`.

**B5 — Verificar torneos e inscripciones**

- Pruebas automáticas para duplicados, cupo y fecha de cierre; verificar también dos solicitudes concurrentes por el último cupo con MySQL.
- Datos de al menos dos torneos, inscripciones y consultas SQL de verificación; Swagger y documentación propia.
- Aceptación: los casos inválidos no dejan registros adicionales ni exceden el cupo.
- Commit: `test: verificar torneos cupos e inscripciones`.

### Susana — Partidos, resultados y ranking

**C1 — Programación de partidos**

- Entidad Partido, DTO, servicio y endpoints; formulario de programación y listado/calendario Vue.
- Solo administrador programa; exigir dos equipos distintos y aceptados en el mismo torneo.
- Aceptación: guardar y listar un partido válido; rechazar equipos iguales o no inscritos.
- Commit: `feat: implementar programacion de partidos`.

**C2 — Resultados oficiales**

- Entidad Resultado vinculada a Partido; puntajes enteros no negativos y un resultado por partido.
- Solo administrador registra; obtener `registradoPor` del token y calcular ganador/empate en el servidor.
- Formulario y visualización Vue; guardar resultado y marcar partido finalizado en una misma transacción.
- Aceptación: estudiante recibe 403, partido inexistente recibe 404 y empate no permitido se rechaza.
- Commit: `feat: registrar resultados oficiales`.

**C3 — Ranking automático**

- Endpoint de ranking por torneo, calculado exclusivamente desde resultados oficiales.
- Tabla Vue con partidos jugados, puntos, victorias, empates, derrotas y diferencia de puntaje; incluir equipos aceptados con cero partidos.
- Aceptación: los puntos coinciden con los resultados; no existe formulario para editar los puntos finales.
- Commit: `feat: calcular y mostrar ranking por torneo`.

**C4 — Detalle y actualización de partidos**

- Ruta `/partidos/:id`, detalle, reprogramación de partidos pendientes y corrección administrativa de resultados.
- Recalcular el ranking desde los resultados actualizados; no sumar dos veces el mismo partido.
- Aceptación: corregir un marcador modifica ganador y clasificación de manera coherente; mostrar error para ID inexistente.
- Commit: `feat: completar detalle y actualizacion de partidos`.

**C5 — Verificar resultados y clasificación**

- Pruebas automáticas de programación, empate, ganador, resultado duplicado y ranking antes/después de corregir un resultado.
- Datos de partidos/resultados, evidencia de pruebas manuales y documentación de sus endpoints.
- Aceptación: las pruebas pasan y existe un flujo de demostración desde inscripción hasta clasificación final.
- Commit: `test: verificar resultados ranking y flujo completo`.

Cada persona documenta y prueba su parte durante el desarrollo. Los commits A5, B5 y C5 consolidan pruebas y correcciones técnicas; no se limitan a cambiar textos. Los cinco commits son hitos mínimos: si una funcionalidad requiere más avances revisables, usen más commits.

## 4. Preparar el entorno y la estructura

Instalen Git, MySQL Server y una versión de Node.js compatible con el generador Vue elegido. Los tres deben usar las mismas versiones principales y conservar `package-lock.json`. Revisen el requisito vigente en la [guía oficial de Vue](https://vuejs.org/guide/quick-start).

El integrante 1 ejecuta desde la raíz, en su rama:

```powershell
npm create vue@latest
npx @nestjs/cli@latest new backend --package-manager npm --skip-git
```

En Vue, elijan `frontend` como nombre, Vue Router y ESLint; pueden usar JavaScript para simplificar, o TypeScript si ya lo manejan. Seleccionen solo herramientas que vayan a utilizar. `create-vue` genera la base con Vite; `--skip-git` evita un repositorio anidado en Nest. Referencias: [create-vue](https://github.com/vuejs/create-vue) y [CLI NestJS](https://docs.nestjs.com/cli/usages).

En `backend/` instalen las dependencias de la implementación propuesta:

```powershell
cd backend
npm install @nestjs/config @nestjs/typeorm typeorm mysql2
npm install class-validator class-transformer @nestjs/jwt bcryptjs @nestjs/swagger
cd ..
cd frontend
npm install
cd ..
```

Vue Router ya queda instalado si lo seleccionaron en `create-vue`. La implementación propuesta usa JWT con un Guard propio y `@nestjs/jwt`; no necesita Passport. Las versiones de los paquetes Nest deben ser compatibles con la versión generada: resuelvan cualquier incompatibilidad y compartan el lockfile, sin ignorar errores de dependencias.

Organicen el código de esta manera:

- `frontend/src/views/`: login, registro, perfil, equipos, torneos, partidos y ranking.
- `frontend/src/components/`: formularios, tarjetas, confirmaciones y mensajes reutilizables.
- `frontend/src/router/`: rutas y protección de navegación.
- `frontend/src/services/`: cliente HTTP y funciones por recurso.
- `backend/src/auth/`, `usuarios/`, `equipos/`, `torneos/`, `inscripciones/`, `partidos/`, `resultados/`.
- Dentro de cada módulo Nest: controller, service, DTO y entidad cuando corresponda.
- `backend/src/common/`: Guards, decorador de roles y utilidades compartidas.
- `docs/`: bitácora, pruebas manuales, evidencias y consultas SQL.

En MySQL creen la base:

```sql
CREATE DATABASE gamehub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Usen una cuenta local con permisos sobre esa base. En `backend/.env.example` documenten las variables sin credenciales reales:

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=gamehub
JWT_SECRET=
FRONTEND_ORIGIN=http://localhost:5173
```

En `frontend/.env.example`:

```dotenv
VITE_API_URL=http://localhost:3000
```

Cada integrante copia los ejemplos a `.env` y completa sus valores locales. El frontend nunca recibe credenciales MySQL ni el secreto JWT. Ignoren `.env`, `.env.*`, `node_modules/`, `dist/` y `coverage/`, pero permitan `!.env.example`. Verifiquen que tanto los ejemplos como el lockfile queden versionados.

Configuren `ConfigModule`, TypeORM con MySQL, `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform`, CORS para el origen de Vue y Swagger en `/docs` con autenticación Bearer. Documenten DTO, respuestas y endpoints protegidos. Referencias: [TypeORM en Nest](https://docs.nestjs.com/data/typeorm), [validación](https://docs.nestjs.com/techniques/validation) y [Swagger](https://docs.nestjs.com/openapi/introduction).

Definan un mecanismo reproducible para crear las tablas, por ejemplo migraciones TypeORM con instrucciones y scripts en el README. Los comandos de migración y de seed son scripts que el equipo debe implementar; no vienen automáticamente listos en el proyecto generado.

Ejecuten en dos terminales, desde sus respectivas carpetas:

```powershell
# Terminal 1, dentro de backend
npm run start:dev
```

```powershell
# Terminal 2, dentro de frontend
npm run dev
```

Para las siguientes instalaciones usen `npm ci` dentro de cada aplicación, con el lockfile ya integrado. Configuren Vite en el puerto acordado o ajusten CORS si cambia.

## 5. Acordar el modelo y el contrato de la API

Relaciones mínimas:

- Usuario: `id`, `nombre`, `alias`, `correo`, `passwordHash`, `rol`, `activo`. El nombre `passwordHash` justifica que no se guarda la contraseña en texto plano.
- Equipo: `id`, `nombre`, `capitanId`, `juegoPreferido`, `estado`. Capitán apunta a Usuario. Integrantes usan una relación muchos a muchos con Usuario y tabla auxiliar `equipo_integrantes`; las seis entidades principales se mantienen.
- Torneo: campos mínimos de la pauta y, si usan la propuesta, `permiteEmpate`.
- Inscripcion: `id`, `torneoId`, `equipoId`, `fecha`, `estado`. Índice único torneo-equipo.
- Partido: `id`, `torneoId`, `equipoLocalId`, `equipoVisitanteId`, `fechaHora`, `ronda`, `estado`.
- Resultado: `id`, `partidoId`, `puntajeLocal`, `puntajeVisitante`, `ganadorId` nullable para empate y `registradoPor`. `partidoId` es único y `registradoPor` referencia a Usuario.

Cada responsable implementa las entidades de su módulo. Acuerden sus nombres, tipos y relaciones al inicio para evitar dependencias incompatibles. Si necesitan importar una entidad de otro módulo, coordinen la integración de esa base antes de enviar el PR dependiente.

Contrato sugerido, sin prefijo global para coincidir con las URLs de los ejemplos:

- A: `POST /auth/registro`, `POST /auth/login`, `GET/PATCH /usuarios/me`, `GET/POST /equipos`, `GET/PATCH /equipos/:id`, `POST /equipos/:id/integrantes`, `DELETE /equipos/:id/integrantes/:usuarioId`.
- B: `GET/POST /torneos`, `GET/PATCH/DELETE /torneos/:id`, `GET/POST /torneos/:id/inscripciones`, `PATCH /inscripciones/:id`.
- C: `GET/POST /partidos`, `GET/PATCH /partidos/:id`, `POST/PATCH /partidos/:id/resultado`, `GET /torneos/:id/ranking`.
- Filtros de B: `GET /torneos?texto=liga&videojuego=VALORANT&estado=ABIERTO`.

GET de catálogo/detalles puede estar disponible para estudiantes. Las operaciones de administración del torneo requieren administrador. Definan de manera coherente si las consultas también requieren login y reflejen esa decisión en ambos lados.

Utilicen errores consistentes: 400 para datos inválidos, 401 para falta de autenticación, 403 para falta de permisos, 404 para recursos inexistentes y 409 para conflictos. La interfaz interpreta `response.ok`, muestra el mensaje y maneja fallos de red. Los Guards del frontend complementan los controles del backend.

Antes de modificar archivos compartidos como `app.module.ts`, router, menú o archivos de paquetes, avisen y actualicen la rama. A1 establece la base; luego cada responsable registra sus módulos y rutas en PR pequeños.

## 6. Hacer commits y Pull Requests durante el avance

Al completar una tarjeta:

1. Ejecutar las pruebas relevantes y probar el flujo en el navegador.
2. Revisar `git status` y `git diff`.
3. Añadir explícitamente los archivos correspondientes; comprobar `git diff --staged`. No subir secretos ni dependencias.
4. Crear el commit con el mensaje del hito y hacer push a la rama personal.
5. Abrir un PR hacia `main` con funcionalidad, tarjeta relacionada y comprobaciones realizadas. Otra persona revisa y prueba.
6. Integrar con **Create a merge commit**. Así se conservan los commits individuales; `Squash and merge` los combina en uno. Referencia: [estrategias de integración de GitHub](https://docs.github.com/en/pull-requests/reference/pull-request-merges).
7. Mover la tarjeta a `Terminado` cuando cumpla su criterio de aceptación y quede integrada.

Ejemplo, después de seleccionar archivos reales de la funcionalidad:

```powershell
git status
git diff --staged
git commit -m "feat: implementar registro e inicio de sesion"
git push -u origin codex/benja
```

Antes del siguiente hito, con el árbol de trabajo limpio, actualizar la rama personal:

```powershell
git fetch origin
git merge origin/main
```

Resuelvan cualquier conflicto, prueben y continúen. Los commits de merge no reemplazan los cinco avances técnicos. Pueden hacer varios PR por persona, incluidos PR que integren un solo hito. No esperen a completar las cinco tareas para compartir la base.

Para revisar aportes integrados al final:

```powershell
git fetch origin
git shortlog -sne --no-merges origin/main
git log origin/main --no-merges --format="%h %an <%ae> %s"
```

Revisen el contenido de los commits, no solo el conteo: el commit inicial administrativo puede aparecer en el resumen. Cada estudiante crea sus propios avances con su identidad real y puede explicar su código.

## 7. Orden y calendario de integración

El calendario es una propuesta a partir del miércoles 18 de noviembre; ajusten la carga a su disponibilidad sin dejar los commits para el último día.

1. **Miércoles 18:** acordar contrato, crear repositorio/tablero e integrar A1. B y C pueden preparar DTO, vistas y pruebas de sus módulos sobre el contrato acordado.
2. **Jueves 19:** integrar A2 y A3; avanzar A4 y B1–B2. La programación de partidos depende de equipos y torneos reales; C puede avanzar cálculo de ranking con pruebas sobre datos pequeños.
3. **Viernes 20:** integrar A4 y B3–B4; integrar C1 cuando existan las entidades y las inscripciones aceptadas. Comenzar C2.
4. **Sábado 21:** integrar C2–C4 y verificar el flujo completo. Actualizar Swagger, datos de prueba y documentación de cada módulo.
5. **Domingo 22:** completar A5, B5 y C5; probar desde una instalación limpia, corregir y dejar `main` estable.
6. **Lunes 23:** comprobar entrega, enlaces y defensa individual. Apunten a terminar antes de las 15:00 como margen propio; el cierre indicado en la pauta es a las 17:00.

No integren código que dependa de archivos todavía ausentes ni acciones administrativas sin protección. Se pueden desarrollar ramas en paralelo y esperar a que se integre su dependencia antes de abrir o aprobar el PR final.

## 8. Verificar la solución antes de entregar

Cada prueba manual debe registrar responsable, pasos, resultado esperado, resultado obtenido, fecha y evidencia. No marquen un caso como aprobado antes de ejecutarlo.

- [ ] Registro y login correcto/incorrecto; correo duplicado.
- [ ] Usuario sin sesión recibe 401; estudiante no puede administrar torneos ni resultados.
- [ ] Perfil y gestión de equipos, capitán e integrantes funcionan con permisos correctos.
- [ ] CRUD de torneos, confirmación de eliminación y manejo de relaciones existentes.
- [ ] Texto y dos filtros combinables; rutas dinámicas y recursos inexistentes.
- [ ] Duplicado, cupo máximo, cierre de inscripción y cambios de estado.
- [ ] Dos solicitudes concurrentes por el último cupo no exceden el máximo.
- [ ] Programación solo entre equipos diferentes y aceptados del mismo torneo.
- [ ] Resultados válidos, empate permitido/prohibido y rechazo de resultado duplicado.
- [ ] Ranking correcto, equipos sin partidos y corrección de un marcador sin duplicar puntos.
- [ ] Datos siguen disponibles tras reiniciar la API.
- [ ] Al detener la API, Vue muestra un error de comunicación útil.
- [ ] Carga, éxito, error y vacío son visibles; formularios validan antes de enviar.
- [ ] Swagger permite autenticarse con Bearer y ejecutar operaciones principales.

Pruebas automáticas mínimas recomendadas: servicios de inscripción, programación y ranking, más autenticación/permisos. Usen casos pequeños con valores esperados concretos, por ejemplo una victoria y un empate dan 4 puntos cuando la modalidad permite empatar. Los casos de concurrencia deben verificar el comportamiento con MySQL real.

Los proyectos generados permiten verificar backend y build; confirmen los scripts existentes en sus `package.json`:

```powershell
# Dentro de backend
npm test -- --runInBand
npm run build
```

```powershell
# Dentro de frontend
npm run build
```

Si conservan tests de ejemplo del generador, manténganlos coherentes con la aplicación. Añadan las pruebas funcionales de su dominio; no basta con el test inicial de Hello World.

En Vue verifiquen explícitamente: `props`, `emit`, `v-model`, `v-if/v-else`, `v-show` con un uso justificado, `v-for` con `:key`, `computed`, `ref`, `onMounted`, Router, rutas dinámicas y consumo con `fetch()`. Son contenidos requeridos por la pauta, no detalles opcionales.

Datos de demostración propuestos: dos torneos de videojuegos distintos, cuatro o más equipos, varios estudiantes/capitanes, administrador, inscripciones aceptadas y pendientes, partidos programados y partidos con resultados. Incluyan un torneo abierto y uno cerrado. Si deben repetir la demostración en otro día, documenten cómo preparar fechas válidas de prueba.

Cada integrante aporta los datos de su módulo; coordinen un único proceso que cree primero usuarios/equipos, luego torneos/inscripciones y finalmente partidos/resultados. Los scripts deben poder ejecutarse de manera documentada y no duplicar registros accidentalmente.

En `docs/verificacion.sql` incluyan consultas equivalentes a estas, adaptadas a los nombres reales de tablas:

```sql
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM equipos;
SELECT COUNT(*) FROM torneos;
SELECT torneoId, equipoId, estado FROM inscripciones;
SELECT torneoId, equipoLocalId, equipoVisitanteId, estado FROM partidos;
SELECT partidoId, puntajeLocal, puntajeVisitante, ganadorId FROM resultados;
```

## 9. Completar README y preparar la demostración

El README final debe incluir:

- Nombre, problema que resuelve e integrantes.
- Tecnologías/versiones y arquitectura Vue → NestJS → MySQL.
- Entidades, relaciones, roles y permisos.
- Instalación, configuración de MySQL, creación de tablas, datos de prueba y ejecución de ambas aplicaciones.
- Variables de entorno y acceso a Swagger.
- Principales endpoints y reglas de negocio, incluidos puntos, empates y cupos.
- Kanban, distribución, resumen de aportes por integrante y enlaces a PR.
- Pruebas realmente ejecutadas, resultados y evidencias o consultas SQL.
- Problemas encontrados y soluciones registradas durante el proceso.
- Declaración honesta del uso de inteligencia artificial y de cómo verificaron lo utilizado.

Demostración conjunta: estudiante inicia sesión → crea equipo → consulta y filtra torneos → capitán solicita inscripción → administrador acepta → programa un partido → registra resultado → se consulta el ranking actualizado. Muestren también una regla rechazada y un acceso administrativo denegado.

Cada integrante debe poder explicar sus endpoints, DTO, relaciones MySQL, componentes Vue, validaciones, pruebas y commits. Revisen juntos el flujo completo para comprender cómo se conectan los tres módulos.

Fuente principal: pauta local `C:\Users\benja\Downloads\trabajo3.docx`, revisada el 18 de noviembre de 2026. Las rutas, estados, políticas y mensajes de commit de esta guía son propuestas para cumplirla, no una transcripción literal de todas sus decisiones.
