import { Injectable } from '@angular/core';
import {
  HttpResponse,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { LoaderService } from '../services/loader/loader.service';
import { AlertService } from '../services/alert/alert.service';
import { Router } from '@angular/router';
import { LocalDataService } from '../services/localData/local-data.service';
import { environment } from '../../environments/environment';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  private requests: HttpRequest<any>[] = [];

  constructor(
    private loaderService: LoaderService,
    private alertService: AlertService,
    private router: Router,
    private localData: LocalDataService
  ) {}

  removeRequest(req: HttpRequest<any>) {
    const i = this.requests.indexOf(req);
    if (i >= 0) {
      this.requests.splice(i, 1);
    }
    
    if (!environment.development) {
      this.loaderService.isLoading.next(this.requests.length > 0);
    }
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.requests.push(req);

    // Mostrar loader solo si no es desarrollo
    if (!environment.development) {
      this.loaderService.isLoading.next(true);
    }
    
    // Usar el patrón moderno de RxJS en lugar de Observable.create
    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          this.removeRequest(req);
        }
      }),
      catchError((err: any) => {
        this.removeRequest(req);
        
        const url = req.url;
        const isSurveyApi = url.includes('localhost:8001') || url.includes('/api/v1/') || url.includes('survey-module');
        const isBackofficeApi = url.includes(environment.backofficeApiURL || 'localhost:8002');
        const isConnectionRefused = err.status === 0 || err.statusText === 'Unknown Error';
        const isLogoutRequest = url.includes('/logout');
        const isSurvey401 = isSurveyApi && err.status === 401;
        
        // No mostrar error para logout, contactos-usuario, errores 401 de encuestas, o cuando el servidor no está disponible
        if ((isConnectionRefused && isBackofficeApi) || url.includes('contactos-usuario') || isLogoutRequest || isSurvey401) {
          if (isSurvey401) {
            // Silenciar errores 401 del servicio de encuestas (esperados si el usuario no tiene permisos)
            // No loguear para evitar ruido en la consola
          } else if (!isLogoutRequest) {
            console.warn('LoaderInterceptor - Servidor backoffice no disponible o petición de contactos, omitiendo alerta de error');
          }
          return throwError(() => err);
        }
        
        if (err.status !== 401) {
          this.alertService.errorAlert(
            'Ha ocurrido un error. Por favor intente nuevamente.'
          );
        } else {
          // Verificar si el usuario es admin autenticado con backoffice
          const isBackofficeAdmin = this.localData.isBackofficeAuthenticated() && 
                                   this.localData.getRol() === '1';
          
          // Si es admin de backoffice y el error es en backofficeApi,
          // NO desloguear porque puede ser un error temporal
          if (isBackofficeAdmin && isBackofficeApi && !isSurveyApi) {
            console.warn('LoaderInterceptor - Error 401 en backofficeApi para admin de backoffice.');
            console.warn('LoaderInterceptor - Esto puede ser un error temporal o de configuración.');
            this.alertService.errorAlert(
              'Error de autenticación: El token del backoffice no es válido para esta operación. ' +
              'Por favor, contacte al administrador del sistema.'
            );
            return throwError(() => err);
          }
          
          if (!isSurveyApi) {
            console.warn('LoaderInterceptor - Error 401 en petición no relacionada con encuestas, limpiando localStorage');
            this.localData.deleteCookies();
            window.location.reload();
          }
          // Si es servicio de encuestas, el error ya fue manejado arriba (isSurvey401)
        }
        
        return throwError(() => err);
      }),
      finalize(() => {
        // Asegurar que se remueve la petición incluso si hay errores no manejados
        this.removeRequest(req);
      })
    );
  }
}
