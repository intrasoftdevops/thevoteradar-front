import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxPermissionsModule } from 'ngx-permissions';

// ============================================
// CORE SERVICES (Nueva arquitectura)
// ============================================
import { TenantService } from './services/tenant.service';
import { AuthService } from './services/auth.service';

// ============================================
// CORE INTERCEPTORS (Nueva arquitectura)
// ============================================
import { TenantInterceptor } from './interceptors/tenant.interceptor';
import { AuthInterceptor } from './interceptors/auth.interceptor';

// ============================================
// LEGACY SERVICES (Se mantienen para compatibilidad)
// ============================================
import { LoaderService } from '../services/loader/loader.service';

// Guards (legacy - se migrarán gradualmente)
import { AuthGuard } from '../guards/AuthGuard/auth.guard';
import { LogoutGuard } from '../guards/LogoutGuard/logout.guard';

// Interceptors (legacy - se mantienen temporalmente)
import { LoaderInterceptor } from '../interceptors/loader-interceptor.service';
import { BackofficeTenantInterceptor } from '../interceptors/backoffice-tenant-interceptor.service';
import { SurveyDomainInterceptor } from '../interceptors/survey-domain-interceptor.service';

/**
 * CoreModule - Módulo singleton que contiene:
 * - Servicios que deben existir una sola vez en toda la app
 * - Guards de autenticación
 * - Interceptores HTTP
 * 
 * IMPORTANTE: Este módulo solo debe importarse en AppModule
 * 
 * Servicios Core (nueva arquitectura):
 * - TenantService: Manejo de multi-tenancy
 * - AuthService: Autenticación centralizada
 * 
 * Servicios Legacy (compatibilidad):
 * - LoaderService, ApiService, LocalDataService, etc.
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    NgxPermissionsModule.forRoot(),
  ],
  providers: [
    // ============================================
    // CORE SERVICES (Nueva arquitectura)
    // ============================================
    TenantService,
    AuthService,
    
    // ============================================
    // LEGACY SERVICES
    // ============================================
    LoaderService,
    
    // Guards
    AuthGuard,
    LogoutGuard,
    
    // ============================================
    // INTERCEPTORS (orden importa)
    // ============================================
    
    // 1. Loader - Muestra loading spinner
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    
    // 2. Tenant - Agrega X-Tenant-ID (nueva arquitectura)
    // NOTA: BackofficeTenantInterceptor removido - TenantInterceptor ya maneja esto
    { provide: HTTP_INTERCEPTORS, useClass: TenantInterceptor, multi: true },
    
    // 3. Auth - Agrega Bearer token (nueva arquitectura)
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    
    // Legacy interceptors (se mantienen solo si son necesarios)
    // BackofficeTenantInterceptor removido - duplicado de TenantInterceptor
    { provide: HTTP_INTERCEPTORS, useClass: SurveyDomainInterceptor, multi: true },
  ],
})
export class CoreModule {
  /**
   * Previene que CoreModule sea importado más de una vez.
   * Solo AppModule debe importarlo.
   */
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule ya está cargado. Solo debe importarse en AppModule.'
      );
    }
  }
}

