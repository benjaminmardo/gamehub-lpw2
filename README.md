# GameHub IPVG

Plataforma de torneos eSports con NestJS, TypeORM, MySQL, Passport/JWT y Vue 3.

## Instalación local

Requiere Node.js 22.12+ y MySQL iniciado. La base local se llama `gamehub_lpw2`.

```sql
CREATE DATABASE IF NOT EXISTS gamehub_lpw2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```powershell
npm --prefix backend ci
npm --prefix frontend ci
Copy-Item backend/.env.example backend/.env
```

Completar `DB_PASSWORD` y un `JWT_SECRET` aleatorio en `backend/.env` (no versionado). El usuario MySQL local acordado es `root`. `DB_SYNCHRONIZE=true` crea el esquema en la base de desarrollo: usarlo únicamente en una base local destinada a este proyecto. En entornos con datos que deban preservarse, desactivarlo y aplicar migraciones revisadas.

En dos terminales:

```powershell
npm --prefix backend run start:dev
npm --prefix frontend run dev -- --port 5173 --strictPort
```

Frontend: http://localhost:5173. API: http://localhost:3000. Swagger: http://localhost:3000/api.

## Verificación

```powershell
npm --prefix backend run build
npm --prefix backend test -- --runInBand
npm --prefix frontend run build
npm --prefix backend run test:e2e
```

## Contratos y permisos

- `POST /auth/registro`, `POST /auth/login`; el registro crea un `estudiante`.
- `GET /usuarios/perfil` requiere JWT; `GET /usuarios` requiere `admin`.
- Equipos: consultas públicas; creación autenticada; cambios y eliminación solo capitán o administrador. El capitán siempre es integrante. `integranteIds` contiene IDs de usuarios existentes.
- Las contraseñas se almacenan con bcrypt y nunca se devuelven en consultas o relaciones.

Para habilitar al administrador, registrar primero su cuenta en la aplicación y ejecutar localmente desde `backend/`: `node --env-file=.env scripts/admin.cjs correo@ejemplo.cl`. El registro público no permite elegir rol.

## Historial de entrega

Se conserva el scaffold existente en `main`. `rama-benjamin` agrega cinco hitos; `rama-gian` parte de esa base e incorpora cinco; `rama-susana` integra ambos y agrega sus cinco. La versión completa quedará en `rama-susana`. Las integraciones por avance rápido no agregan commits de merge.

Los commits usan la identidad Git real configurada. Las ramas organizan responsabilidades; no atribuyen automáticamente autoría a otras personas. Las guías `GUIA_PROYECTO.md` y `PASOS_BENJA.md` son referencias de planificación previas; para esta entrega rigen las ramas y mensajes del encargo actual. Se utilizó asistencia de IA para la implementación; cada integrante debe revisar y comprender su parte.

El detalle de hitos, reglas, conteos de commits y pruebas reproducibles está en [docs/entrega.md](docs/entrega.md). La prueba integral requiere MySQL y crea/elimina únicamente sus datos temporales; el puerto 3100 debe estar libre.
