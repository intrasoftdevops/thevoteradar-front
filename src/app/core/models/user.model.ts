/**
 * Roles del sistema VoteRadar
 * Mantiene compatibilidad con los IDs numéricos del backend
 */
export enum UserRole {
  ADMIN = 1,
  GERENTE = 2,
  SUPERVISOR = 3,
  COORDINADOR = 4,
  TESTIGO = 5,
  // Rol 6 no existe
  ADMIN_IMPUGNACIONES = 7,
  IMPUGNADOR = 8,
}

/**
 * Información de rol para UI
 */
export interface RoleInfo {
  id: UserRole;
  name: string;
  displayName: string;
  homeRoute: string;
  menuComponent: string;
  canCreate: UserRole[]; // Qué roles puede crear este usuario
  permissions: string[];
}

/**
 * Configuración de roles del sistema
 */
export const ROLE_CONFIG: { [key: number]: RoleInfo } = {
  [UserRole.ADMIN]: {
    id: UserRole.ADMIN,
    name: 'admin',
    displayName: 'Administrador',
    homeRoute: '/adminHome',
    menuComponent: 'MenuAdminComponent',
    canCreate: [UserRole.GERENTE, UserRole.SUPERVISOR, UserRole.COORDINADOR, UserRole.TESTIGO],
    permissions: ['admin', 'manage-users', 'view-all', 'manage-surveys', 'manage-backoffice'],
  },
  [UserRole.GERENTE]: {
    id: UserRole.GERENTE,
    name: 'gerente',
    displayName: 'Gerente',
    homeRoute: '/gerenteHome',
    menuComponent: 'MenuGerenteComponent',
    canCreate: [UserRole.SUPERVISOR, UserRole.COORDINADOR, UserRole.TESTIGO],
    permissions: ['manage-team', 'view-department', 'create-supervisor'],
  },
  [UserRole.SUPERVISOR]: {
    id: UserRole.SUPERVISOR,
    name: 'supervisor',
    displayName: 'Supervisor',
    homeRoute: '/supervisorHome',
    menuComponent: 'MenuSupervisorComponent',
    canCreate: [UserRole.COORDINADOR, UserRole.TESTIGO],
    permissions: ['manage-zone', 'view-zone', 'create-coordinator'],
  },
  [UserRole.COORDINADOR]: {
    id: UserRole.COORDINADOR,
    name: 'coordinador',
    displayName: 'Coordinador',
    homeRoute: '/coordinadorHome',
    menuComponent: 'MenuCoordinadorComponent',
    canCreate: [UserRole.TESTIGO],
    permissions: ['manage-station', 'view-station', 'create-witness', 'view-votes', 'view-incidents'],
  },
  [UserRole.TESTIGO]: {
    id: UserRole.TESTIGO,
    name: 'testigo',
    displayName: 'Testigo',
    homeRoute: '/testigoHome',
    menuComponent: 'MenuTestigoComponent',
    canCreate: [],
    permissions: ['report-votes', 'report-incidents'],
  },
  [UserRole.ADMIN_IMPUGNACIONES]: {
    id: UserRole.ADMIN_IMPUGNACIONES,
    name: 'admin-impugnaciones',
    displayName: 'Admin. Impugnaciones',
    homeRoute: '/menu-admin-impugnaciones',
    menuComponent: 'MenuAdministradorImpugnacionesComponent',
    canCreate: [],
    permissions: ['manage-challenges', 'view-challenges'],
  },
  [UserRole.IMPUGNADOR]: {
    id: UserRole.IMPUGNADOR,
    name: 'impugnador',
    displayName: 'Impugnador',
    homeRoute: '/impugnadorHome',
    menuComponent: 'MenuImpugnadorComponent',
    canCreate: [],
    permissions: ['create-challenge', 'view-own-challenges'],
  },
};

/**
 * Usuario del sistema
 */
export interface User {
  id: number;
  email: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  rol: UserRole;
  tenantId?: string;
  // Campos adicionales según el rol
  departamentoId?: number;
  municipioId?: number;
  zonaId?: number;
  puestoId?: number;
  mesaId?: number;
}

/**
 * Respuesta del login
 */
export interface LoginResponse {
  token: string;
  user: User;
  tenant_id?: string;
}

/**
 * Helper para obtener info del rol
 */
export function getRoleInfo(roleId: number): RoleInfo | null {
  return ROLE_CONFIG[roleId] || null;
}

/**
 * Helper para obtener el home route según el rol
 */
export function getHomeRouteByRole(roleId: number): string {
  const roleInfo = getRoleInfo(roleId);
  return roleInfo?.homeRoute || '/';
}

/**
 * Helper para verificar si un rol puede acceder a una ruta
 */
export function canAccessRoute(userRole: number, allowedRoles: number[]): boolean {
  return allowedRoles.includes(userRole);
}

