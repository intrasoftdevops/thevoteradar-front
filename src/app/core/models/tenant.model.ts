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
  // Desarrollo local - usar tenant_id real en lugar de 'default'
  'localhost': '473173', // Tenant por defecto para desarrollo local
  'daniel-quintero.localhost': 'daniel-quintero',
  'juan-duque.localhost': 'juan-duque',
  'potus-44.localhost': 'potus-44',
  
  // Producción - subdominios de voteradar.co
  'daniel-quintero.voteradar.co': 'daniel-quintero',
  'juan-duque.voteradar.co': 'juan-duque',
  'potus-44.voteradar.co': 'potus-44',
  'voteradar.co': '473173', // Dominio principal
  
  // También mapear solo el subdominio para búsqueda flexible
  'daniel-quintero': 'daniel-quintero',
  'juan-duque': 'juan-duque',
  'potus-44': 'potus-44',
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
 * Mapeo de tenant code (string) a tenant_id numérico para el backend
 * Se usa para convertir el tenant code detectado del dominio al tenant_id que el backend espera
 */
export const TENANT_CODE_TO_ID_MAP: { [key: string]: string } = {
  'daniel-quintero': '475711',
  'juan-duque': '1062885',
  'potus-44': '473173',
  // Si el tenant code ya es numérico, se retorna tal cual
  '473173': '473173',
  '475711': '475711',
  '475757': '475757',
  '1062885': '1062885',
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

/**
 * Convierte un tenant code (ej: 'juan-duque') al tenant_id numérico (ej: '1062885')
 * que el backend espera. Si el tenant code ya es numérico, lo retorna tal cual.
 */
export function getTenantIdFromCode(tenantCode: string): string {
  // Si ya es numérico, retornarlo tal cual
  if (/^\d+$/.test(tenantCode)) {
    return tenantCode;
  }
  
  // Convertir tenant code a tenant_id numérico
  return TENANT_CODE_TO_ID_MAP[tenantCode] || tenantCode;
}

