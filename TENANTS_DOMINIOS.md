# Sistema de Tenants mediante Dominios - VoteRadar

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura General](#arquitectura-general)
3. [Flujo Completo](#flujo-completo)
4. [Configuración](#configuración)
5. [Desarrollo vs Producción](#desarrollo-vs-producción)
6. [Mapeo de Dominios](#mapeo-de-dominios)
7. [Sistema de Temas](#sistema-de-temas)
8. [Ejemplos Prácticos](#ejemplos-prácticos)
9. [Troubleshooting](#troubleshooting)

---

## Introducción

El sistema de **tenants mediante dominios** permite que una sola instancia de la aplicación VoteRadar sirva a múltiples clientes (tenants) diferentes, cada uno identificado por su dominio o subdominio. Esto permite:

- ✅ **Multitenancy**: Un solo código base para múltiples clientes
- ✅ **Branding personalizado**: Cada tenant tiene su propio tema, colores y logo
- ✅ **Aislamiento de datos**: Cada tenant tiene su propio `tenant_id` para las peticiones al backend
- ✅ **Detección automática**: El sistema detecta automáticamente el tenant desde el dominio

---

## Arquitectura General

### Componentes Principales

```
┌─────────────────────────────────────────────────────────┐
│                    Usuario/Navegador                     │
│              Accede a: client1.voteradar.com             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              ThemeService.getTenantIdFromDomain()         │
│              Detecta dominio → tenant_id                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              ThemeService.loadThemeFromTenantId()        │
│              Aplica tema (colores, logo, branding)       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              LoginComponent.detectTenantFromDomain()      │
│              Guarda tenant_id para peticiones            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│         BackofficeTenantInterceptor.intercept()          │
│         Agrega header X-Tenant-ID a peticiones          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                      Backend API                         │
│              Recibe petición con tenant_id              │
└─────────────────────────────────────────────────────────┘
```

### Archivos Clave

| Archivo | Responsabilidad |
|---------|----------------|
| `theme.service.ts` | Detección de dominio → tenant_id, aplicación de temas |
| `login.component.ts` | Detección inicial y uso del tenant en login |
| `backoffice-tenant-interceptor.service.ts` | Agregar header `X-Tenant-ID` a peticiones HTTP |
| `theme.model.ts` | Definición de temas y mapeo tenant_id → theme_id |
| `angular.json` | Configuración de `allowedHosts` para desarrollo |
| `nginx.conf` | Configuración de servidor web para producción |

---

## Flujo Completo

### 1. Usuario Accede a la Aplicación

```
Usuario escribe en navegador: http://client1.localhost:4200
         ↓
Navegador resuelve dominio (archivo hosts o DNS)
         ↓
Aplicación Angular se carga
```

### 2. Detección del Tenant (ngOnInit)

```typescript
// En LoginComponent.ngOnInit()
detectTenantFromDomain()
  ↓
// En ThemeService
detectAndApplyThemeFromDomain()
  ↓
getTenantIdFromDomain()
  ↓
// Busca en domainTenantMap
'client1.localhost' → '473173'
  ↓
// Aplica tema
loadThemeFromTenantId('473173')
  ↓
// Mapea tenant_id → theme_id
'473173' → 'client1'
  ↓
// Aplica tema client1 (azul/amarillo)
setTheme('client1')
```

### 3. Aplicación del Tema

```typescript
// En ThemeService.applyThemeToDOM()
root.setAttribute('data-theme', 'client1');
root.style.setProperty('--color-primary', '#0032fd');
root.style.setProperty('--color-secondary', '#ffef03');
// ... más variables CSS
```

### 4. Login del Usuario

```typescript
// Usuario ingresa credenciales y hace clic en "Login"
  ↓
// En LoginComponent
const tenantCode = this.detectedTenantCode; // '473173'
  ↓
// Para login de administrador
localStorage.setItem('temp_tenant_id_for_login', '473173');
backofficeAuth.login(email, password)
  ↓
// Interceptor intercepta la petición
BackofficeTenantInterceptor.intercept()
  ↓
// Lee temp_tenant_id_for_login
let tenantId = localStorage.getItem('temp_tenant_id_for_login');
  ↓
// Agrega header
setHeaders: { 'X-Tenant-ID': '473173' }
  ↓
// Petición enviada al backend
GET /users/token
Headers: { X-Tenant-ID: '473173' }
```

### 5. Después del Login

```typescript
// Backend responde con token + tenant_id del usuario
response.user.tenant_id = '473173'
  ↓
// Guardar tenant_id definitivo
localStorage.setItem('tenant_id', '473173');
  ↓
// Limpiar temporal
localStorage.removeItem('temp_tenant_id_for_login');
  ↓
// Aplicar tema definitivo
themeService.loadThemeFromTenantId();
```

---

## Configuración

### 1. Mapeo de Dominios a Tenant ID

**Archivo**: `src/app/services/theme/theme.service.ts`

```typescript
getTenantIdFromDomain(): string | null {
  const hostname = window.location.hostname.toLowerCase();
  
  const domainTenantMap: { [key: string]: string } = {
    // Desarrollo local
    'client1': '473173',
    'client1.localhost': '473173',
    'partido-azul': '473173',
    
    'client2': '473174',
    'client2.localhost': '473174',
    'partido-verde': '473174',
    
    'client3': '473175',
    'client3.localhost': '473175',
    'partido-rojo': '473175',
    
    // Producción
    'partido-azul.com': '473173',
    'partido-verde.com': '473174',
    'partido-rojo.com': '473175',
  };
  
  // Búsqueda en 3 niveles:
  // 1. Coincidencia exacta
  // 2. Por subdominio (client1.voteradar.com → client1)
  // 3. Por palabra clave (app.partido-azul.com → partido-azul)
}
```

### 2. Mapeo de Tenant ID a Tema

**Archivo**: `src/app/services/theme/theme.service.ts`

```typescript
private getThemeIdFromTenantId(tenantId: string): string | null {
  const tenantThemeMap: { [key: string]: string } = {
    '473173': 'client1', // Partido Azul (azul/amarillo)
    '473174': 'client2', // Partido Verde (verde)
    '473175': 'client3', // Partido Rojo (rojo)
  };
  
  return tenantThemeMap[tenantId] || null;
}
```

### 3. Configuración de Temas

**Archivo**: `src/app/models/theme.model.ts`

```typescript
export const THEMES: { [key: string]: Theme } = {
  client1: {
    id: 'client1',
    name: 'Cliente Azul',
    colors: {
      primary: '#0032fd',    // Azul
      secondary: '#ffef03',  // Amarillo
      accent: '#1336bf',
      // ...
    },
    branding: {
      logo: '../../../assets/clients/client1/logo.jpg',
      title: 'Reset a la política',
      description: 'Ingresa a tu cuenta de la plataforma electoral',
    },
  },
  // ... más temas
};
```

---

## Desarrollo vs Producción

### Desarrollo Local

#### 1. Configurar archivo hosts

**Ubicación**: `C:\Windows\System32\drivers\etc\hosts` (Windows)

```hosts
127.0.0.1 client1.localhost
127.0.0.1 client2.localhost
127.0.0.1 partido-azul.localhost
```

#### 2. Configurar Angular para desarrollo

**Archivo**: `angular.json`

```json
"serve": {
  "builder": "@angular-devkit/build-angular:dev-server",
  "options": {
    "allowedHosts": [
      "client1.localhost",
      "client2.localhost",
      "client3.localhost",
      "partido-azul.localhost",
      "partido-verde.localhost",
      "partido-rojo.localhost",
      "localhost"
    ]
  }
}
```

#### 3. Iniciar servidor de desarrollo

```bash
ng serve --host 0.0.0.0 --port 4200
```

#### 4. Acceder a la aplicación

- `http://client1.localhost:4200` → Tenant `473173` → Tema `client1`
- `http://client2.localhost:4200` → Tenant `473174` → Tema `client2`
- `http://localhost:4200` → Usa `environment.defaultTenantId`

### Producción

#### 1. Configurar nginx

**Archivo**: `nginx.conf`

```nginx
server {
    listen 8080;
    server_name _;  # Acepta cualquier dominio
    
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Nota**: `server_name _;` acepta cualquier dominio. La aplicación Angular detectará automáticamente el dominio con `window.location.hostname`.

#### 2. Configurar DNS

Asegúrate de que tus dominios apunten al servidor:

```
client1.voteradar.com    → IP del servidor
partido-azul.com        → IP del servidor
partido-verde.com       → IP del servidor
```

#### 3. Build y despliegue

```bash
# Build de producción
npm run build -- --configuration production

# La aplicación compilada se sirve desde nginx
# No se usa ng serve en producción
```

---

## Mapeo de Dominios

### Algoritmo de Búsqueda

El método `getTenantIdFromDomain()` busca en **3 niveles de prioridad**:

#### Nivel 1: Coincidencia Exacta

```typescript
domainTenantMap['client1.localhost'] → '473173' ✅
domainTenantMap['partido-azul.com'] → '473173' ✅
```

#### Nivel 2: Por Subdominio

```typescript
// URL: https://client1.voteradar.com
hostname.match(/^([^.]+)\./) → subdomain = 'client1'
domainTenantMap['client1'] → '473173' ✅
```

#### Nivel 3: Por Palabra Clave

```typescript
// URL: https://app.partido-azul.com
hostname.includes('partido-azul') → true
domainTenantMap['partido-azul'] → '473173' ✅
```

### Ejemplos de Mapeo

| URL | Hostname | Tenant ID | Tema |
|-----|----------|-----------|------|
| `http://client1.localhost:4200` | `client1.localhost` | `473173` | `client1` |
| `https://client1.voteradar.com` | `client1.voteradar.com` | `473173` | `client1` |
| `https://app.partido-azul.com` | `app.partido-azul.com` | `473173` | `client1` |
| `https://www.partido-azul.com` | `www.partido-azul.com` | `473173` | `client1` |
| `http://client2.localhost:4200` | `client2.localhost` | `473174` | `client2` |
| `https://partido-verde.com` | `partido-verde.com` | `473174` | `client2` |

---

## Sistema de Temas

### Flujo de Aplicación de Tema

```
1. Usuario accede a dominio
   ↓
2. getTenantIdFromDomain() detecta tenant_id
   ↓
3. getThemeIdFromTenantId() mapea tenant_id → theme_id
   ↓
4. setTheme(themeId) aplica el tema
   ↓
5. applyThemeToDOM() actualiza:
   - Atributo data-theme en <html>
   - Variables CSS en :root
   ↓
6. Componentes se actualizan automáticamente
```

### Variables CSS Aplicadas

```css
:root {
  --color-primary: #0032fd;      /* Azul para client1 */
  --color-secondary: #ffef03;    /* Amarillo para client1 */
  --color-accent: #1336bf;
  --color-background: #f9fafb;
  --color-surface: #ffffff;
  --color-text-primary: #1f2937;
  --color-text-secondary: #6b7280;
}

[data-theme="client1"] {
  /* Estilos específicos del tema */
}
```

### Branding Personalizado

Cada tema incluye:

- **Logo**: Ruta al archivo de logo del cliente
- **Título**: Título personalizado (ej: "Reset a la política")
- **Descripción**: Descripción personalizada
- **Tamaño de logo**: `small`, `medium`, o `large`

---

## Ejemplos Prácticos

### Ejemplo 1: Desarrollo Local

```bash
# 1. Configurar hosts
127.0.0.1 client1.localhost

# 2. Iniciar servidor
ng serve --host 0.0.0.0 --port 4200

# 3. Acceder
http://client1.localhost:4200

# 4. Verificar en consola del navegador
console.log(window.location.hostname);
// "client1.localhost"

localStorage.getItem('detected_tenant_id');
// "473173"

document.documentElement.getAttribute('data-theme');
// "client1"
```

### Ejemplo 2: Login de Administrador

```typescript
// 1. Usuario accede a client1.voteradar.com
// 2. Sistema detecta tenant_id: '473173'
// 3. Usuario ingresa email/password
// 4. handleAdminLogin() guarda temporalmente:
localStorage.setItem('temp_tenant_id_for_login', '473173');

// 5. Interceptor agrega header:
X-Tenant-ID: 473173

// 6. Backend responde con token
// 7. Se guarda tenant_id definitivo:
localStorage.setItem('tenant_id', '473173');

// 8. Se limpia temporal:
localStorage.removeItem('temp_tenant_id_for_login');
```

### Ejemplo 3: Agregar Nuevo Tenant

```typescript
// 1. Agregar dominio al mapeo
const domainTenantMap = {
  // ... existentes ...
  'nuevo-cliente.com': '473176',
  'nuevo-cliente': '473176',  // Para subdominios
};

// 2. Agregar mapeo tenant_id → theme_id
const tenantThemeMap = {
  // ... existentes ...
  '473176': 'client4',
};

// 3. Crear tema en theme.model.ts
export const THEMES = {
  // ... existentes ...
  client4: {
    id: 'client4',
    name: 'Nuevo Cliente',
    colors: { /* ... */ },
    branding: { /* ... */ },
  },
};
```

---

## Troubleshooting

### Problema: "Invalid Host header"

**Causa**: El servidor de desarrollo de Angular rechaza el dominio.

**Solución**: Agregar el dominio a `allowedHosts` en `angular.json`:

```json
"allowedHosts": [
  "client1.localhost",
  "client2.localhost"
]
```

### Problema: No detecta el dominio

**Verificar**:

1. **Archivo hosts configurado correctamente**:
   ```bash
   ping client1.localhost
   # Debe responder: Pinging client1.localhost [127.0.0.1]
   ```

2. **Dominio en el mapeo**:
   ```typescript
   // Verificar que el dominio esté en domainTenantMap
   console.log(window.location.hostname);
   ```

3. **Consola del navegador**:
   ```javascript
   // Debe mostrar:
   🔍 Tenant detectado desde dominio: 473173
   🌐 Hostname: client1.localhost
   ```

### Problema: Tema no se aplica

**Verificar**:

1. **Tenant ID detectado**:
   ```javascript
   localStorage.getItem('detected_tenant_id');
   ```

2. **Mapeo tenant_id → theme_id**:
   ```typescript
   // Verificar que '473173' esté mapeado a 'client1'
   const tenantThemeMap = {
     '473173': 'client1',  // ✅ Debe existir
   };
   ```

3. **Tema existe**:
   ```typescript
   // Verificar que 'client1' esté en THEMES
   THEMES['client1']  // ✅ Debe existir
   ```

4. **Atributo data-theme**:
   ```javascript
   document.documentElement.getAttribute('data-theme');
   // Debe mostrar: "client1"
   ```

### Problema: Login falla con error de tenant

**Verificar**:

1. **Tenant detectado antes del login**:
   ```javascript
   // En consola antes de hacer login
   localStorage.getItem('detected_tenant_id');
   // Debe tener un valor
   ```

2. **Header X-Tenant-ID en la petición**:
   - Abrir DevTools → Network
   - Buscar petición a `/users/token`
   - Verificar que tenga header `X-Tenant-ID`

3. **Logs del interceptor**:
   ```typescript
   // Agregar logs temporales en el interceptor
   console.log('Tenant ID usado:', tenantId);
   ```

---

## Prioridades del Sistema

### Detección de Tenant (en orden de prioridad)

1. **`localStorage.getItem('tenant_id')`** - Tenant guardado después de login
2. **Detección desde dominio** - `getTenantIdFromDomain()`
3. **`environment.defaultTenantId`** - Fallback del environment

### Detección de Tema (en orden de prioridad)

1. **`localStorage.getItem('app-theme')`** - Tema guardado manualmente
2. **Desde `tenant_id`** - Mapeo tenant_id → theme_id
3. **Desde dominio** - Detección directa desde hostname
4. **`'default'`** - Tema por defecto

### Header X-Tenant-ID (en orden de prioridad)

1. **`temp_tenant_id_for_login`** - Temporal del login
2. **Detección desde dominio** - `getTenantIdFromDomain()`
3. **`localStorage.getItem('tenant_id')`** - Tenant guardado
4. **`environment.defaultTenantId`** - Fallback

---

## Mejores Prácticas

### ✅ DO (Hacer)

- Agregar todos los dominios de producción al `domainTenantMap`
- Usar `server_name _;` en nginx para aceptar cualquier dominio
- Validar que siempre haya un `tenant_id` antes de hacer peticiones
- Limpiar `temp_tenant_id_for_login` después del login
- Usar `environment.defaultTenantId` como fallback

### ❌ DON'T (No hacer)

- No hardcodear valores de tenant_id
- No olvidar limpiar `temp_tenant_id_for_login`
- No usar `--disable-host-check` en producción
- No confiar solo en la detección de dominio sin fallback

---

## Referencias

- **Archivo de configuración de dominios**: `src/app/services/theme/theme.service.ts`
- **Mapeo de temas**: `src/app/models/theme.model.ts`
- **Configuración de desarrollo**: `angular.json`
- **Configuración de producción**: `nginx.conf`
- **Interceptor de tenant**: `src/app/interceptors/backoffice-tenant-interceptor.service.ts`

---

## Soporte

Para agregar nuevos tenants o modificar la configuración, contacta al equipo de desarrollo o revisa la documentación técnica en este mismo repositorio.

---

**Última actualización**: 2024
**Versión**: 1.0

