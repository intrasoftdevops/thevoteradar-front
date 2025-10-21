# VoteradarFront

Sistema de gestión electoral para monitoreo de votaciones en tiempo real.

## 📖 ¿Qué es VoteRadar?

**VoteRadar** es una plataforma web integral diseñada para la gestión, monitoreo y control de procesos electorales en tiempo real. El sistema permite coordinar equipos de trabajo distribuidos en diferentes zonas geográficas y puestos de votación, facilitando la recolección, supervisión y reporte de información electoral.

### 🎯 Funcionalidades Principales

#### 🗳️ **Monitoreo de Votaciones**
- Reporte de votos por mesa y candidato en tiempo real
- Captura fotográfica de actas de escrutinio
- Validación y consolidación de resultados por zonas
- Dashboard con estadísticas y métricas electorales

#### 📋 **Gestión de Incidencias**
- Reporte de novedades y problemas en puestos de votación
- Categorización de incidencias (seguridad, logística, técnicas, etc.)
- Sistema de seguimiento con estados (abierto/cerrado)
- Adjuntar evidencia fotográfica y videos
- Respuestas y resolución por parte de coordinadores

#### 👥 **Gestión Jerárquica de Personal**
El sistema maneja una estructura organizacional de varios niveles:
- **Administradores**: Gestión completa del sistema y usuarios
- **Gerentes**: Supervisión de departamentos y municipios
- **Supervisores**: Coordinación de zonas de votación
- **Coordinadores**: Gestión directa de puestos de votación
- **Testigos**: Personal en campo reportando información

#### ⚖️ **Sistema de Impugnaciones**
- Registro y gestión de impugnaciones electorales
- Categorización por tipo de impugnación
- Seguimiento del estado de cada caso
- Generación de reportes de impugnaciones

#### 📊 **Reportes y Analítica**
- Consolidación de datos por mesa, puesto, zona y municipio
- Exportación de información en diferentes formatos
- Visualización de resultados con tablas y gráficos
- Seguimiento de cobertura y avance del reporte

#### 🔐 **Control de Acceso**
- Sistema de autenticación con JWT
- Autorización basada en roles y permisos
- Diferentes vistas y funcionalidades según el rol
- Cierre de sesión automático por inactividad

#### 📱 **Características Adicionales**
- Galería de imágenes con lightbox para visualización de evidencias
- Sistema de notificaciones y alertas
- Gestión de contactos por campaña política
- Interfaz responsive adaptada a diferentes dispositivos
- Validación de formularios en tiempo real

### 💼 Casos de Uso

1. **Coordinador de Mesa**: Reporta resultados de votación desde el puesto electoral, adjunta fotos del acta y reporta cualquier incidencia.

2. **Supervisor de Zona**: Revisa y valida reportes de múltiples mesas, responde a incidencias y monitorea el avance de la recolección de datos.

3. **Gerente Regional**: Consolida información de toda una región, genera reportes estadísticos y toma decisiones basadas en datos en tiempo real.

4. **Administrador**: Gestiona usuarios, asigna permisos, configura zonas de votación y supervisa la operación general del sistema.

### 🌟 Beneficios

- ✅ **Información en Tiempo Real**: Acceso inmediato a resultados y reportes
- ✅ **Trazabilidad**: Registro completo de todas las acciones y cambios
- ✅ **Eficiencia**: Reducción de tiempos en la recolección y consolidación de datos
- ✅ **Confiabilidad**: Validación de datos con evidencia fotográfica
- ✅ **Escalabilidad**: Soporta operaciones desde pequeñas hasta grandes escalas
- ✅ **Seguridad**: Control estricto de acceso y autenticación robusta

## 📋 Requisitos Previos

