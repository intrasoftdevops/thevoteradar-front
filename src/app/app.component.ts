import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { filter, Subscription } from 'rxjs';
import { LocalDataService } from './services/localData/local-data.service';
import { ThemeService } from './services/theme/theme.service';
import { TenantConfigService } from './services/tenant-config/tenant-config.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  rol: any = '';
  subscriber!: Subscription;
  public isDevelopmentMode: boolean = this.checkDevelopmentMode();

  constructor(
    private localData: LocalDataService,
    private router: Router,
    private permissionsService: NgxPermissionsService,
    private themeService: ThemeService,
    private tenantConfigService: TenantConfigService
  ) {}

  ngOnInit() {
    // Cargar configuración del tenant y aplicar tema (no bloqueante)
    this.loadTenantConfig().catch(error => {
      this.themeService.setTheme('default');
    });
    
    this.permissionsService.addPermission([this.getRol()]);
    
    this.subscriber = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(({ urlAfterRedirects }: any) => {
        this.permissionsService.addPermission([this.getRol()]);
        
        if (urlAfterRedirects != '/forbidden') {
          localStorage.setItem('previosUrl', urlAfterRedirects);
        }
        if (localStorage.getItem('previosUrl') == '/forbidden') {
          this.router.navigate(['/']);
        }
      });
  }

  /**
   * Cargar configuración del tenant basándose en el subdominio
   */
  private async loadTenantConfig(): Promise<void> {
    try {
      // Detectar tenant_id desde el dominio
      let tenantId = localStorage.getItem('tenant_id');
      
      if (!tenantId) {
        tenantId = this.themeService.getTenantIdFromDomain();
      }
      
      if (tenantId) {
        await this.themeService.loadThemeFromTenantConfig(tenantId);
      } else {
        this.themeService.setTheme('default');
      }
    } catch (error) {
      this.themeService.setTheme('default');
    }
  }

  getRol(): any {
    this.rol = this.localData.getRol() != '' ? this.localData.getRol() : ['0'];
    
    return this.rol;
  }

  private checkDevelopmentMode(): boolean {
    return environment.development && 
           !environment.production && 
           (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('dev') ||
            window.location.hostname.includes('test'));
  }
}
