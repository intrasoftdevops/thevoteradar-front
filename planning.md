# 📋 VoteRadar Frontend - Planning & Documentación Técnica

**Última actualización**: 2025-12-14 - Home robusto con dashboard integrado, pie chart, y WhatsApp templates mejorado

## 🎯 ¿Qué es VoteRadar?

**VoteRadar** es una plataforma web integral para la gestión, monitoreo y control de procesos electorales en tiempo real. Permite coordinar equipos distribuidos en diferentes zonas geográficas y puestos de votación.

---

## 🏗️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Angular** | 13.3.11 | Framework principal |
| **TypeScript** | 4.6.4 | Lenguaje de programación |
| **Bootstrap** | 5.1.3 | Framework CSS |
| **Tailwind CSS** | 3.4.18 | Utilidades CSS |
| **NgBootstrap** | 12.1.1 | Componentes Bootstrap para Angular |
| **DataTables** | 13.0.1 | Tablas con paginación y búsqueda |
| **SweetAlert2** | 11.4.8 | Alertas y modales |
| **RxJS** | 7.5.5 | Programación reactiva |
| **CryptoJS** | 4.1.1 | Encriptación de datos sensibles |
| **ngx-permissions** | 13.0.1 | Sistema de permisos |
| **ngx-lightbox** | 2.5.1 | Galería de imágenes |
| **ngx-dropzone** | 3.1.0 | Carga de archivos |
| **@auth0/angular-jwt** | 5.0.2 | Manejo de JWT |

---

## 🏛️ NUEVA ARQUITECTURA EVOLUTIVA (En progreso)

### Estado de Migración

| Fase | Descripción | Estado |
|------|-------------|--------|
| ✅ Fase 1 | Crear estructura base (core, shared, layout) | **COMPLETADA** |
| ✅ Fase 2 | Migrar servicios al CoreModule | **COMPLETADA** |
| ✅ Fase 3 | Crear SharedModule con componentes reutilizables | **COMPLETADA** |
| ✅ Fase 4 | Crear LayoutModule con menú dinámico | **COMPLETADA** |
| ✅ Fase 4.5 | Eliminar headers legacy y simplificar app.component | **COMPLETADA** |
| ⏳ Fase 5 | Migrar features a lazy loading (uno por uno) | Pendiente |

### Nueva Estructura de Carpetas

```
src/app/
├── core/                              # 🔐 Módulo singleton (solo en AppModule)
│   ├── core.module.ts                 # Providers, guards, interceptors
│   ├── models/                        # Modelos tipados
│   │   ├── user.model.ts              # Roles, usuarios, permisos (enum UserRole)
│   │   ├── tenant.model.ts            # Multi-tenancy (DOMAIN_TENANT_MAP)
│   │   ├── theme.model.ts             # Temas y colores (THEMES)
│   │   └── index.ts
│   ├── services/                      # ✅ Servicios core
│   │   ├── auth.service.ts            # Autenticación centralizada
│   │   ├── tenant.service.ts          # Manejo de multi-tenancy
│   │   └── index.ts
│   ├── interceptors/                  # ✅ Interceptors mejorados
│   │   ├── tenant.interceptor.ts      # Agrega X-Tenant-ID
│   │   ├── auth.interceptor.ts        # Agrega Bearer token
│   │   └── index.ts
│   └── index.ts
│
├── shared/                            # 🧩 Componentes reutilizables
│   ├── shared.module.ts               # Exports de componentes y módulos
│   ├── pipes/                         # ✅ Pipes reutilizables
│   │   ├── role-name.pipe.ts          # {{ 1 | roleName }} → "Administrador"
│   │   ├── truncate.pipe.ts           # {{ text | truncate:50 }}
│   │   ├── safe-html.pipe.ts          # [innerHTML]="html | safeHtml"
│   │   └── index.ts
│   └── index.ts
│
├── layout/                            # 🎨 Layouts ✅ IMPLEMENTADO
│   ├── layout.module.ts
│   ├── admin-layout/                  # ✅ Layout principal para admin (sidebar moderno)
│   │   ├── admin-layout.component.ts/html/scss
│   ├── main-layout/                   # Layout con sidebar + header (legacy)
│   │   ├── main-layout.component.ts/html/scss
│   ├── public-layout/                 # Layout sin auth (encuestas, login)
│   │   ├── public-layout.component.ts/html/scss
│   └── components/
│       ├── sidebar-menu/              # ✅ Sidebar moderno con módulos
│       ├── sidebar/                   # Barra lateral (legacy)
│       ├── header/                    # Barra superior con branding (legacy)
│       └── role-menu/                 # ✅ MENÚ DINÁMICO por rol
│
├── features/                          # 📦 Feature Modules con lazy loading (TODO)
│   └── .gitkeep                       # Pendiente de implementar
│
├── components/                        # 📁 LEGACY (migrar gradualmente)
│   └── ...                            # Componentes actuales por rol
│
└── services/                          # 📁 LEGACY (migrar a core/)
```

