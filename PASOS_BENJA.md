# Pasos de Benja para iniciar GameHub y compartir su trabajo

Tu responsabilidad es la base compartida, registro/login, perfil/permisos y equipos. El primer objetivo es integrar una base ejecutable para que Gian y Susana puedan comenzar. Después completas tus otros cuatro avances, compartiendo cada uno mediante PR.

Esta es una guía para ejecutar y programar paso a paso. Los comandos y ejemplos de aplicación de este archivo todavía no se han ejecutado ni incorporado como una aplicación. Al preparar esta guía, la carpeta solo tenía planificación: no había commits, aplicaciones ni remoto. Node.js, npm y Git estaban disponibles.

## 1. Crear el repositorio compartido

En GitHub:

1. Crear un repositorio llamado `gamehub-LPW2`, público según la pauta.
2. Activar la creación de README. Verificar que la rama inicial se llame `main`.
3. Crear el repositorio. Este commit administrativo inicial sirve de base para los PR; no cuenta como uno de tus cinco avances técnicos.
4. En la configuración de colaboradores, invitar las cuentas de Gian y Susana. Ellos deben aceptar la invitación.
5. Crear un proyecto/tablero con `Pendiente`, `En proceso` y `Terminado`.
6. Crear tus tarjetas: A1 Base; A2 Acceso; A3 Perfil y permisos; A4 Equipos; A5 Pruebas.

Referencia: [crear un repositorio en GitHub](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository).

## 2. Conectar tu carpeta y crear tu rama

Abrir una terminal PowerShell en el editor y ejecutar:

```powershell
Set-Location 'C:\Users\benja\OneDrive\Documentos\ChatGPT\gamehub-LPW2'
git config user.name "Tu nombre o nombre habitual en GitHub"
git config user.email "Tu correo asociado a GitHub"
git remote add origin https://github.com/TU_USUARIO/gamehub-LPW2.git
git fetch origin
git switch -c main --track origin/main
git switch -c codex/benja
```

Reemplazar `TU_USUARIO` por el propietario real y los datos personales por los tuyos. Estos comandos suponen el estado revisado: carpeta con Git inicializado, sin commits y sin remoto. Si ya conectaste el repositorio, revisar `git remote -v` y no repetir `remote add`.

Si GitHub solicita iniciar sesión, completar ese acceso. Comprobar:

```powershell
git branch --show-current
git status
```

La rama debe ser `codex/benja`. El README remoto y las guías locales deben conservarse.

## 3. Crear frontend y backend para A1

Desde la raíz:

```powershell
npm create vue@latest
```

Elegir `frontend` como nombre del proyecto, Vue Router y ESLint. Para simplificar este recorrido, usar JavaScript en Vue y no agregar JSX, Pinia ni herramientas adicionales que no vayan a utilizar. Si el generador ofrece instalar y ejecutar inmediatamente, pueden hacerlo después con los comandos de abajo.

Después, nuevamente desde la raíz:

```powershell
npx @nestjs/cli@11 new backend --package-manager npm --skip-git
```

Esta guía propone NestJS 11 con TypeORM 0.3 para mantener una base común y fija las versiones principales relacionadas. No mezclar paquetes Nest de distintas versiones principales. Nest usa TypeScript; Vue puede usar JavaScript. `--skip-git` evita crear otro repositorio dentro del backend.

Instalar dependencias:

```powershell
Set-Location backend
npm install @nestjs/config@4 @nestjs/typeorm@11 typeorm@0.3 mysql2
npm install class-validator class-transformer @nestjs/jwt@11 bcryptjs @nestjs/swagger@11
Set-Location ..\frontend
npm install
Set-Location ..
```

Los generadores pueden pedir autorización para descargar sus paquetes: aceptar cuando los ejecutes. Compartir ambos `package-lock.json` para que los tres instalen las mismas versiones resueltas.

