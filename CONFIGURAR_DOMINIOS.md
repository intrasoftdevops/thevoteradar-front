# Configurar Dominios para voteradar.co

## 📋 Resumen

Esta guía explica cómo configurar subdominios para el servicio de producción `thevoteradar-front-prod` en Google Cloud Run.

**Estado actual:**
- ✅ Dominio verificado en Google Cloud
- ✅ Domain mapping creado para: `juan-duque.voteradar.co` (pendiente de DNS)
- ⏳ Pendiente: Configurar wildcard CNAME en Cloudflare (ver Paso 3)

---

## Paso 1: Verificar propiedad del dominio (solo una vez) ✅ COMPLETADO

El dominio ya está verificado en Google Cloud. Si necesitas verificar otro dominio:

```bash
gcloud domains verify voteradar.co --project=political-referrals
```

---

## Paso 2: Crear Domain Mappings en Cloud Run

### Variables de entorno

```bash
PROJECT="political-referrals"
REGION="us-central1"
SERVICE="thevoteradar-front-prod"  # ⚠️ IMPORTANTE: Producción, no dev
```

### Crear domain mapping para cada subdominio

Para cada subdominio que quieras configurar, ejecuta:

```bash
# Ejemplo para juan-duque (ya creado ✅)
gcloud beta run domain-mappings create \
  --service=$SERVICE \
  --domain=juan-duque.voteradar.co \
  --region=$REGION \
  --project=$PROJECT

# Para otros subdominios, repite el comando cambiando --domain:
# --domain=dev.voteradar.co
# --domain=daniel-quintero.voteradar.co
# --domain=potus-44.voteradar.co
```

### Listar domain mappings creados

```bash
gcloud beta run domain-mappings list \
  --region=$REGION \
  --project=$PROJECT \
  --format="table(metadata.name,spec.routeName,status.conditions[0].reason)"
```

**Estado esperado:** `Ready` (cuando DNS esté configurado) o `CertificatePending` (esperando DNS).

---

## Paso 3: Configurar DNS en Cloudflare

⚠️ **IMPORTANTE:** Aunque uses wildcard en DNS, **aún debes crear domain mappings individuales en Cloud Run** (Paso 2) para cada subdominio que quieras usar. El wildcard solo resuelve el DNS, pero Google Cloud Run requiere mappings explícitos por seguridad.

### Crear wildcard CNAME en Cloudflare

**Instrucciones para Cloudflare:**
1. Acceder a Cloudflare → Dominio `voteradar.co`
2. DNS → Records → Add record
3. Tipo: **CNAME**
4. Name: `*` (asterisco - esto es el wildcard)
5. Target: `ghs.googlehosted.com`
6. Proxy status: DNS only (gris) o Proxied (naranja) - ambos funcionan
7. TTL: Auto
8. Save

**Resultado:** Todos los subdominios de `voteradar.co` (ej: `cualquier-cosa.voteradar.co`) resolverán automáticamente a `ghs.googlehosted.com`.

**Notas importantes:**
- Solo necesitas crear **un registro DNS** una vez, y todos los subdominios funcionarán automáticamente a nivel DNS
- El wildcard no funciona para el dominio raíz (`voteradar.co`), necesitas un registro separado si lo usas
- Si tienes subdominios que NO deben ir a Google Cloud Run, necesitarás registros específicos que tienen prioridad sobre el wildcard

---

## Paso 4: Verificar configuración

### Verificar registros DNS desde la terminal

```bash
# Verificar que el CNAME resuelve correctamente
dig +short juan-duque.voteradar.co CNAME

# Debe mostrar: ghs.googlehosted.com.
```

### Verificar estado del domain mapping

```bash
gcloud beta run domain-mappings describe \
  --domain=juan-duque.voteradar.co \
  --region=$REGION \
  --project=$PROJECT \
  --format="value(status.conditions[0].reason)"
```

**Estados posibles:**
- ✅ `Ready` - Todo configurado correctamente
- ⏳ `CertificatePending` - Esperando que DNS se propague y se genere el certificado SSL
- ❌ Otro - Revisar el mensaje de error

### Verificar en el navegador

Espera 5-30 minutos (puede tardar hasta 48 horas) para que:
1. DNS se propague
2. Google Cloud genere el certificado SSL

Luego prueba:

```bash
curl -I https://juan-duque.voteradar.co
# Debe responder con 200 OK o 301/302
```

O accede directamente en el navegador: `https://juan-duque.voteradar.co`

---

## 📝 Checklist para cada nuevo subdominio

Cuando quieras configurar un nuevo subdominio (ej: `nuevo-sub.voteradar.co`):

- [ ] **1. Crear domain mapping en Cloud Run:**
  ```bash
  gcloud beta run domain-mappings create \
    --service=thevoteradar-front-prod \
    --domain=nuevo-sub.voteradar.co \
    --region=us-central1 \
    --project=political-referrals
  ```

- [ ] **2. DNS en Cloudflare:**
  - ✅ Ya está configurado (wildcard `*` → `ghs.googlehosted.com`)
  - No necesitas hacer nada más en DNS

- [ ] **3. Verificar después de 15-30 minutos:**
  ```bash
  dig +short nuevo-sub.voteradar.co CNAME
  curl -I https://nuevo-sub.voteradar.co
  ```

---

## ✅ Estado Actual

| Subdominio | Domain Mapping | DNS | Estado |
|------------|----------------|-----|--------|
| `juan-duque.voteradar.co` | ✅ Creado (prod) | ⏳ Pendiente | CertificatePending |
| `voteradar.co` (root) | ✅ Creado (prod) | ✅ Configurado | Ready |

---

## 🎯 Siguientes Pasos

1. **Configurar wildcard CNAME en Cloudflare** (Paso 3) - **una sola vez**
2. **Crear domain mappings en Cloud Run** para cada subdominio (Paso 2) - **requerido para cada subdominio**
3. **Esperar propagación** (15-30 minutos)
4. **Verificar** que funciona accediendo al subdominio
5. **Para nuevos subdominios:** Solo crear domain mapping (Paso 2), el DNS wildcard ya los cubre automáticamente

---

## 📚 Referencias

- [Google Cloud Run Domain Mappings](https://cloud.google.com/run/docs/mapping-custom-domains)