### Path Aliases Configurados (tsconfig.json)

```typescript
import { User } from '@core/models';        // En lugar de '../../../core/models'
import { SharedModule } from '@shared';      // En lugar de '../shared/shared.module'
import { environment } from '@env/environment';
```

| Alias | Ruta |
|-------|------|
| `@core/*` | `src/app/core/*` |
| `@shared/*` | `src/app/shared/*` |
| `@features/*` | `src/app/features/*` |
| `@models/*` | `src/app/core/models/*` |
| `@services/*` | `src/app/services/*` |
| `@guards/*` | `src/app/guards/*` |
| `@env/*` | `src/environments/*` |

### Modelos Tipados Creados

**UserRole** (core/models/user.model.ts):
```typescript
enum UserRole {
  ADMIN = 1,
  GERENTE = 2,
  SUPERVISOR = 3,
  COORDINADOR = 4,
  TESTIGO = 5,
  ADMIN_IMPUGNACIONES = 7,
  IMPUGNADOR = 8,
}
```

**Tenant** (core/models/tenant.model.ts):
- Mapeo de dominios a tenant IDs
- Funciones helper: `getTenantFromHostname()`, `getThemeForTenant()`

**Theme** (core/models/theme.model.ts):
- Definición de colores y branding
- Funciones helper: `getThemeById()`, `applyThemeToDOM()`

---

## 📁 Estructura del Proyecto (LEGACY)

