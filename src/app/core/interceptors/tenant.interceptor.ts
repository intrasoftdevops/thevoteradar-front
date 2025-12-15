import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { TenantService } from '../services/tenant.service';
import { environment } from 'src/environments/environment';

/**
 * TenantInterceptor - Interceptor mejorado para multi-tenancy
 * 
 * Agrega automáticamente el header X-Tenant-ID a las peticiones
 * que lo requieran (principalmente login y peticiones al backoffice)
 * 
 * Prioridad de detección:
 * 1. Tenant temporal para login
 * 2. Tenant guardado (después de login)
 * 3. Tenant detectado desde dominio
 * 4. Tenant por defecto del environment
 */
@Injectable()
export class TenantInterceptor implements HttpInterceptor {

  constructor(private tenantService: TenantService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    // Solo agregar header a peticiones que lo necesiten
    if (!this.shouldAddTenantHeader(req)) {
      return next.handle(req);
    }

    // Si ya tiene el header, no modificar
    if (req.headers.has('X-Tenant-ID')) {
      return next.handle(req);
    }

    // Obtener tenant ID
    const tenantId = this.getTenantId();
    
    if (tenantId) {
      const clonedRequest = req.clone({
        setHeaders: {
          'X-Tenant-ID': tenantId
        }
      });
      
      if (!environment.production) {
        console.log(`🔐 TenantInterceptor: Agregando X-Tenant-ID: ${tenantId} a ${req.url}`);
      }
      
      return next.handle(clonedRequest);
    }

    return next.handle(req);
  }

  /**
   * Determina si la petición necesita el header X-Tenant-ID
   */
  private shouldAddTenantHeader(req: HttpRequest<any>): boolean {
    const url = req.url.toLowerCase();
    
    // Peticiones de login
    if (url.includes('/users/token') || url.includes('/login')) {
      return true;
    }
    
    // Peticiones al backoffice
    if (url.includes('/backoffice') || url.includes(environment.backofficeApiURL || '')) {
      return true;
    }
    
    // Peticiones de autenticación de tenant
    if (url.includes('/tenant/auth')) {
      return true;
    }
    
    return false;
  }

  /**
   * Obtiene el tenant ID con prioridad correcta
   */
  private getTenantId(): string | null {
    // Usar el TenantService que maneja las prioridades
    const tenantId = this.tenantService.getTenantIdForRequest();
    
    if (tenantId) {
      return tenantId;
    }
    
    // Fallback: tenant por defecto del environment
    return environment.defaultTenantId || null;
  }
}