Referencias: [inicio de Vue con Vite](https://vuejs.org/guide/quick-start) y [opciones de la CLI de Nest](https://docs.nestjs.com/cli/usages).

## 4. Preparar MySQL y los archivos de entorno

Abrir una conexión local en MySQL Workbench u otro cliente MySQL. Si todavía no tienes MySQL Server, instalarlo y preparar una cuenta local antes de continuar: Workbench por sí solo es un cliente.

Ejecutar en el editor SQL:

```sql
CREATE DATABASE gamehub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Crear `backend/.env.example` con:

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=gamehub
DB_SYNCHRONIZE=true
JWT_SECRET=
FRONTEND_ORIGIN=http://localhost:5173
```

Copiarlo como `backend/.env` y completar usuario y contraseña de tu conexión local y un secreto JWT aleatorio. No poner esos valores reales en el ejemplo. Puedes generar el secreto localmente con:

```powershell
node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))"
```

Crear `frontend/.env.example`:

```dotenv
VITE_API_URL=http://localhost:3000
```

Copiarlo como `frontend/.env`. Las copias se pueden hacer desde la raíz:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Hacerlo solo la primera vez: si ya completaste los `.env`, no sobrescribirlos con ejemplos vacíos.

Crear un `.gitignore` en la raíz con:

```gitignore
node_modules/
dist/
coverage/
**/.env
**/.env.*
!**/.env.example
*.log
```

Conservar también los `.gitignore` generados dentro de cada aplicación. Comprobar que sus reglas no oculten los ejemplos. Las contraseñas de MySQL y el secreto JWT solo pertenecen al backend.

## 5. Conectar Nest con MySQL

En `backend/src/app.module.ts`, conservar AppController/AppService y configurar los imports de esta forma:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.getOrThrow<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT', '3306')),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

En este recorrido se propone sincronización automática solo sobre la base local de desarrollo para que las entidades creen sus tablas. Mantener `DB_SYNCHRONIZE=false` en una base que deba preservar datos y usar migraciones para cambios controlados. El equipo debe documentar el mecanismo elegido para reproducir el esquema. Referencia: [MySQL y TypeORM en NestJS 11](https://docs.nestjs.com/v11/techniques/database).

Cuando agreguen entidades, registrar cada una mediante `TypeOrmModule.forFeature([Entidad])` en su módulo y añadir ese módulo a los imports de AppModule. `autoLoadEntities` no registra entidades que no estén importadas por los módulos.

## 6. Activar CORS, validación y Swagger

Configurar `backend/src/main.ts` así:

```typescript
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.getOrThrow<string>('FRONTEND_ORIGIN'),
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('GameHub IPVG')
    .setDescription('API para equipos y torneos internos')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app,
    SwaggerModule.createDocument(app, swaggerConfig));

  await app.listen(Number(config.get<string>('PORT', '3000')));
}

void bootstrap();
```

En `backend/src/app.controller.ts`, dentro de la clase existente y conservando su método original, agregar:

```typescript
@Get('salud')
salud() {
  return { estado: 'ok', aplicacion: 'GameHub IPVG' };
}
```

El decorador `Get` ya debería estar importado en el controller generado. Este endpoint servirá para comprobar la comunicación. Swagger inicialmente mostrará la base; cada integrante debe documentar después los DTO, permisos y respuestas de sus operaciones.

Referencias: [ValidationPipe](https://docs.nestjs.com/techniques/validation) y [Swagger en Nest](https://docs.nestjs.com/openapi/introduction).

## 7. Probar la comunicación desde Vue

Crear `frontend/src/services/api.js`:

```javascript
const baseUrl = import.meta.env.VITE_API_URL

export async function apiFetch(ruta, opciones = {}) {
  const respuesta = await fetch(`${baseUrl}${ruta}`, opciones)
  const datos = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    const mensaje = Array.isArray(datos?.message)
      ? datos.message.join(', ')
      : datos?.message
    throw new Error(mensaje || `Error HTTP ${respuesta.status}`)
  }
  return datos
}
```

Más adelante, en A2–A3, agregar el token Bearer a este cliente y manejar la sesión vencida. Los fallos de red rechazan la promesa y deben capturarse en las vistas.

Reemplazar el contenido inicial de `frontend/src/App.vue` por esta comprobación sencilla:

```vue
<script setup>
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import { apiFetch } from './services/api'

const cargando = ref(true)
const estado = ref('')
const error = ref('')

onMounted(async () => {
  try {
    const datos = await apiFetch('/salud')
    estado.value = datos.estado
  } catch (e) {
    error.value = e.message || 'No fue posible conectar con la API'
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <header><h1>GameHub IPVG</h1></header>
  <p v-if="cargando">Comprobando conexión...</p>
  <p v-else-if="error" role="alert">{{ error }}</p>
  <p v-else>Conexión con la API: {{ estado }}</p>
  <RouterView />
</template>
```

Esta vista es una comprobación del primer hito; luego la reemplazarás por navegación y vistas del sistema. El router generado debe seguir instalado en `main.js`.

Abrir dos terminales:

```powershell
# Terminal 1
Set-Location 'C:\Users\benja\OneDrive\Documentos\ChatGPT\gamehub-LPW2\backend'
npm run start:dev
```

```powershell
# Terminal 2
Set-Location 'C:\Users\benja\OneDrive\Documentos\ChatGPT\gamehub-LPW2\frontend'
npm run dev -- --port 5173 --strictPort
```

Comprobar en el navegador:

- `http://localhost:3000/salud`: devuelve JSON con estado `ok`.
- `http://localhost:3000/docs`: abre Swagger.
- `http://localhost:5173`: muestra `Conexión con la API: ok`.
- La terminal del backend no muestra errores de conexión a MySQL.

Si MySQL falla, revisar servidor iniciado, host, puerto, usuario, contraseña y existencia de `gamehub`. Si Vue falla, revisar ambas terminales, `VITE_API_URL` y CORS. Reiniciar Vite después de editar `.env`.

## 8. Guardar A1 y compartirlo mediante PR

Actualizar el README de la raíz: descripción, Benja/Gian/Susana, tecnologías, versiones, base de datos, archivos de entorno, comandos de ejecución, ruta Swagger y reparto. Registrar la decisión de usar Nest 11 y el mecanismo de creación de tablas.

Antes del commit, comprobar builds y tests iniciales:

```powershell
# Desde la raíz
npm --prefix backend run build
npm --prefix backend test -- --runInBand
npm --prefix frontend run build
git check-ignore backend/.env frontend/.env
git status --short
```

Los dos `.env` deben aparecer como ignorados. Los `.env.example` y los lockfiles deben poder incluirse. Revisar los mensajes y resolver cualquier fallo antes del PR. Los tests iniciales comprueban el ejemplo de Nest; en A5 agregarás pruebas del dominio.

Después de revisar el contenido de los archivos:

```powershell
git add .gitignore README.md GUIA_PROYECTO.md PASOS_BENJA.md backend frontend
git diff --staged --stat
git diff --staged
git commit -m "chore: configurar Vue NestJS MySQL y entorno del proyecto"
git push -u origin codex/benja
```

En GitHub abrir un PR de `codex/benja` hacia `main`, por ejemplo `Base inicial de GameHub`. Describir cómo ejecutar la base y cuáles comprobaciones hiciste. Relacionar A1 y pedir a Gian o Susana que lo revisen. Integrar con `Create a merge commit` para conservar el avance individual.

Este es tu primer commit técnico. El README inicial del repositorio y los commits de merge no sustituyen los cinco hitos.

## 9. Completar A2 a A5 con código propio de cada hito

La base ya se puede compartir tras A1. Para terminar toda tu responsabilidad todavía debes implementar los siguientes avances. La generación de archivos vacíos no completa un hito.

Antes de continuar, con cambios guardados y el árbol limpio:

```powershell
git fetch origin
git merge origin/main
```

### A2 Registro e inicio de sesión

En backend generar módulos, servicios y controllers:

```powershell
Set-Location backend
npx nest generate module usuarios
npx nest generate service usuarios
npx nest generate controller usuarios
npx nest generate module auth
npx nest generate service auth
npx nest generate controller auth
Set-Location ..
```

Implementar, en este orden:

1. Entidad Usuario con campos de la pauta, correo único, `passwordHash`, rol y activo. Usar `TypeOrmModule.forFeature([Usuario])`.
2. DTO de registro/login con validadores de correo y contraseña.
3. Servicio de registro con `bcryptjs.hash`, rol fijo `ESTUDIANTE` y respuesta sin el hash. Convertir correo duplicado en conflicto comprensible.
4. Servicio de login que compruebe usuario activo y `bcryptjs.compare`; emitir JWT con el ID del usuario y expiración. Leer secreto desde ConfigService.
5. Endpoints `POST /auth/registro` y `POST /auth/login`.
6. Vistas `RegistroView.vue` y `LoginView.vue`, formularios con `v-model`, validación y envío JSON con `fetch()`.
7. Estado de sesión compartido y cierre de sesión; ampliar `apiFetch` para adjuntar `Authorization: Bearer ...`. Elijan y documenten cómo guardan y restauran la sesión; no confíen en un rol enviado por el formulario.
8. Documentar DTO y autenticación en Swagger.

Comprobar: registro válido, correo repetido, contraseña incorrecta y login correcto. Hacer el segundo commit solo al terminar el flujo:

```powershell
git add backend/src frontend/src
git diff --staged
git commit -m "feat: implementar registro e inicio de sesion"
git push origin codex/benja
```

Si cambiaste dependencias, incluir también sus `package.json` y `package-lock.json`. Abrir PR, revisar, integrar y actualizar la rama personal.

### A3 Perfil y permisos

1. Implementar JwtAuthGuard que verifique firma/expiración del token y cargue el usuario activo desde MySQL.
2. Implementar RolesGuard y decorador de roles para proteger acciones administrativas. Exportar los componentes que necesiten los módulos de Gian y Susana.
3. Implementar `GET /usuarios/me` y `PATCH /usuarios/me` usando el ID verificado, sin aceptar un ID ajeno ni cambios de rol desde el cuerpo.
4. Crear `PerfilView.vue`; permitir editar nombre y alias con DTO específico.
5. Agregar rutas `/login`, `/registro` y `/perfil`; usar metadatos de rutas y un guard de Vue Router.
6. Manejar 401 cerrando la sesión local; mostrar permisos insuficientes cuando se reciba 403. Adaptar menú y acciones al usuario.
7. Crear un administrador mediante un proceso local de datos de prueba documentado; no agregar un registro público de administradores.

Comprobar desde Swagger y navegador: sin token se rechaza la operación protegida; un estudiante no obtiene permisos administrativos; modificar el perfil no cambia el rol. Compartir con Gian y Susana los nombres y uso de los Guards.

Tercer commit: `feat: agregar perfil y permisos por rol`. Repetir revisión, push y PR.

### A4 Equipos

Generar módulo, controller y service de equipos. Implementar:

1. Entidad Equipo con capitán y relación de integrantes con Usuario. Una tabla auxiliar muchos-a-muchos permite conservar las seis entidades principales.
2. DTO y endpoints para crear, listar, consultar, editar y gestionar miembros.
3. Al crear, obtener el capitán del usuario autenticado y agregarlo también como integrante.
4. Validar propiedad en NestJS: solo el capitán administra su equipo, salvo la excepción administrativa que acuerden. Impedir miembros duplicados y preservar al capitán como integrante.
5. Vistas de lista y detalle `/equipos/:id`, formulario y control de integrantes. Usar componentes con `props` y `emit` donde corresponda.
6. Mensajes de carga/error/éxito/vacío y manejo de equipo inexistente.
7. Confirmación antes de quitar integrantes. Documentar la política de eliminación o desactivación de equipos que ya estén inscritos.

Comprobar con dos estudiantes: uno administra su equipo y el otro recibe 403 al intentar editarlo mediante HTTP. Verificar persistencia al reiniciar la API.

Cuarto commit: `feat: implementar equipos con capitan e integrantes`. Compartir con Gian los campos y endpoints disponibles.

### A5 Pruebas y entrega de tus módulos

1. Agregar pruebas automáticas relevantes de registro/login, perfil y permisos/propiedad de equipos, usando repositorios simulados cuando corresponda.
2. Probar correo duplicado, contraseña incorrecta, usuario inactivo, token inválido, rol insuficiente y edición de equipo ajeno.
3. Preparar datos de usuarios, administrador, capitanes e integrantes sin credenciales reales en Git; coordinar el proceso de datos de prueba con los otros módulos.
4. Registrar pruebas manuales con pasos, resultado esperado, resultado obtenido y evidencia.
5. Completar Swagger y README y corregir los errores encontrados.
6. Ejecutar pruebas/builds y verificar una instalación limpia siguiendo el README.

Quinto commit: `test: verificar autenticacion permisos y equipos`. Abrir PR y solicitar revisión. Si necesitas más commits para corregir problemas reales, agrégalos.

## 10. Compartir con Gian y Susana

Compartir el enlace del repositorio y el PR que deban revisar. Para que trabajen sobre la base estable, esta debe quedar integrada en `main`; si aún está en revisión, aclarar que el enlace corresponde a una rama en revisión.

Después de A1, ellos podrán preparar sus módulos. Después de A3 dispondrán de los Guards compartidos, y después de A4 podrán utilizar equipos reales. No necesitan esperar a que termines todos los commits para comenzar.

Cada integrante clona en su propio equipo:

```powershell
git clone https://github.com/TU_USUARIO/gamehub-LPW2.git
Set-Location gamehub-LPW2
npm --prefix backend ci
npm --prefix frontend ci
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Después deben crear su base MySQL, completar sus `.env` locales y seguir los comandos del README para crear tablas y cargar datos de prueba. Antes de desarrollar, Gian crea `codex/gian` y Susana crea `codex/susana`, cada uno en su copia.

Para tu revisión final:

```powershell
git fetch origin
git log origin/main --no-merges --format="%h %an %s"
git status
```

Revisar que tus cinco avances técnicos aparecen integrados y que el README permite a otra persona ejecutar el sistema. El conteo por sí solo no demuestra trabajo: deben verse cambios progresivos y funcionales.

Lista de entrega de Benja:

- [ ] A1–A5 implementados, probados y relacionados con sus tarjetas.
- [ ] Cinco commits técnicos reales bajo tu identidad.
- [ ] PR revisados e integrados en `main` conservando commits.
- [ ] `.env` y `node_modules` fuera de Git; ejemplos y lockfiles incluidos.
- [ ] Acceso, perfil, permisos y equipos funcionan desde Vue y Swagger.
- [ ] Datos de prueba, esquema reproducible, pruebas y README actualizados.
- [ ] Gian y Susana pueden instalar la base e integrar sus módulos.
- [ ] Declaración del uso de IA y explicación individual del código preparado.

El cierre de commits indicado en la pauta es el lunes 23 de noviembre de 2026 a las 17:00. Hacer cada commit al completar un avance real, durante el trabajo.