- **Node.js**: v14.x o v16.x
- **npm**: v7.x o superior
- **Angular CLI**: v13.3.8 (se instalará automáticamente como dependencia)
- **Git**: Para control de versiones

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://gitlab.com/intrasoftCo/voteradar-front.git
cd voteradar-front
```

### 2. Sincronizar con el Repositorio Remoto

**Importante:** Antes de trabajar localmente, siempre sincroniza las ramas `main` y `dev`:

```bash
git pull origin main
git pull origin dev
```

### 3. Instalar Dependencias

```bash
npm install
```

**Nota:** Si encuentras conflictos de dependencias, las dependencias han sido configuradas para ser compatibles con Angular 13.3.11.

## 💻 Desarrollo

### Servidor de Desarrollo

Ejecuta el servidor de desarrollo:

```bash
npm start
```

O alternativamente:

```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200/`. Los cambios en el código se reflejarán automáticamente en el navegador.

### 🔧 Modo Development

El proyecto incluye un **modo development** que facilita las pruebas y el desarrollo:

#### **Características:**
- **Usuarios de prueba predefinidos** para todos los roles
- **Login automático** sin necesidad de API
- **Interfaz visual** para seleccionar usuarios de prueba
- **Solo activo en desarrollo** (deshabilitado en producción)

#### **Usuarios de Prueba Disponibles:**

| Rol | Usuario | Contraseña | Descripción |
|-----|---------|------------|-------------|
| **Administrador** | `admin` | `admin123` | Acceso completo al sistema |
| **Gerente** | `gerente` | `gerente123` | Gestión de departamentos |
| **Supervisor** | `supervisor` | `super123` | Supervisión de equipos |
| **Coordinador** | `coord` | `coord123` | Coordinación de testigos |
| **Testigo** | `testigo` | `test123` | Reporte de incidencias |
| **Admin Sistema** | `admin2` | `admin456` | Administrador del sistema |
| **Impugnador Admin** | `impugn` | `impugn123` | Administrar impugnaciones |
| **Impugnador** | `impugnador` | `imp123` | Crear impugnaciones |
| **Super Admin** | `superadmin` | `super456` | Super administrador |

#### **Cómo Usar:**
1. **Ejecuta el proyecto** en modo desarrollo (`ng serve`)
2. **Ve a la página de login**
3. **Haz clic en "Mostrar Usuarios de Prueba"**
4. **Selecciona un usuario** haciendo clic en él
5. **Haz clic en "INICIAR"** para acceder

#### **Configuración:**
- **Habilitar:** `environment.development = true` en `environment.ts`
- **Deshabilitar:** `environment.development = false` en `environment.prod.ts`

### Servidor en Puerto Personalizado

```bash
ng serve --port 4300
```

### Servidor Accesible desde la Red Local

```bash
ng serve --host 0.0.0.0
```

## 🏗️ Construcción

### Build de Desarrollo

```bash
ng build
```

### Build de Producción

```bash
ng build --configuration production
```

Los archivos compilados se generarán en el directorio `dist/`.

## 📦 Tecnologías Principales

- **Angular**: 13.3.11
- **TypeScript**: 4.6.4
- **Bootstrap**: 5.1.3
- **NgBootstrap**: 12.1.1
- **Angular DataTables**: 13.0.1
- **ngx-permissions**: 13.0.1
- **ngx-lightbox**: 2.5.1 (galería de imágenes)
- **SweetAlert2**: 11.4.8
- **RxJS**: 7.5.5

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── components/          # Componentes de la aplicación
│   │   ├── Admin/          # Componentes de administrador
│   │   ├── Coordinador/    # Componentes de coordinador
│   │   ├── Gerente/        # Componentes de gerente
│   │   ├── Supervisor/     # Componentes de supervisor
│   │   ├── Testigo/        # Componentes de testigo
│   │   └── Impugnador/     # Componentes de impugnador
│   ├── services/           # Servicios de la aplicación
│   ├── guards/             # Guards de autenticación y autorización
│   ├── models/             # Modelos e interfaces
│   └── interceptors/       # Interceptores HTTP
├── assets/                 # Recursos estáticos (imágenes, iconos)
├── environments/           # Configuraciones de entorno
└── styles.scss            # Estilos globales
```

## 🔐 Roles de Usuario

El sistema maneja diferentes roles con permisos específicos:

- **Administrador**: Gestión completa del sistema
- **Gerente**: Supervisión de zonas y equipos
- **Supervisor**: Coordinación de testigos
- **Coordinador**: Gestión de puestos de votación
- **Testigo**: Reporte de votos e incidencias
- **Impugnador**: Gestión de impugnaciones

## 🛠️ Comandos Útiles

### Generar Nuevos Componentes

```bash
ng generate component components/nombre-componente
```

### Generar Servicios

```bash
ng generate service services/nombre-servicio
```

### Limpiar Caché de npm

Si experimentas problemas con las dependencias:

```bash
rm -rf node_modules package-lock.json
npm install
```

## 🧪 Pruebas

### Ejecutar Pruebas Unitarias

```bash
ng test
```

### Ejecutar Pruebas con Cobertura

```bash
ng test --code-coverage
```

## 🐛 Solución de Problemas Comunes

### Error de Dependencias al Instalar

Si encuentras errores de peer dependencies:

```bash
npm install --legacy-peer-deps
```

### Errores de Compilación después de Pull

Si hay conflictos después de hacer pull:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Puerto 4200 ya en Uso

```bash
# Mata el proceso en el puerto 4200
lsof -ti:4200 | xargs kill -9
# O usa otro puerto
ng serve --port 4300
```

## 🔄 Flujo de Trabajo Git

1. Sincronizar con remoto:
   ```bash
   git pull origin main
   git pull origin dev
   ```

2. Crear una rama para tu feature:
   ```bash
   git checkout -b feature/nombre-feature
   ```

3. Hacer commits descriptivos:
   ```bash
   git add .
   git commit -m "feat: descripción del cambio"
   ```

4. Push de cambios:
   ```bash
   git push origin feature/nombre-feature
   ```

## 📝 Convenciones de Código

- Usa **camelCase** para variables y funciones
- Usa **PascalCase** para clases y componentes
- Prefiere **const** sobre **let**
- Usa **arrow functions** cuando sea posible
- Documenta funciones complejas con comentarios JSDoc

## 🌐 Variables de Entorno

El proyecto usa dos archivos de configuración:

- `src/environments/environment.ts`: Desarrollo
- `src/environments/environment.prod.ts`: Producción

Configura la URL del API backend en estos archivos.

## 📞 Soporte

Para problemas o preguntas sobre el proyecto, contacta al equipo de desarrollo de Intrasoft.

## 📄 Licencia

Este proyecto es propiedad de Intrasoft. Todos los derechos reservados.

---

**Versión de Angular CLI**: 13.3.8  
**Última actualización**: Octubre 2025
