import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';

/**
 * AuthInterceptor - Interceptor para autenticación
 * 
 * Responsabilidades:
 * - Agregar token Bearer a peticiones autenticadas
 * - Manejar errores 401 (no autorizado)
 * - Manejar errores 403 (prohibido)
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    // No agregar token a peticiones públicas
    if (this.isPublicRequest(req)) {
      return next.handle(req);
    }

    // Obtener token
    const token = this.authService.getToken();
    
    // Si hay token, agregarlo al header
    if (token) {
      const clonedRequest = req.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return next.handle(clonedRequest).pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  /**
   * Determina si es una petición pública (no necesita auth)
   */
  private isPublicRequest(req: HttpRequest<any>): boolean {
    const url = req.url.toLowerCase();
    
    const publicPaths = [
      '/login',
      '/users/token',
      '/tenant/auth',
      '/survey/', // Landing de encuestas públicas
      '/public/',
    ];
    
    return publicPaths.some(path => url.includes(path));
  }

  /**
   * Maneja errores HTTP relacionados con autenticación
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401) {
      // Solo hacer logout si el error es del backoffice
      // No hacer logout para servicios externos (encuestas, etc.)
      const url = error.url || '';
      const isBackofficeApi = url.includes(environment.backofficeApiURL || 'localhost:8002');
      
      if (isBackofficeApi) {
        // Token expirado o inválido en nuestro backend
        if (!environment.production) {
          console.warn('🔒 AuthInterceptor: Token inválido o expirado en backend principal');
        }
        this.authService.logout();
      } else {
        // Error 401 de servicio externo (encuestas, etc.) - no hacer logout
        if (!environment.production) {
          console.warn('🔒 AuthInterceptor: Error 401 en servicio externo, no haciendo logout');
        }
      }
    }
    
    if (error.status === 403) {
      // Sin permisos
      if (!environment.production) {
        console.warn('🚫 AuthInterceptor: Acceso prohibido');
      }
      // No hacer logout, solo registrar
    }
    
    return throwError(() => error);
  }
}

