import { Component, OnInit, Input, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService } from '../../../services/theme/theme.service';
import { Theme } from '../../../core/models/theme.model';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../services/api/api.service';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { NgxPermissionsService } from 'ngx-permissions';

/**
 * Interfaz para items del menú principal
 */
export interface MainMenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: SubMenuItem[];
  badge?: string;
  badgeColor?: string;
  disabled?: boolean;
  comingSoon?: boolean;
}

export interface SubMenuItem {
  id: string;
  label: string;
  icon?: string;
  route: string;
}

/**
 * SidebarMenuComponent - Menú lateral principal de la aplicación
 * 
 * Diseño moderno con módulos principales:
 * - Inicio
 * - Estructura (Rankings, Usuarios, Dashboard)
 * - Activación (Challenges - próximamente)
 * - Intención de Voto (Encuestas)
 * - Día Electoral (Futuro)
 * - Configuración (WhatsApp, Perfil)
 */
@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit, OnChanges {
  @Input() collapsed: boolean = false;
  /**
   * Tipo de menú:
   * - 'admin': menú completo de backoffice (por defecto)
   * - 'testigo': menú simplificado para rol Testigo
   * - 'coordinador': menú para rol Coordinador
   * - 'supervisor': menú para rol Supervisor
   * - 'gerente': menú para rol Gerente
   * - 'admin-impugnaciones': menú para rol Admin. Impugnaciones
   * - 'impugnador': menú para rol Impugnador
   */
  @Input() menuConfig: 'admin' | 'testigo' | 'coordinador' | 'supervisor' | 'gerente' | 'admin-impugnaciones' | 'impugnador' = 'admin';
  
  currentTheme: Theme | null = null;
  activeMenuItem: string = '';
  expandedMenus: Set<string> = new Set();
  currentRoute: string = '';
  manuallyExpandedMenus: Set<string> = new Set(); // Menús expandidos manualmente por el usuario
  manuallyCollapsedMenus: Set<string> = new Set(); // Menús colapsados manualmente (override contra auto-expansión)

  /**
   * Configuración del menú principal
   */
  menuItems: MainMenuItem[] = [];

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private apiService: ApiService,
    private localData: LocalDataService,
    private permissionsService: NgxPermissionsService,
  ) {}

  ngOnInit(): void {
    // Construir menú según configuración
    this.buildMenuItems();

    // Suscribirse al tema actual
    this.themeService.getCurrentTheme().subscribe(theme => {
      this.currentTheme = theme;
      this.cdr.detectChanges();
    });

    // Detectar ruta activa
    this.currentRoute = this.router.url;
    this.detectActiveMenu();

    // Escuchar cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects || event.url;
      this.detectActiveMenu();
      this.cdr.detectChanges();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['menuConfig'] && !changes['menuConfig'].firstChange) {
      this.buildMenuItems();
    }
    // Cuando cambia el estado de collapsed
    if (changes['collapsed']) {
      // Si el sidebar se colapsa, NO limpiamos los menús expandidos
      // Simplemente dejamos que el CSS los oculte con el *ngIf="!collapsed"
      // De esta forma, cuando se expanda de nuevo, los menús volverán a su estado anterior
      
      // Si el sidebar se expande, detectar la ruta activa para expandir el menú correcto
      if (!this.collapsed) {
        this.detectActiveMenu();
      }
      
      // Forzar múltiples ciclos de detección para asegurar que el cambio se aplique
      this.cdr.detectChanges();
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    }
  }

  /**
   * Construye el menú según el tipo configurado
   */
  private buildMenuItems(): void {
    if (this.menuConfig === 'testigo') {
      this.menuItems = [
        {
          id: 'testigo-dashboard',
          label: 'Dashboard',
          icon: 'fas fa-home',
          route: '/testigoHome',
        },
        {
          id: 'testigo-reportar-votos',
          label: 'Reportar Votos',
          icon: 'fas fa-clipboard-check',
          route: '/reporteVotosTestigo',
        },
        {
          id: 'testigo-reportar-incidencia',
          label: 'Reportar Incidencia',
          icon: 'fas fa-exclamation-triangle',
          route: '/reporteIncidencias',
        },
      ];
    } else if (this.menuConfig === 'coordinador') {
      this.menuItems = [
        {
          id: 'coordinador-dashboard',
          label: 'Dashboard',
          icon: 'fas fa-home',
          route: '/coordinadorHome',
        },
        {
          id: 'coordinador-testigos',
          label: 'Testigos',
          icon: 'fas fa-users',
          children: [
            { id: 'consultar-testigos', label: 'Consultar Testigos', icon: 'fas fa-search', route: '/consultarTestigo' },
            { id: 'crear-testigo', label: 'Crear Testigo', icon: 'fas fa-user-plus', route: '/crearTestigo' },
          ],
        },
        {
          id: 'coordinador-reportes',
          label: 'Reportes',
          icon: 'fas fa-file-alt',
          children: [
            { id: 'reporte-votos', label: 'Reporte de Votos', icon: 'fas fa-vote-yea', route: '/reporteVotosCoordinador' },
            { id: 'incidencias', label: 'Incidencias', icon: 'fas fa-exclamation-triangle', route: '/reporteIncidenciasCoordinador' },
          ],
        },
        {
          id: 'coordinador-estadisticas',
          label: 'Estadísticas',
          icon: 'fas fa-chart-bar',
          children: [
            { id: 'ver-equipo', label: 'Ver Equipo', icon: 'fas fa-users', route: '/consultarEquipoCoordinador' },
            { id: 'estadisticas-equipo', label: 'Estadísticas', icon: 'fas fa-chart-pie', route: '/estadisticasEquipoCoordinador' },
          ],
        },
      ];
    } else if (this.menuConfig === 'supervisor') {
      this.menuItems = [
        {
          id: 'supervisor-dashboard',
          label: 'Dashboard',
          icon: 'fas fa-home',
          route: '/supervisorHome',
        },
        {
          id: 'supervisor-coordinadores',
          label: 'Coordinadores',
          icon: 'fas fa-user-friends',
          children: [
            { id: 'consultar-coordinadores', label: 'Consultar Coordinadores', icon: 'fas fa-search', route: '/consultarCoordinador' },
            { id: 'crear-coordinador', label: 'Crear Coordinador', icon: 'fas fa-user-plus', route: '/crearCoordinador' },
          ],
        },
        {
          id: 'supervisor-testigos',
          label: 'Testigos',
          icon: 'fas fa-users',
          children: [
            { id: 'crear-testigo-supervisor', label: 'Crear Testigo', icon: 'fas fa-user-plus', route: '/crearTestigoSupervisor' },
          ],
        },
        {
          id: 'supervisor-estadisticas',
          label: 'Estadísticas',
          icon: 'fas fa-chart-bar',
          children: [
            { id: 'ver-equipo-supervisor', label: 'Ver Equipo', icon: 'fas fa-users', route: '/consultarEquipoSupervisor' },
            { id: 'estadisticas-equipo-supervisor', label: 'Estadísticas', icon: 'fas fa-chart-pie', route: '/estadisticasEquipoSupervisor' },
          ],
        },
      ];
    } else if (this.menuConfig === 'gerente') {
      this.menuItems = [
        {
          id: 'gerente-dashboard',
          label: 'Dashboard',
          icon: 'fas fa-home',
          route: '/gerenteHome',
        },
        {
          id: 'gerente-supervisores',
          label: 'Supervisores',
          icon: 'fas fa-user-shield',
          children: [
            { id: 'consultar-supervisores', label: 'Consultar Supervisores', icon: 'fas fa-search', route: '/consultarSupervisor' },
            { id: 'crear-supervisor', label: 'Crear Supervisor', icon: 'fas fa-user-plus', route: '/crearSupervisor' },
          ],
        },
        {
          id: 'gerente-coordinadores',
          label: 'Coordinadores',
          icon: 'fas fa-user-friends',
          children: [
            { id: 'crear-coordinador-gerente', label: 'Crear Coordinador', icon: 'fas fa-user-plus', route: '/crearCoordinadorGerente' },
          ],
        },
        {
          id: 'gerente-testigos',
          label: 'Testigos',
          icon: 'fas fa-users',
          children: [
            { id: 'crear-testigo-gerente', label: 'Crear Testigo', icon: 'fas fa-user-plus', route: '/crearTestigoGerente' },
          ],
        },
        {
          id: 'gerente-estadisticas',
          label: 'Estadísticas',
          icon: 'fas fa-chart-bar',
          children: [
            { id: 'ver-equipo-gerente', label: 'Ver Equipo', icon: 'fas fa-users', route: '/consultarEquipoGerente' },
            { id: 'estadisticas-equipo-gerente', label: 'Estadísticas', icon: 'fas fa-chart-pie', route: '/estadisticasEquipoGerente' },
          ],
        },
      ];
    } else if (this.menuConfig === 'admin-impugnaciones') {
      this.menuItems = [
        {
          id: 'admin-impugnaciones-dashboard',
          label: 'Dashboard',
          icon: 'fas fa-home',
          route: '/menu-admin-impugnaciones',
        },
        {
          id: 'admin-impugnaciones-gestion',
          label: 'Gestión',
          icon: 'fas fa-file-signature',
          children: [
            { id: 'administrar-impugnaciones', label: 'Administrar Impugnaciones', icon: 'fas fa-list', route: '/administrar-impugnaciones' },
          ],
        },
      ];
    } else if (this.menuConfig === 'impugnador') {
      this.menuItems = [
        {
          id: 'impugnador-dashboard',
          label: 'Dashboard',
          icon: 'fas fa-home',
          route: '/impugnadorHome',
        },
        {
          id: 'impugnador-acciones',
          label: 'Acciones',
          icon: 'fas fa-file-signature',
          children: [
            { id: 'impugnar', label: 'Impugnar', icon: 'fas fa-exclamation-triangle', route: '/impugnar' },
          ],
        },
      ];
    } else {
      // Menú original de admin
      this.menuItems = [
        {
          id: 'inicio',
          label: 'Inicio',
          icon: 'fas fa-home',
          route: '/inicio',
        },
        {
          id: 'estructura',
          label: 'Estructura',
          icon: 'fas fa-sitemap',
          children: [
            { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line', route: '/panel/estructura/dashboard' },
            { id: 'usuarios', label: 'Usuarios', icon: 'fas fa-users', route: '/panel/estructura/usuarios' },
            { id: 'rankings', label: 'Rankings', icon: 'fas fa-trophy', route: '/panel/estructura' },
            { id: 'equipo', label: 'Ver Equipo', icon: 'fas fa-users-cog', route: '/panel/estructura/equipo' },
            { id: 'estadisticas', label: 'Estadísticas', icon: 'fas fa-chart-pie', route: '/panel/estructura/estadisticas' },
          ]
        },
        {
          id: 'gestion-usuarios',
          label: 'Gestión de Usuarios',
          icon: 'fas fa-user-cog',
          children: [
            {
              id: 'gerentes',
              label: 'Gerentes',
              icon: 'fas fa-user-tie',
              route: '/panel/usuarios/gerentes'
            },
            {
              id: 'supervisores',
              label: 'Supervisores',
              icon: 'fas fa-users-cog',
              route: '/panel/usuarios/supervisores'
            },
            {
              id: 'coordinadores',
              label: 'Coordinadores',
              icon: 'fas fa-user-friends',
              route: '/panel/usuarios/coordinadores'
            },
            {
              id: 'testigos',
              label: 'Testigos',
              icon: 'fas fa-user-check',
              route: '/panel/usuarios/testigos'
            },
          ]
        },
        {
          id: 'activacion',
          label: 'Activación',
          icon: 'fas fa-bolt',
          children: [
            { id: 'challenges', label: 'Retos', icon: 'fas fa-tasks', route: '/panel/activacion/challenges' },
            { id: 'whatsapp', label: 'WhatsApp', icon: 'fab fa-whatsapp', route: '/panel/activacion/whatsapp' },
          ]
        },
        {
          id: 'intencion-voto',
          label: 'Intención de Voto',
          icon: 'fas fa-poll',
          children: [
            { id: 'encuestas', label: 'Encuestas', icon: 'fas fa-clipboard-list', route: '/panel/encuestas' },
            { id: 'muestra-opinion', label: 'Muestra (Voto Opinión)', icon: 'fas fa-users', route: '/panel/voto-opinion/muestra' },
          ]
        },
        {
          id: 'dia-electoral',
          label: 'Día Electoral',
          icon: 'fas fa-calendar-check',
          comingSoon: true,
          children: [
            { id: 'gerentes', label: 'Gerentes', icon: 'fas fa-user-tie', route: '/panel/dia-electoral/gerentes' },
            { id: 'supervisores', label: 'Supervisores', icon: 'fas fa-users-cog', route: '/panel/dia-electoral/supervisores' },
            { id: 'coordinadores', label: 'Coordinadores', icon: 'fas fa-user-friends', route: '/panel/dia-electoral/coordinadores' },
            { id: 'testigos', label: 'Testigos', icon: 'fas fa-user-check', route: '/panel/dia-electoral/testigos' },
            { id: 'reportes', label: 'Reportes', icon: 'fas fa-file-alt', route: '/panel/dia-electoral/reportes' },
            { id: 'mapa', label: 'Mapa en Vivo', icon: 'fas fa-map-marked-alt', route: '/panel/dia-electoral/mapa' },
          ]
        },
        {
          id: 'configuracion',
          label: 'Configuración',
          icon: 'fas fa-cog',
          children: [
            { id: 'perfil', label: 'Mi Perfil', icon: 'fas fa-user-edit', route: '/panel/configuracion/perfil' },
            ...(this.isSuperAdmin() ? [{ id: 'tenants', label: 'Tenants', icon: 'fas fa-building', route: '/panel/configuracion/tenants' }] : []),
          ]
        },
      ];
    }
  }

  /**
   * Detecta y expande el menú correspondiente a la ruta actual
   * Respeta los menús expandidos manualmente por el usuario
   */
  private detectActiveMenu(): void {
    // Guardar los menús expandidos manualmente antes de detectar la ruta activa
    const manuallyExpanded = new Set(this.manuallyExpandedMenus);
    
    // Limpiar el estado activo anterior, pero mantener los expandidos manualmente
    this.activeMenuItem = '';
    
    // Identificar qué menú padre debe estar expandido por ruta activa
    let parentMenuToExpand: string | null = null;
    
    for (const item of this.menuItems) {
      // Check direct route match
      if (item.route && this.currentRoute === item.route) {
        this.activeMenuItem = item.id;
        // Restaurar menús expandidos manualmente
        manuallyExpanded.forEach(menuId => this.expandedMenus.add(menuId));
        return;
      }
      
      // Check children
      if (item.children) {
        for (const child of item.children) {
          // Verificar si la ruta actual coincide con alguna ruta hija
          if (child.route) {
            // Comparación más precisa: exacta o si la ruta actual comienza con la ruta del child
            const routeMatches = this.currentRoute === child.route || 
                                this.currentRoute.startsWith(child.route + '/') ||
                                (this.currentRoute.includes(child.route) && child.route.length > 0);
            
            if (routeMatches) {
              this.activeMenuItem = child.id;
              parentMenuToExpand = item.id;
              break; // Salir del loop de children
            }
          }
        }
      }
    }
    
    // Si encontramos un menú padre que debe estar expandido, expandirlo
    if (parentMenuToExpand) {
      // Respetar colapso manual: si el usuario cerró este menú, no lo reabrimos automáticamente
      if (!this.manuallyCollapsedMenus.has(parentMenuToExpand)) {
        this.expandedMenus.add(parentMenuToExpand);
      }
    }
    
    // Restaurar menús expandidos manualmente (después de expandir por ruta activa)
    manuallyExpanded.forEach(menuId => {
      if (!this.manuallyCollapsedMenus.has(menuId)) {
        this.expandedMenus.add(menuId);
      }
    });
  }

  /**
   * Toggle expansión de submenú
   * Marca el menú como expandido manualmente para que no se colapse automáticamente
   */
  toggleMenu(menuId: string, event?: Event): void {
    // Prevenir propagación del evento si está disponible
    if (event) {
      event.stopPropagation();
    }
    
    const wasExpanded = this.expandedMenus.has(menuId);
    
    if (wasExpanded) {
      // Colapsar
      this.expandedMenus.delete(menuId);
      this.manuallyExpandedMenus.delete(menuId);
      this.manuallyCollapsedMenus.add(menuId);
    } else {
      // Expandir
      this.expandedMenus.add(menuId);
      this.manuallyExpandedMenus.add(menuId); // Marcar como expandido manualmente
      this.manuallyCollapsedMenus.delete(menuId);
    }
    
    // Forzar detección de cambios para asegurar que la UI se actualice
    this.cdr.detectChanges();
  }

  /**
   * Verifica si un menú está expandido
   */
  isExpanded(menuId: string): boolean {
    return this.expandedMenus.has(menuId);
  }

  /**
   * Verifica si un item está activo
   */
  isActive(itemId: string): boolean {
    return this.activeMenuItem === itemId;
  }

  /**
   * Navega a una ruta
   */
  navigateTo(route: string, itemId: string): void {
    this.activeMenuItem = itemId;
    this.router.navigate([route]);
  }

  /**
   * Verifica si un menú padre tiene un hijo activo
   */
  hasActiveChild(menuId: string): boolean {
    const menu = this.menuItems.find(m => m.id === menuId);
    if (menu?.children) {
      return menu.children.some(child => this.isActive(child.id));
    }
    return false;
  }

  /**
   * Navega al home
   */
  goToHome(): void {
    this.router.navigate(['/inicio']).then(
      (success) => {
        if (!success) {
          console.error('❌ SidebarMenu - Navegación falló');
        }
      }
    ).catch((error) => {
      console.error('❌ SidebarMenu - Error en navegación:', error);
    });
  }

  /**
   * Verifica si el usuario actual es super_admin
   */
  isSuperAdmin(): boolean {
    const backofficeUser = this.localData.getBackofficeUser();
    
    if (backofficeUser && backofficeUser.role) {
      const role = backofficeUser.role.toLowerCase();
      return role === 'super_admin';
    }
    
    const rol = this.localData.getRol();
    const rolNumber = rol ? parseInt(rol, 10) : null;
    return rolNumber === 9;
  }

  /**
   * Obtiene el nombre a mostrar del rol según la configuración del menú
   */
  getRoleDisplayName(): string {
    switch (this.menuConfig) {
      case 'testigo':
        return 'Testigo';
      case 'coordinador':
        return 'Coordinador';
      case 'supervisor':
        return 'Supervisor';
      case 'gerente':
        return 'Gerente';
      case 'admin-impugnaciones':
        return 'Admin. Impugnaciones';
      case 'impugnador':
        return 'Impugnador';
      case 'admin':
      default:
        return 'Administrador';
    }
  }

  /**
   * Cerrar sesión del usuario
   */
  logout(): void {
    // Limpiar datos localmente primero
    this.localData.deleteCookies();
    this.permissionsService.addPermission(['0']);
    this.authService.clearAll();
    
    // Intentar logout en el backend, pero ignorar errores silenciosamente
    // (el token puede estar expirado o el servidor puede no estar disponible)
    this.apiService.logout().subscribe({
      next: () => {
        // Logout exitoso, navegar al login
        this.router.navigate(['']);
      },
      error: () => {
        // Ignorar errores silenciosamente - ya limpiamos todo localmente
        // Navegar al login de todas formas
        this.router.navigate(['']);
      },
    });
  }
}
