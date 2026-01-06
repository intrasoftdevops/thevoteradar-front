import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TenantConfigService } from '../../../../services/tenant-config/tenant-config.service';
import { TenantListItem } from '../../../../services/tenant-config/tenant-config.types';
import { AlertService } from '../../../../services/alert/alert.service';
import { LocalDataService } from '../../../../services/localData/local-data.service';

@Component({
  selector: 'app-tenant-management',
  templateUrl: './tenant-management.component.html',
  styleUrls: ['./tenant-management.component.scss']
})
export class TenantManagementComponent implements OnInit, OnDestroy {
  tenants: TenantListItem[] = [];
  loading = false;
  error: string | null = null;
  isSuperAdmin = false;
  accessDenied = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private tenantConfigService: TenantConfigService,
    private router: Router,
    private alertService: AlertService,
    private localData: LocalDataService
  ) { }

  ngOnInit(): void {
    // Verificar que el usuario sea super_admin
    this.checkSuperAdminAccess();
    
    if (this.isSuperAdmin) {
      this.loadTenants();
    }
    
    // Suscribirse a cambios en el estado
    const loadingSub = this.tenantConfigService.loading$.subscribe(loading => {
      this.loading = loading;
    });
    
    const errorSub = this.tenantConfigService.error$.subscribe(error => {
      this.error = error;
      if (error) {
        this.alertService.errorAlert(error);
      }
    });

    this.subscriptions.push(loadingSub, errorSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadTenants(): void {
    this.loading = true;
    this.error = null;

    this.tenantConfigService.listTenants().subscribe({
      next: (response) => {
        this.tenants = response.tenants;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.detail || error.message || 'Error al cargar tenants';
        this.loading = false;
        this.alertService.errorAlert(this.error);
      }
    });
  }

  editTenant(tenantId: string): void {
    this.router.navigate(['/panel/configuracion/tenants', tenantId, 'editar']);
  }

  createTenant(): void {
    this.router.navigate(['/panel/configuracion/tenants/nuevo']);
  }

  /**
   * Verifica si el usuario actual tiene rol de super_admin
   */
  private checkSuperAdminAccess(): void {
    const backofficeUser = this.localData.getBackofficeUser();
    
    if (backofficeUser && backofficeUser.role) {
      const role = backofficeUser.role.toLowerCase();
      this.isSuperAdmin = role === 'super_admin';
    } else {
      const rol = this.localData.getRol();
      const rolNumber = rol ? parseInt(rol, 10) : null;
      this.isSuperAdmin = rolNumber === 9;
    }

    if (!this.isSuperAdmin) {
      this.accessDenied = true;
      this.alertService.errorAlert('Acceso denegado. Solo los super administradores pueden gestionar tenants.');
      // Redirigir después de un breve delay
      setTimeout(() => {
        this.router.navigate(['/panel/configuracion/perfil']);
      }, 2000);
    }
  }
}

