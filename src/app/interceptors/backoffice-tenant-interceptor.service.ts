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
    // Agregar X-Tenant-ID para endpoints que lo requieren
    const requiresTenantId = 
      req.url.includes('/users/token') ||
      req.url.endsWith('/users/token') ||
      req.url.includes('/users/verify-otp') ||
      req.url.endsWith('/users/verify-otp') ||
      req.url.includes('/users/request-otp') ||
      req.url.endsWith('/users/request-otp') ||
      req.url.includes('/users/complete-profile') ||
      req.url.endsWith('/users/complete-profile');
    
    if (requiresTenantId) {
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
      
      // Prioridad 4: Tenant detectado guardado temporalmente
      if (!tenantId) {
        tenantId = localStorage.getItem('detected_tenant_id');
      }
      
      // Prioridad 5: Tenant del environment (fallback)
      if (!tenantId) {
        tenantId = environment.defaultTenantId;
      }
      
      // Validar que tenantId no sea "default" (string literal) o vacío
      if (!tenantId || tenantId === 'default' || tenantId.trim() === '') {
        tenantId = environment.defaultTenantId || '473173'; // Fallback hardcoded si no hay en environment
      }
      
      // Asegurarse de que tenantId no sea null o undefined
      if (!tenantId) {
        // No lanzar error aquí, dejar que el backend lo maneje
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

