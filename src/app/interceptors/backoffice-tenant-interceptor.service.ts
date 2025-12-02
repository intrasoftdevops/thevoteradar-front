import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class BackofficeTenantInterceptor implements HttpInterceptor {
  
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const isLoginRequest = 
      req.url.includes('/users/token') ||
      req.url.endsWith('/users/token');
    
    if (isLoginRequest) {
      const tenantId = environment.defaultTenantId || '473173';
      
      if (req.headers.has('X-Tenant-ID')) {
        return next.handle(req);
      }
      
      const clonedRequest = req.clone({
        setHeaders: {
          'X-Tenant-ID': tenantId
        }
      });
      
      return next.handle(clonedRequest);
    }
    
    return next.handle(req);
  }
}

