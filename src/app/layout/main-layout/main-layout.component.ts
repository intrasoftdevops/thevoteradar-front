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
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }
}

