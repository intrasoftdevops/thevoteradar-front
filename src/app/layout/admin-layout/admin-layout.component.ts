import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../services/theme/theme.service';
import { TenantService } from '../../core/services/tenant.service';
import { AuthService } from '../../core/services/auth.service';
import { Theme } from '../../core/models/theme.model';

/**
 * AdminLayoutComponent - Layout principal para administradores
 * 
 * Características:
 * - Sidebar lateral con módulos principales
 * - Aware del tenant actual (colores dinámicos)
 * - Sin header superior (solo sidebar)
 * - Área de contenido principal
 * 
 * Estructura:
 * ┌──────────────┬──────────────────────────────────────────┐
 * │              │                                          │
 * │   SIDEBAR    │              CONTENT                     │
 * │   (280px)    │          <router-outlet>                 │
 * │              │                                          │
 * │  - Estructura│                                          │
 * │  - Activación│                                          │
 * │  - Int. Voto │                                          │
 * │  - Día Elect.│                                          │
 * │  - Config    │                                          │
 * │              │                                          │
 * └──────────────┴──────────────────────────────────────────┘
 */
@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  
  currentTheme: Theme | null = null;
  tenantId: string | null = null;
  sidebarCollapsed = false;
  
  private subscriptions = new Subscription();

  constructor(
    private themeService: ThemeService,
    private tenantService: TenantService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Suscribirse al tema actual
    this.subscriptions.add(
      this.themeService.getCurrentTheme().subscribe(theme => {
        this.currentTheme = theme;
      })
    );

    // Suscribirse al tenant actual
    this.subscriptions.add(
      this.tenantService.tenantId$.subscribe(tenantId => {
        this.tenantId = tenantId;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Toggle colapsar/expandir sidebar
   */
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    console.log('🔄 AdminLayout - Sidebar collapsed:', this.sidebarCollapsed);
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.authService.logout();
  }
}