```
src/
├── app/
│   ├── components/                    # Componentes organizados por rol
│   │   ├── Admin/                     # Componentes de Administrador (rol: 1)
│   │   │   ├── admin-home/            # Dashboard principal admin
│   │   │   ├── backoffice/            # Panel de backoffice
│   │   │   │   ├── admin-dashboard-page/
│   │   │   │   ├── admin-users-management-page/
│   │   │   │   └── admin-rankings-page/
│   │   │   ├── surveys/               # Sistema de encuestas
│   │   │   │   ├── survey-dashboard/
│   │   │   │   ├── survey-builder/
│   │   │   │   ├── survey-analytics/
│   │   │   │   ├── survey-responses/
│   │   │   │   └── recipients-modal/
│   │   │   ├── whatsapp/              # Integración WhatsApp
│   │   │   │   ├── whatsapp-templates-dashboard/
│   │   │   │   └── send-template-modal/
│   │   │   ├── crear-gerente/
│   │   │   ├── editar-gerente/
│   │   │   ├── consultar-gerente/
│   │   │   ├── crear-supervisor-admin/
│   │   │   ├── crear-coordinador-admin/
│   │   │   ├── crear-testigo-admin/
│   │   │   ├── ver-equipo-admin/
│   │   │   ├── ver-puesto-admin/
│   │   │   ├── cambiar-rol-gerente/
│   │   │   └── menu-admin/
│   │   │
│   │   ├── Gerente/                   # Componentes de Gerente (rol: 2)
│   │   │   ├── gerente-home/
│   │   │   ├── crear-supervisor/
│   │   │   ├── editar-supervisor/
│   │   │   ├── consultar-supervisor/
│   │   │   ├── crear-coordinador-gerente/
│   │   │   ├── crear-testigo-gerente/
│   │   │   ├── ver-equipo-gerente/
│   │   │   ├── ver-puesto-gerente/
│   │   │   └── menu-gerente/
│   │   │
│   │   ├── Supervisor/                # Componentes de Supervisor (rol: 3)
│   │   │   ├── supervisor-home/
│   │   │   ├── crear-coordinador/
│   │   │   ├── editar-coordinador/
│   │   │   ├── consultar-coordinador/
│   │   │   ├── crear-testigo-supervisor/
│   │   │   ├── ver-equipo-supervisor/
│   │   │   ├── ver-puesto-supervisor/
│   │   │   └── menu-supervisor/
│   │   │
│   │   ├── Coordinador/               # Componentes de Coordinador (rol: 4)
│   │   │   ├── coordinador-home/
│   │   │   ├── crear-testigo/
│   │   │   ├── editar-testigo/
│   │   │   ├── consultar-testigo/
│   │   │   ├── ver-equipo-coordinador/
│   │   │   ├── ver-puesto-coordinador/
│   │   │   ├── reporte-votos-coordinador/
│   │   │   ├── reporte-incidencias-coordinador/
│   │   │   └── menu-coordinador/
│   │   │
│   │   ├── Testigo/                   # Componentes de Testigo (rol: 5)
│   │   │   ├── testigo-home/
│   │   │   ├── reporte-votos-testigo/
│   │   │   ├── reporte-incidencias/
│   │   │   └── menu-testigo/
│   │   │
│   │   ├── AdministradorImpugnaciones/ # Rol: 7
│   │   │   ├── home/
│   │   │   ├── impugnaciones/
│   │   │   └── menu-administrador-impugnaciones/
│   │   │
│   │   ├── Impugnador/                # Rol: 8
│   │   │   ├── impugnador-home/
│   │   │   ├── impugnar/
│   │   │   └── menu-impugnador/
│   │   │
│   │   ├── public/                    # Componentes públicos (sin auth)
│   │   │   ├── survey-landing/        # Landing de encuestas
│   │   │   └── short-link-redirect/   # Redirección de links cortos
│   │   │
│   │   ├── shared/                    # Componentes compartidos
│   │   │   └── theme-selector/        # Selector de temas
│   │   │
│   │   ├── login/                     # Componente de login
│   │   ├── editarPerfil/              # Edición de perfil
│   │   ├── contactos/                 # Gestión de contactos
│   │   ├── loading/                   # Componente de loading
│   │   ├── footer/                    # Footer de la app
│   │   ├── forbidden/                 # Página 403
│   │   └── dropdown-menu-users/       # Menú dropdown
│   │
│   ├── services/                      # Servicios de la aplicación
│   │   ├── api/                       # ApiService - Comunicación con backend principal
│   │   ├── backoffice-admin/          # BackofficeAdminService - API de backoffice
│   │   ├── backoffice-auth/           # BackofficeAuthService - Auth de backoffice
│   │   ├── survey/                    # SurveyService - Sistema de encuestas
│   │   ├── whatsapp-templates/        # WhatsAppTemplatesService - Integración WhatsApp
│   │   ├── theme/                     # ThemeService - Sistema de temas multi-tenant
│   │   ├── localData/                 # LocalDataService - Manejo de localStorage encriptado
│   │   ├── alert/                     # AlertService - SweetAlert2
│   │   ├── loader/                    # LoaderService - Control de loading
│   │   ├── file-download/             # FileDownloadService - Descarga de archivos
│   │   ├── inactivity/                # InactivityService - Cierre por inactividad
│   │   ├── validations/               # ValidationsService - Validaciones de formularios
│   │   └── dev-data/                  # DevDataService - Datos de prueba en desarrollo
│   │
│   ├── guards/                        # Guards de rutas
│   │   ├── AuthGuard/                 # Protección de rutas autenticadas
│   │   ├── LogoutGuard/               # Redirección si ya está logueado
│   │   └── ShortCodeGuard/            # Validación de short links
│   │
│   ├── interceptors/                  # HTTP Interceptors
│   │   ├── loader-interceptor.service.ts         # Mostrar loading automático
│   │   ├── backoffice-tenant-interceptor.service.ts # Header X-Tenant-ID
│   │   └── survey-domain-interceptor.service.ts  # Header para encuestas
│   │
│   ├── models/                        # Modelos e interfaces
│   │   ├── theme.model.ts             # Definición de temas
│   │   └── filtro.ts                  # Modelo de filtros
│   │
│   ├── app.module.ts                  # Módulo principal
│   ├── app-routing.module.ts          # Rutas de la aplicación
│   └── app.component.ts               # Componente raíz
│
├── environments/                       # Configuraciones por entorno
│   ├── environment.ts                 # Base
│   ├── environment.development.ts     # Desarrollo
│   ├── environment.prod.ts            # Producción
│   └── environment.example.ts         # Ejemplo/template
│
├── assets/                            # Recursos estáticos
│   ├── clients/                       # Logos por cliente/tenant
│   ├── logo.png                       # Logo por defecto
│   └── loading.gif                    # Animación de carga
│
└── styles.scss                        # Estilos globales
```

