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
  
  // Juan Duque - Tenant ID: 1062885
  'juan-duque.localhost': '1062885',
  'juan-duque': '1062885',
  
  // Pablo Acuña - Tenant ID: 1076565
  'pablo-acuna.localhost': '1076565',
  'pablo-acuna': '1076565',
  
  // Producción - subdominios de voteradar.co
  'daniel-quintero.voteradar.co': '475711',
  'juan-duque.voteradar.co': '1062885',
  'potus-44.voteradar.co': '473173',
  'pablo-acuna.voteradar.co': '1076565',
  'voteradar.co': '473173', // Dominio principal
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
 * Mapeo de tenant code (string) a tenant_id numérico para el backend
 * Se usa para convertir el tenant code detectado del dominio al tenant_id que el backend espera
 */
export const TENANT_CODE_TO_ID_MAP: { [key: string]: string } = {
  'daniel-quintero': '475711',
  'juan-duque': '1062885',
  'potus-44': '473173',
  'pablo-acuna': '1076565',
  // Si el tenant code ya es numérico, se retorna tal cual
  '473173': '473173',
  '475711': '475711',
  '475757': '475757',
  '1062885': '1062885',
  '1076565': '1076565',
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

