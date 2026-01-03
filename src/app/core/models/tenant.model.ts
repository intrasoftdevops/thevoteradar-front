/**
 * Modelo de Tenant para el sistema multi-tenancy
 * Un tenant representa un cliente/campaña política independiente
 */

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  themeId: string;
  isActive: boolean;
  config?: TenantConfig;
}

export interface TenantConfig {
  features?: {
    surveys?: boolean;
    whatsapp?: boolean;
    backoffice?: boolean;
    impugnaciones?: boolean;
  };
  limits?: {
    maxUsers?: number;
    maxSurveys?: number;
  };
}

/**
 * Mapeo de dominios a tenant IDs
 * Se usa para detectar automáticamente el tenant desde la URL
 * Valores deben ser tenant IDs numéricos del backend
 */
export const DOMAIN_TENANT_MAP: { [key: string]: string } = {
  'localhost': '473173', // tenant por defecto (potus-44)
  
  // Potus 44 - Tenant ID: 473173
  'potus-44.localhost': '473173',
  'potus-44': '473173',
  
  // Daniel Quintero - Tenant ID: 475711
  'daniel-quintero.localhost': '475711',
  'daniel-quintero': '475711',
  
  // Juan Duque - Tenant ID: 475757
  'juan-duque.localhost': '475757',
  'juan-duque': '475757',
  
  // Producción (agregar dominios reales aquí)
  // 'cliente1.voteradar.com': 'tenant-id-1',
  // 'cliente2.voteradar.com': 'tenant-id-2',
};

/**
 * Mapeo de tenant ID a theme ID
 * Permite que un tenant use un tema específico
 * IMPORTANTE: Las claves son tenant IDs numéricos del backend
 */
export const TENANT_THEME_MAP: { [key: string]: string } = {
  '473173': 'potus-44',      // Potus 44
  '475711': 'daniel-quintero', // Daniel Quintero
  '475757': 'juan-duque',     // Juan Duque
  'default': 'default',
};

/**
 * Detecta el tenant ID desde el hostname actual
 */
export function getTenantFromHostname(hostname: string): string | null {
  const normalizedHostname = hostname.toLowerCase();
  
  // 1. Búsqueda exacta
  if (DOMAIN_TENANT_MAP[normalizedHostname]) {
    return DOMAIN_TENANT_MAP[normalizedHostname];
  }
  
  // 2. Búsqueda por subdominio (ej: daniel-quintero.voteradar.com)
  const subdomainMatch = normalizedHostname.match(/^([^.]+)\./);
  if (subdomainMatch) {
    const subdomain = subdomainMatch[1];
    if (DOMAIN_TENANT_MAP[subdomain]) {
      return DOMAIN_TENANT_MAP[subdomain];
    }
  }
  
  // 3. Búsqueda por palabra clave en el hostname
  for (const [key, tenantId] of Object.entries(DOMAIN_TENANT_MAP)) {
    if (normalizedHostname.includes(key) && key !== 'localhost') {
      return tenantId;
    }
  }
  
  return null;
}

/**
 * Obtiene el theme ID para un tenant
 * @param tenantId - Tenant ID numérico del backend (ej: '473173')
 * @returns Theme ID (ej: 'potus-44')
 */
export function getThemeForTenant(tenantId: string): string {
  return TENANT_THEME_MAP[tenantId] || 'default';
}