---

## 🔐 Sistema de Roles

| Rol ID | Nombre | Permisos |
|--------|--------|----------|
| **1** | Administrador | Gestión completa del sistema, todos los usuarios |
| **2** | Gerente | Supervisión de departamentos y municipios |
| **3** | Supervisor | Coordinación de zonas de votación |
| **4** | Coordinador | Gestión directa de puestos y testigos |
| **5** | Testigo | Reportes de votos e incidencias en campo |
| **7** | Admin Impugnaciones | Administrar impugnaciones |
| **8** | Impugnador | Crear impugnaciones |

---

## 🌐 Sistema Multi-Tenant

### Flujo de Detección

```
Usuario accede → window.location.hostname
       ↓
ThemeService.getTenantIdFromDomain()
       ↓
domainTenantMap[hostname] → tenant_id
       ↓
tenantThemeMap[tenant_id] → theme_id
       ↓
THEMES[theme_id] → Aplica colores y branding
       ↓
BackofficeTenantInterceptor → Header X-Tenant-ID
```

### Mapeo de Dominios (en theme.service.ts)

```typescript
const domainTenantMap = {
  'daniel-quintero.localhost': 'tenant_id_1',
  'juan-duque.localhost': 'tenant_id_2',
  'potus-44.localhost': 'tenant_id_3',
  // Producción:
  'cliente1.voteradar.com': 'tenant_id_1',
};
```

### Temas Disponibles (en theme.model.ts)

