# 🔧 Solución Requerida en el Backend (apiURL/Laravel)

## Problema Identificado

Los administradores inician sesión con `backofficeApiURL` (Firestore) y obtienen un token JWT del backoffice. Sin embargo, las funcionalidades de gestión de usuarios (crear gerentes, supervisores, etc.) usan `apiURL` (voteradarback/Laravel).

**El problema**: El token del backoffice NO es válido para `apiURL`, causando errores 500 cuando el backend de Laravel intenta validar o buscar información del usuario en el backoffice.

## Soluciones Propuestas

### Opción 1: Validar Tokens del Backoffice en Laravel (Recomendada)

**Descripción**: Modificar el middleware de autenticación de Laravel para aceptar y validar tokens JWT del backoffice cuando el usuario es admin.

**Implementación sugerida**:

1. **Crear un middleware o modificar el existente** para detectar tokens del backoffice:
   ```php
   // En Laravel
   // Detectar si el token viene del backoffice
   // Verificar el issuer del JWT o agregar un header especial
   ```

2. **Validar el token del backoffice**:
   - Verificar la firma del JWT usando la clave pública del backoffice
   - Extraer información del usuario (email, rol, tenant_id)
   - Si el usuario es admin, permitir el acceso

3. **Endpoints afectados**:
   - `GET /api/get-departamentos-administrador`
   - `GET /api/municipios-administrador/{id}`
   - `POST /api/crear-gerente`
   - `POST /api/crear-supervisor`
   - `POST /api/crear-coordinador`
   - `POST /api/crear-testigo`
   - Y otros endpoints de gestión de usuarios

**Ventajas**:
- ✅ Unifica la autenticación
- ✅ Los admins pueden usar todas las funcionalidades
- ✅ No requiere cambios en el frontend

**Desventajas**:
- ⚠️ Requiere modificar el middleware de Laravel
- ⚠️ Necesita acceso a la clave pública del backoffice para validar JWT

---

### Opción 2: Permitir Operaciones sin Mapeo

**Descripción**: Permitir que admins autenticados con backoffice puedan crear usuarios en `apiURL` sin necesidad de estar mapeados en Laravel.

**Implementación sugerida**:

1. **Crear un endpoint de validación** en el backoffice:
   ```
   GET /backoffice/users/validate-admin
   Headers: Authorization: Bearer <token>
   ```

2. **En Laravel, antes de crear usuarios**:
   - Si el token viene del backoffice, validarlo con el backoffice
   - Si el usuario es admin válido, permitir la operación
   - No requerir que el usuario esté mapeado en Laravel

3. **O hacer los endpoints públicos para admins**:
   - Agregar un header especial: `X-Admin-Token: <token-backoffice>`
   - Validar el token con el backoffice antes de procesar

**Ventajas**:
- ✅ No requiere mapeo de usuarios
- ✅ Más flexible

**Desventajas**:
- ⚠️ Requiere comunicación entre backends
- ⚠️ Puede ser más lento (validación externa)

---

### Opción 3: Sincronizar Usuarios Admin

**Descripción**: Cuando un admin inicia sesión con backoffice, sincronizarlo automáticamente en Laravel.

**Implementación sugerida**:

1. **Crear un endpoint de sincronización** en Laravel:
   ```
   POST /api/sync-backoffice-admin
   Body: { token: <backoffice-token> }
   ```

2. **Al iniciar sesión en el frontend**:
   - Si es admin y viene del backoffice, llamar al endpoint de sincronización
   - Laravel crea/actualiza el usuario admin en su base de datos
   - El usuario queda disponible para operaciones en apiURL

**Ventajas**:
- ✅ Mantiene ambos sistemas sincronizados
- ✅ No requiere cambios en el middleware

**Desventajas**:
- ⚠️ Requiere sincronización bidireccional
- ⚠️ Puede causar inconsistencias si no se maneja bien

---

## Recomendación

**Opción 1 (Validar Tokens del Backoffice)** es la más recomendada porque:
- Unifica la autenticación
- No requiere sincronización
- Es más escalable
- Mantiene la seguridad

## Headers que Envía el Frontend

Cuando un admin autenticado con backoffice hace una petición a `apiURL`, el frontend envía:

```
Authorization: Bearer <token-del-backoffice>
Accept: application/json
```

El backend de Laravel debe:
1. Detectar que el token viene del backoffice (por el issuer, formato, o un header adicional)
2. Validar el token con el backoffice o usando la clave pública
3. Si es válido y el usuario es admin, permitir el acceso

## Ejemplo de Implementación en Laravel

```php
// En el middleware de autenticación
public function handle($request, Closure $next)
{
    $token = $request->bearerToken();
    
    // Intentar validar como token de Laravel primero
    try {
        $user = Auth::guard('api')->user();
        return $next($request);
    } catch (\Exception $e) {
        // Si falla, intentar validar como token del backoffice
        try {
            $backofficeUser = $this->validateBackofficeToken($token);
            if ($backofficeUser && $backofficeUser->role === 'admin') {
                // Permitir acceso para admin del backoffice
                return $next($request);
            }
        } catch (\Exception $e2) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
    }
    
    return response()->json(['error' => 'Unauthorized'], 401);
}

private function validateBackofficeToken($token)
{
    // Validar JWT del backoffice
    // Usar la clave pública del backoffice
    // Retornar información del usuario
}
```

---

**Nota**: Esta solución debe implementarse en el backend de Laravel (voteradarback/apiURL). El frontend ya está preparado para enviar el token del backoffice cuando el usuario es admin.

