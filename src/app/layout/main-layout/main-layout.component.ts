import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { TenantService } from '../../core/services/tenant.service';
import { UserRole, ROLE_CONFIG } from '../../core/models/user.model';

/**
 * MainLayoutComponent - Layout principal para usuarios autenticados
 * 
 * Estructura:
 * ┌─────────────────────────────────────────────────┐
 * │                    HEADER                        │
 * ├──────────────┬──────────────────────────────────┤
 * │              │                                  │
 * │   SIDEBAR    │          CONTENT                 │
 * │   (MENU)     │      <router-outlet>             │
 * │              │                                  │
 * └──────────────┴──────────────────────────────────┘
 */
@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  
  userRole: UserRole | null = null;
  roleName: string = '';
  sidebarCollapsed = false;
  menuConfig: 'admin' | 'testigo' | 'coordinador' | 'supervisor' | 'gerente' | 'admin-impugnaciones' | 'impugnador' = 'testigo';
  
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private tenantService: TenantService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadUserInfo(): void {
    const rolNumber = this.authService.getRolNumber();
    if (rolNumber) {
      this.userRole = rolNumber as UserRole;
      const roleConfig = ROLE_CONFIG[rolNumber];
      this.roleName = roleConfig?.displayName || '';
      
      // Configurar el menú según el rol
      if (rolNumber === UserRole.TESTIGO) {
        this.menuConfig = 'testigo';
      } else if (rolNumber === UserRole.COORDINADOR) {
        this.menuConfig = 'coordinador';
      } else if (rolNumber === UserRole.SUPERVISOR) {
        this.menuConfig = 'supervisor';
      } else if (rolNumber === UserRole.GERENTE) {
        this.menuConfig = 'gerente';
      } else if (rolNumber === UserRole.ADMIN_IMPUGNACIONES) {
        this.menuConfig = 'admin-impugnaciones';
      } else if (rolNumber === UserRole.IMPUGNADOR) {
        this.menuConfig = 'impugnador';
      } else {
        this.menuConfig = 'admin';
      }
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }
}