| Theme ID | Nombre | Colores |
|----------|--------|---------|
| `default` | VoteRadar | Morado (#64248b) |
| `daniel-quintero` | Daniel Quintero | Azul/Amarillo (#0032fd, #ffef03) |
| `juan-duque` | Juan Duque | Verde (#10b981) |
| `potus-44` | Potus 44 | Rojo (#ef4444) |

---

## 🔑 Almacenamiento Local (Encriptado con CryptoJS)

| Key | Contenido | Encriptación |
|-----|-----------|--------------|
| `keyA` | Token JWT | AES con `environment.key1` |
| `keyB` | Rol del usuario | AES con `environment.key2` |
| `keyC` | ID del usuario | AES con `environment.key3` |
| `backoffice_token` | Token de backoffice | AES con `environment.key1` |
| `backoffice_user` | Info de usuario backoffice | AES con `environment.key2` |
| `tenant_id` | ID del tenant (sin encriptar) | - |
| `app-theme` | Tema seleccionado (sin encriptar) | - |

---

## 🔌 APIs y Endpoints

### 1. API Principal (ApiService)
- **URL**: `environment.apiURL`
- **Endpoints**: CRUD de usuarios, reportes, incidencias, votos, impugnaciones

### 2. API Backoffice (BackofficeAdminService)
- **URL**: `environment.backofficeApiURL`
- **Endpoints**: Dashboard, usuarios, rankings, analytics

### 3. API Encuestas (SurveyService)
- **URL**: `environment.surveyApiURL`
- **Endpoints**: Surveys, responses, analytics

---

## 📱 Funcionalidades Principales

### ✅ Implementadas
- [x] Sistema de autenticación JWT
- [x] Roles y permisos jerárquicos
- [x] Reportes de votos en tiempo real
- [x] Gestión de incidencias
- [x] Sistema de impugnaciones
- [x] Multi-tenancy por dominio
- [x] Temas personalizados por cliente
- [x] Carga de archivos e imágenes
- [x] Galería con lightbox
- [x] DataTables con paginación
- [x] Loading automático en peticiones HTTP
- [x] Cierre de sesión por inactividad
- [x] Sistema de encuestas (surveys)
- [x] Backoffice administrativo
- [x] Integración WhatsApp templates
- [x] Short links para encuestas

### 🔧 Pendientes/En Desarrollo
- [ ] (Agregar aquí nuevas tareas)

---

## 🧪 Modo Desarrollo

Cuando `environment.development = true`:

- Usuarios de prueba disponibles en login
- Login automático sin API real
- Datos mock disponibles

### Usuarios de Prueba

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Admin | `admin` | `admin123` |
| Gerente | `gerente` | `gerente123` |
| Supervisor | `supervisor` | `super123` |
| Coordinador | `coord` | `coord123` |
| Testigo | `testigo` | `test123` |
| Impugnador | `impugnador` | `imp123` |

---

## 🚀 Comandos Útiles

```bash
# Desarrollo
ng serve                           # Puerto 4200
ng serve --port 4300               # Puerto personalizado
ng serve --host 0.0.0.0            # Accesible desde red local

# Build
ng build                           # Desarrollo
ng build --configuration production # Producción

# Pruebas
ng test                            # Unit tests
ng test --code-coverage            # Con cobertura

# Generar componentes
ng generate component components/NombreComponente
ng generate service services/NombreServicio
```

---

## 🏠 Panel de Inicio (Admin Home) - `/panel/inicio`

### Descripción
Dashboard principal del administrador que muestra un resumen ejecutivo de la plataforma con información clave en tiempo real.

### Funcionalidades Implementadas

#### 1. **Líderes Activos** (Top 5 del Ranking)
- Muestra los 5 usuarios con más puntos del ranking global
- Integración con `BackofficeAdminService.getGlobalRanking()`
- Muestra posición, nombre y puntos de cada líder
- Botón "Ver todos" que navega a `/panel/estructura`

#### 2. **Retos Activos (Challenges)**
- Muestra los 3 challenges más recientes con estado `active`
- Integración con `ApiService.getMyChallenges()` → `/challenges/my-challenges`
- Muestra:
  - Título y descripción del challenge
  - Número de participantes (`max_users`)
  - Puntos de recompensa (`puntos`)
  - Fecha de finalización (`max_date`)
  - Estado (badge "Activo")
- **Empty State**: Si no hay challenges, muestra un mensaje invitando a crear el primer reto
- Botón "Ver todos" que navega a `/panel/activacion`

#### 3. **Encuestas Recientes**
- Muestra las 3 encuestas más recientes
- Integración con `SurveyService.getSurveys()`
- Muestra:
  - Título y descripción
  - Fecha de creación
  - Número de respuestas (`recipients_count`)
- **Empty State**: Si no hay encuestas, muestra un mensaje invitando a crear la primera encuesta
- Botón "Ver todas" que navega a `/panel/encuestas`
- Click en una encuesta navega a `/panel/encuestas/analytics/:surveyId`

#### 4. **Banner Día Electoral**
- Banner promocional con gradiente usando colores del tema
- Muestra "Próximamente" con badge
- Preparado para futura implementación del módulo de monitoreo en tiempo real

### Estructura de Datos

#### Challenge API Response
```typescript
{
  "name": "string",
  "description": "string",
  "max_limit": 0,
  "reward_id": "string",
  "max_users": 0,
  "status": "active" | "completed" | "upcoming",
  "max_date": "2025-12-14T23:59:59Z",
  "puntos": 0,
  "challenge_id": "string",
  "date_creation": "2025-12-14T17:03:22.030565Z",
  "creator_phone": "string"
}
```

### Navegación
- **Logo/Título "Vote Radar"** en el sidebar → Navega a `/panel/inicio`
- **Botones "Ver todos/todas"** → Navegan a sus respectivas secciones
- **Click en encuesta** → Navega a analytics de la encuesta

### Estilos
- Usa variables CSS del tema (`--color-primary`, `--color-accent`, `--color-secondary`)
- Diseño responsive con Bootstrap Grid
- Cards con sombras y bordes redondeados
- Empty states con iconos y mensajes claros

---

## 📝 Variables de Entorno (environment.ts)

```typescript
export const environment = {
  production: false,
  development: true,
  apiURL: 'http://localhost:8000/api',        // Backend principal
  backofficeApiURL: 'https://...',            // API Backoffice
  surveyApiURL: 'http://localhost:8001',      // API Encuestas
  defaultTenantId: 'xxx',                     // Tenant por defecto
  key1: 'xxx',                                // Encriptación token
  key2: 'xxx',                                // Encriptación rol
  key3: 'xxx',                                // Encriptación ID
  key4: 'xxx',                                // Encriptación IDs externos
  powerBiURL: 'https://...',                  // Dashboard Power BI
};
```

---

## 📅 Historial de Cambios

| Fecha | Descripción |
|-------|-------------|
| 2025-12-15 | **ACTIVACIÓN (Retos)**: Fix de CTAs en cards de retos |
| | - **Regla UX**: *1 CTA = 1 modal visible* (se cierra cualquier modal abierto antes de abrir el siguiente) |
| | - Se agregó el render del modal faltante **Usuarios asignados** (`app-assigned-users-modal`) en `ChallengesDashboardComponent` |
| | - Impacto: evita confusión de usuario (“todos los botones abren lo mismo”) y elimina overlays apilados |
| 2025-12-15 | **ACTIVACIÓN (Retos)**: Fix de modales “corridos” (aparecían abajo o desalineados) |
| | - Se unificó el patrón de modales (Crear/Editar/Asignar/Confirmar/Usuarios) a: **overlay fijo + centrado + scroll + click afuera cierra** |
| | - Se eliminó el CSS que forzaba `.modal-dialog` con `position: fixed` y `transform`, porque podía romper el centrado |
| | - Impacto: UX consistente y evita “modales por allá debajo” en pantallas grandes/pequeñas |
| 2025-12-15 | **ACTIVACIÓN (Retos)**: Selector de usuarios del sistema en “Asignar Reto” |
| | - En `assignType = user` se agregó un **picker de usuarios** (lista + búsqueda client-side + “cargar más” con cursor) usando `/super-admin/users` |
| | - Al seleccionar un usuario, se autocompleta `userPhone` y se muestra el “usuario seleccionado” |
| | - Impacto: reduce errores por copiar/pegar teléfonos y acelera la asignación 1-a-1 |
| 2025-12-15 | **SIDEBAR**: Permitir cerrar menús aunque estén “activos” |
| | - Se eliminó el bloqueo que impedía colapsar un menú si tenía una ruta hija activa (causaba “lo despliego y después no se cierra”) |
| | - Se agregó `manuallyCollapsedMenus` para respetar el colapso manual y evitar que `detectActiveMenu()` reabra automáticamente el menú |
| | - Impacto: UX predecible, el usuario manda (expandir/cerrar) sin pelear con la auto-detección de ruta |
| 2025-12-15 | **ESTRUCTURA > USUARIOS**: Dashboard arriba (complementario) |
| | - Se embebió el dashboard de `/panel/estructura/dashboard` arriba de la gestión de usuarios (`/panel/estructura/usuarios`) |
| | - Se agregó modo `compact` a `AdminDashboardPageComponent` para poder reutilizarlo sin hero/full background |
| | - Se agregó `BackofficeAdminService.getUserStatisticsSilent()` para evitar que el dashboard pise `loading$ / error$` globales cuando se muestra junto a la lista de usuarios |
| | - Impacto: contexto + operación en la misma pantalla (insights arriba, acción abajo) sin glitches de loading |
| 2025-12-15 | **SIDEBAR**: Simplificación de Estructura |
| | - Se removió la opción “Dashboard” del submenú **Estructura** porque el dashboard ahora vive arriba en **Estructura → Usuarios** |
| 2025-12-15 | **ENCUESTAS**: Alineación visual con el resto del panel |
| | - Se remaquetó `SurveyDashboardComponent` (tabla + estados + CTA) usando el mismo lenguaje visual (cards/gradientes/tema tenant) |
| | - Se unificaron modales (Crear encuesta / Destinatarios) a overlay fijo consistente (click afuera cierra) |
| | - Se actualizó navegación a rutas nuevas `/panel/encuestas/*` para mantener coherencia del layout |
| 2025-12-15 | **ENCUESTAS**: Legibilidad + jerarquía de acciones |
| | - Título y descripción pasan a una sola columna “Encuesta” (sin truncar agresivo) |
| | - Acciones secundarias se movieron a menú “Más” (Destinatarios/Analytics/Respuestas) dejando afuera solo lo esencial (Editar + Más) |
| | - Impacto: el contenido se lee, la tabla respira y se reduce ruido visual |
| 2025-12-15 | **ENCUESTAS**: Control del listado (filtros + orden) |
| | - Se agregó filtro por estado: **Todos / Borrador / Activa / Cerrada** |
| | - Se agregó orden por fecha de creación: **ascendente/descendente** (toggle) |
| | - Nota: se normalizó el estado (ej. `status` vacío o valores no estándar) para que el filtro coincida con lo que se muestra en el badge |
| | - Estados oficiales (negocio): **draft (Borrador) / published (Publicada) / closed (Cerrada) / archived (Archivada)** |
| | - Regla: encuestas con `status = inactive` o `status = archived` **no se muestran** en el listado |
| | - Nota: backend legacy puede enviar `active`; se interpreta como **published** para mantener coherencia |
| 2025-12-15 | **PENDIENTE (Intención de Voto / Voto de Opinión)**: Sección “Muestra” (tenant-aware) |
| | - Implementado en `/panel/voto-opinion/muestra` |
| | - Endpoint: `GET /api/v1/respondents` (limit/offset) vía `SurveyService.getRespondents()` |
| | - Renderiza tamaño de muestra + **N demográficos dinámicos** (usa agregados si vienen; si no, intenta calcular desde `respondent.demographics`) |
| | - Acceso desde sidebar: **Intención de Voto → Muestra (Voto Opinión)** |
| | - Shape real (swagger): `Respondent { id, tenant_id, phone_number, opt_out, demographics: Record<string, any>, history: string[], created_at, updated_at }` |
| | - Normalización: soporta valores de demográfico como `string/number/bool/array/obj` (obj vacío => N/A, obj con `value/label/name` => usa ese campo) |
| | - Se agregó sección **Respondents** (preview) para ver “quiénes son”: `phone_number` (enmascarado por defecto), `opt_out`, `created_at`, `id` |
| | - Decisión de privacidad: toggle “Revelar teléfonos” para evitar exponer PII accidentalmente |
| 2025-12-15 | **ENCUESTAS (Envío)**: Selección por segmento (respondents) |
| | - En el modal **Cargar destinatarios** se agregó pestaña **Segmento (Muestra)** |
| | - Fuente: `GET /api/v1/respondents` (tenant-aware) |
| | - Permite filtrar por **N demográficos dinámicos** (keys/values desde `respondent.demographics`) |
| | - Permite seleccionar personas y enviar como destinatarios vía `uploadRecipients()` (se excluye `opt_out=true`) |
| 2025-12-15 | **BUILDER v2 (Encuestas)**: Demográficos + Drag & Drop |
| | - Se agregó `is_demographic` a `Question` y toggle UI “Pregunta demográfica (Usar para segmentar resultados)” |
| | - Persistencia: `PUT /api/v1/builder/{survey_id}/questions/{question_id}` con `{ is_demographic: true/false }` |
| | - Drag & Drop: reordenamiento visual de preguntas (optimista) y sincronización con `POST /api/v1/builder/{survey_id}/reorder` enviando `{ question_ids: [...] }` |
| | - Nota: el backend recalcula `order` atómicamente; el frontend solo envía la secuencia final |
| 2024-12-14 | **ARQUITECTURA EVOLUTIVA**: Fases 1-4 completadas |
| | **Fase 1**: Estructura base |
| | - Creado `CoreModule` con guards, interceptors y providers |
| | - Creados modelos tipados: `User`, `Tenant`, `Theme` |
| | - Configurados path aliases en `tsconfig.json` |
| | **Fase 2**: Servicios Core |
| | - `TenantService`: Multi-tenancy centralizado |
| | - `AuthService`: Autenticación con encriptación |
| | - `TenantInterceptor` y `AuthInterceptor` mejorados |
| | **Fase 3**: SharedModule |
| | - Pipes: `roleName`, `truncate`, `safeHtml` |
| | - Componentes compartidos exportados |
| | **Fase 4**: LayoutModule |
| | - `MainLayoutComponent`: Layout con sidebar + header |
| | - `PublicLayoutComponent`: Para páginas públicas |
| | - `RoleMenuComponent`: **MENÚ DINÁMICO** por rol |
| | - `AdminLayoutComponent`: Layout con sidebar moderno para admin |
| | - `SidebarMenuComponent`: Menú lateral con módulos (Estructura, Activación, etc.) |
| | **PANEL DE INICIO**: Implementado `/panel/inicio` |
| | - Líderes activos (Top 5 del ranking) |
| | - Retos activos (Challenges) con empty state |
| | - Encuestas recientes con empty state |
| | - Banner Día Electoral (próximamente) |
| | - Integración con `ApiService.getMyChallenges()` |
| | - Navegación desde logo/título del sidebar |
| 2024-12 | Documentación inicial creada |

---

## 📞 Contacto

Equipo de desarrollo de **Intrasoft**.

---

*Última actualización: Diciembre 2025*

