# Configurar Dominios para voteradar.co

## 📋 Resumen

Esta guía explica cómo configurar subdominios para el servicio de producción `thevoteradar-front-prod` en Google Cloud Run.

**Estado actual:**
- ✅ Dominio verificado en Google Cloud
- ✅ Zona DNS creada en Google Cloud: `voteradar-co`
- ✅ Domain mapping creado para: `juan-duque.voteradar.co` (pendiente de DNS)
- ⏳ Pendiente: Configurar DNS (ver Paso 3)

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

## Paso 3: Configurar DNS

⚠️ **IMPORTANTE:** Tienes dos opciones. Elige la que mejor se adapte a tu situación:

### Opción A: Cambiar nameservers a Google Cloud DNS (Recomendado para gestión completa)

Si cambias los nameservers a Google Cloud, podrás gestionar todos los registros DNS desde aquí.

#### 3.1. Obtener nameservers de Google Cloud DNS

```bash
gcloud dns managed-zones describe voteradar-co \
  --project=$PROJECT \
  --format="value(nameServers)"
```

Esto mostrará los 4 nameservers:
```
ns-cloud-b1.googledomains.com
ns-cloud-b2.googledomains.com
ns-cloud-b3.googledomains.com
ns-cloud-b4.googledomains.com
```

#### 3.2. Agregar registros CNAME en Google Cloud DNS

Para cada subdominio, crea el registro CNAME:

```bash
# Ejemplo para juan-duque (ya creado ✅)
gcloud dns record-sets create juan-duque.voteradar.co. \
  --rrdatas="ghs.googlehosted.com." \
  --type=CNAME \
  --ttl=300 \
  --zone=voteradar-co \
  --project=$PROJECT

# Para otros subdominios, repite cambiando el nombre:
# juan-duque.voteradar.co. → dev.voteradar.co.
# juan-duque.voteradar.co. → daniel-quintero.voteradar.co.
# juan-duque.voteradar.co. → potus-44.voteradar.co.
```

#### 3.3. Cambiar nameservers en Cloudflare (o donde esté registrado el dominio)

**En Cloudflare:**
1. Ve a tu dominio `voteradar.co`
2. DNS → Settings → Nameservers
3. Reemplaza los nameservers actuales con los 4 de Google Cloud
4. Guarda

**Nota:** Esto moverá toda la gestión DNS a Google Cloud. Asegúrate de tener todos los registros DNS necesarios (A, AAAA, MX, etc.) antes de cambiar.

---

### Opción B: Agregar solo CNAME en Cloudflare (Rápido, sin cambiar nameservers)

Si prefieres mantener Cloudflare como gestor DNS principal, solo agrega los registros CNAME allí.

#### 3.1. Información para el administrador de Cloudflare

Pide al administrador que agregue estos registros CNAME en Cloudflare:

| Tipo | Nombre (Host) | Contenido/Target | TTL |
|------|---------------|------------------|-----|
| CNAME | `juan-duque` | `ghs.googlehosted.com` | Auto |
| CNAME | `dev` | `ghs.googlehosted.com` | Auto |
| CNAME | `daniel-quintero` | `ghs.googlehosted.com` | Auto |
| CNAME | `potus-44` | `ghs.googlehosted.com` | Auto |

**Instrucciones detalladas para Cloudflare:**
1. Acceder a Cloudflare → Dominio `voteradar.co`
2. DNS → Records → Add record
3. Tipo: **CNAME**
4. Name: `juan-duque` (solo el subdominio, sin `.voteradar.co`)
5. Target: `ghs.googlehosted.com`
6. Proxy status: DNS only (gris) o Proxied (naranja) - ambos funcionan
7. TTL: Auto
8. Save

Repite para cada subdominio que necesites.

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

- [ ] **2. Si usas Google Cloud DNS (Opción A):**
  ```bash
  gcloud dns record-sets create nuevo-sub.voteradar.co. \
    --rrdatas="ghs.googlehosted.com." \
    --type=CNAME \
    --ttl=300 \
    --zone=voteradar-co \
    --project=political-referrals
  ```

- [ ] **3. Si usas Cloudflare (Opción B):**
  - Pedir al administrador que agregue:
    - Tipo: CNAME
    - Nombre: `nuevo-sub`
    - Target: `ghs.googlehosted.com`

- [ ] **4. Verificar después de 15-30 minutos:**
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

1. **Decidir opción DNS:** Opción A (Google Cloud DNS) u Opción B (Cloudflare)
2. **Configurar DNS** según la opción elegida
3. **Esperar propagación** (15-30 minutos)
4. **Verificar** que funciona accediendo al subdominio
5. **Repetir** para otros subdominios si es necesario

---

## 📚 Referencias

- [Google Cloud Run Domain Mappings](https://cloud.google.com/run/docs/mapping-custom-domains)
- [Google Cloud DNS](https://cloud.google.com/dns/docs)
- Zona DNS creada: `voteradar-co` en proyecto `political-referrals`

