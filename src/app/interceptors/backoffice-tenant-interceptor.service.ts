import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ThemeService } from '../services/theme/theme.service';

@Injectable()
export class BackofficeTenantInterceptor implements HttpInterceptor {
  
  constructor(private themeService: ThemeService) {}
  
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const isLoginRequest = 
      req.url.includes('/users/token') ||
      req.url.endsWith('/users/token');
    
    if (isLoginRequest) {
      // Prioridad 1: Tenant temporal guardado para el login
      let tenantId = localStorage.getItem('temp_tenant_id_for_login');
      
      // Prioridad 2: Tenant detectado del dominio
      if (!tenantId) {
        tenantId = this.themeService.getTenantIdFromDomain();
      }
      
      // Prioridad 3: Tenant guardado en localStorage (después de login previo)
      if (!tenantId) {
        tenantId = localStorage.getItem('tenant_id');
      }
      
      // Prioridad 4: Tenant del environment (fallback)
      if (!tenantId) {
        tenantId = environment.defaultTenantId;
      }
      
      if (req.headers.has('X-Tenant-ID')) {
        return next.handle(req);
      }
      
      if (tenantId) {
        const clonedRequest = req.clone({
          setHeaders: {
            'X-Tenant-ID': tenantId
          }
        });
        
        return next.handle(clonedRequest);
      }
    }
    
    return next.handle(req);
  }
}

