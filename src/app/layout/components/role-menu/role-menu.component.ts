import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UserRole, ROLE_CONFIG } from '../../../core/models/user.model';

/**
 * Interfaz para items del menú
 */
export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  roles?: UserRole[];
  badge?: string;
  badgeClass?: string;
}

/**
 * RoleMenuComponent - Menú dinámico basado en el rol del usuario
 * 
 * Este componente elimina la necesidad de tener MenuAdminComponent,
 * MenuGerenteComponent, etc. Un solo componente que cambia según el rol.
 */
@Component({
  selector: 'app-role-menu',
  templateUrl: './role-menu.component.html',
  styleUrls: ['./role-menu.component.scss']
})
export class RoleMenuComponent implements OnChanges {
  @Input() userRole: UserRole | null = null;
  
  menuItems: MenuItem[] = [];
  roleDisplayName = '';
  
  /**
   * Configuración completa de menús por rol
   * Centraliza toda la navegación de la aplicación
   */
  private readonly MENU_CONFIG: { [key in UserRole]?: MenuItem[] } = {
    [UserRole.ADMIN]: [
      {
        label: 'Dashboard',
        icon: 'fas fa-home',
        route: '/adminHome',
      },
      {
        label: 'Gestión de Usuarios',
        icon: 'fas fa-users',
        children: [
          { label: 'Gerentes', icon: 'fas fa-user-tie', route: '/consultarGerente' },
          { label: 'Supervisores', icon: 'fas fa-user-shield', route: '/consultarSupervisor' },
          { label: 'Coordinadores', icon: 'fas fa-user-friends', route: '/consultarCoordinador' },
          { label: 'Testigos', icon: 'fas fa-user', route: '/consultarTestigo' },
        ],
      },
      {
        label: 'Crear Usuario',
        icon: 'fas fa-user-plus',
        children: [
          { label: 'Crear Gerente', icon: 'fas fa-user-tie', route: '/crearGerente' },
          { label: 'Crear Supervisor', icon: 'fas fa-user-shield', route: '/crearSupervisorAdmin' },
          { label: 'Crear Coordinador', icon: 'fas fa-user-friends', route: '/crearCoordinadorAdmin' },
          { label: 'Crear Testigo', icon: 'fas fa-user', route: '/crearTestigoAdmin' },
        ],
      },
      {
        label: 'Estadísticas',
        icon: 'fas fa-chart-bar',
        children: [
          { label: 'Ver Equipo', icon: 'fas fa-users', route: '/consultarEquipoAdmin' },
          { label: 'Estadísticas', icon: 'fas fa-chart-pie', route: '/estadisticasEquipoAdmin' },
        ],
      },
      {
        label: 'Encuestas',
        icon: 'fas fa-poll',
        route: '/admin/surveys',
      },
      {
        label: 'Backoffice',
        icon: 'fas fa-cogs',
        children: [
          { label: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/admin/backoffice/dashboard' },
          { label: 'Usuarios', icon: 'fas fa-users-cog', route: '/admin/backoffice/users' },
          { label: 'Rankings', icon: 'fas fa-trophy', route: '/admin/backoffice/rankings' },
        ],
      },
      {
        label: 'WhatsApp',
        icon: 'fab fa-whatsapp',
        route: '/admin/whatsapp/templates',
      },
    ],
    
    [UserRole.GERENTE]: [
      {
        label: 'Dashboard',
        icon: 'fas fa-home',
        route: '/gerenteHome',
      },
      {
        label: 'Gestión de Usuarios',
        icon: 'fas fa-users',
        children: [
          { label: 'Supervisores', icon: 'fas fa-user-shield', route: '/consultarSupervisor' },
          { label: 'Coordinadores', icon: 'fas fa-user-friends', route: '/consultarCoordinador' },
          { label: 'Testigos', icon: 'fas fa-user', route: '/consultarTestigo' },
        ],
      },
      {
        label: 'Crear Usuario',
        icon: 'fas fa-user-plus',
        children: [
          { label: 'Crear Supervisor', icon: 'fas fa-user-shield', route: '/crearSupervisor' },
          { label: 'Crear Coordinador', icon: 'fas fa-user-friends', route: '/crearCoordinadorGerente' },
          { label: 'Crear Testigo', icon: 'fas fa-user', route: '/crearTestigoGerente' },
        ],
      },
      {
        label: 'Estadísticas',
        icon: 'fas fa-chart-bar',
        children: [
          { label: 'Ver Equipo', icon: 'fas fa-users', route: '/consultarEquipoGerente' },
          { label: 'Estadísticas', icon: 'fas fa-chart-pie', route: '/estadisticasEquipoGerente' },
        ],
      },
    ],
    
    [UserRole.SUPERVISOR]: [
      {
        label: 'Dashboard',
        icon: 'fas fa-home',
        route: '/supervisorHome',
      },
      {
        label: 'Gestión de Usuarios',
        icon: 'fas fa-users',
        children: [
          { label: 'Coordinadores', icon: 'fas fa-user-friends', route: '/consultarCoordinador' },
          { label: 'Testigos', icon: 'fas fa-user', route: '/consultarTestigo' },
        ],
      },
      {
        label: 'Crear Usuario',
        icon: 'fas fa-user-plus',
        children: [
          { label: 'Crear Coordinador', icon: 'fas fa-user-friends', route: '/crearCoordinador' },
          { label: 'Crear Testigo', icon: 'fas fa-user', route: '/crearTestigoSupervisor' },
        ],
      },
      {
        label: 'Estadísticas',
        icon: 'fas fa-chart-bar',
        children: [
          { label: 'Ver Equipo', icon: 'fas fa-users', route: '/consultarEquipoSupervisor' },
          { label: 'Estadísticas', icon: 'fas fa-chart-pie', route: '/estadisticasEquipoSupervisor' },
        ],
      },
    ],
    
    [UserRole.COORDINADOR]: [
      {
        label: 'Dashboard',
        icon: 'fas fa-home',
        route: '/coordinadorHome',
      },
      {
        label: 'Testigos',
        icon: 'fas fa-users',
        children: [
          { label: 'Consultar Testigos', icon: 'fas fa-search', route: '/consultarTestigo' },
          { label: 'Crear Testigo', icon: 'fas fa-user-plus', route: '/crearTestigo' },
        ],
      },
      {
        label: 'Reportes',
        icon: 'fas fa-file-alt',
        children: [
          { label: 'Reporte de Votos', icon: 'fas fa-vote-yea', route: '/reporteVotosCoordinador' },
          { label: 'Incidencias', icon: 'fas fa-exclamation-triangle', route: '/reporteIncidenciasCoordinador' },
        ],
      },
      {
        label: 'Estadísticas',
        icon: 'fas fa-chart-bar',
        children: [
          { label: 'Ver Equipo', icon: 'fas fa-users', route: '/consultarEquipoCoordinador' },
          { label: 'Estadísticas', icon: 'fas fa-chart-pie', route: '/estadisticasEquipoCoordinador' },
        ],
      },
    ],
    
    [UserRole.TESTIGO]: [
      {
        label: 'Dashboard',
        icon: 'fas fa-home',
        route: '/testigoHome',
      },
      {
        label: 'Reportar Votos',
        icon: 'fas fa-vote-yea',
        route: '/reporteVotosTestigo',
      },
      {
        label: 'Reportar Incidencia',
        icon: 'fas fa-exclamation-triangle',
        route: '/reporteIncidencias',
      },
    ],
    
    [UserRole.ADMIN_IMPUGNACIONES]: [
      {
        label: 'Dashboard',
        icon: 'fas fa-home',
        route: '/menu-admin-impugnaciones',
      },
      {
        label: 'Impugnaciones',
        icon: 'fas fa-gavel',
        route: '/administrar-impugnaciones',
      },
    ],
    
    [UserRole.IMPUGNADOR]: [
      {
        label: 'Dashboard',
        icon: 'fas fa-home',
        route: '/impugnadorHome',
      },
      {
        label: 'Impugnar',
        icon: 'fas fa-gavel',
        route: '/impugnar',
      },
    ],
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userRole']) {
      this.updateMenu();
    }
  }

  private updateMenu(): void {
    if (this.userRole) {
      this.menuItems = this.MENU_CONFIG[this.userRole] || [];
      const roleConfig = ROLE_CONFIG[this.userRole];
      this.roleDisplayName = roleConfig?.displayName || '';
    } else {
      this.menuItems = [];
      this.roleDisplayName = '';
    }
  }

  /**
   * Estado de expansión de submenús
   */
  expandedMenus: Set<string> = new Set();

  toggleSubmenu(label: string): void {
    if (this.expandedMenus.has(label)) {
      this.expandedMenus.delete(label);
    } else {
      this.expandedMenus.add(label);
    }
  }

  isExpanded(label: string): boolean {
    return this.expandedMenus.has(label);
  }
}

