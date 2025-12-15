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
 */
export const DOMAIN_TENANT_MAP: { [key: string]: string } = {
  // Desarrollo local
  'localhost': 'default',
  'daniel-quintero.localhost': 'daniel-quintero',
  'juan-duque.localhost': 'juan-duque',
  'potus-44.localhost': 'potus-44',
  
  // Producción (agregar dominios reales aquí)
  // 'cliente1.voteradar.com': 'tenant-id-1',
  // 'cliente2.voteradar.com': 'tenant-id-2',
};

/**
 * Mapeo de tenant ID a theme ID
 * Permite que un tenant use un tema específico
 */
export const TENANT_THEME_MAP: { [key: string]: string } = {
  'default': 'default',
  'daniel-quintero': 'daniel-quintero',
  'juan-duque': 'juan-duque',
  'potus-44': 'potus-44',
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
 */
export function getThemeForTenant(tenantId: string): string {
  return TENANT_THEME_MAP[tenantId] || 'default';
}

