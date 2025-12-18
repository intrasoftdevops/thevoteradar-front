import { Injectable } from '@angular/core';
import {
  HttpResponse,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
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

    

    
    if (!environment.development) {
      this.loaderService.isLoading.next(true);
    }
    return Observable.create((observer: any) => {
      const subscription = next.handle(req).subscribe(
        (event) => {
          
          if (event instanceof HttpResponse) {
            this.removeRequest(req);
            observer.next(event);
          }
        },
        (err) => {
          const url = req.url;
          const isSurveyApi = url.includes('localhost:8001') || url.includes('/api/v1/');
          const isLaravelApi = url.includes('localhost:8000') || url.includes(environment.apiURL);
          const isConnectionRefused = err.status === 0 || err.statusText === 'Unknown Error';
          const isLogoutRequest = url.includes('/logout');
          
          
          
          
          // No mostrar error para logout, contactos-usuario, o cuando el servidor no está disponible
          if ((isConnectionRefused && isLaravelApi) || url.includes('contactos-usuario') || isLogoutRequest) {
            if (isLogoutRequest) {
              console.log('LoaderInterceptor - Logout request, omitiendo alerta de error');
            } else {
              console.warn('LoaderInterceptor - Servidor Laravel no disponible o petición de contactos, omitiendo alerta de error');
            }
            this.removeRequest(req);
            observer.error(err);
            return;
          }
          
          if (err.status !== 401) {
            this.alertService.errorAlert(
              'Ha ocurrido un error. Por favor intente nuevamente.'
            );
          } else {
            
            
            if (!isSurveyApi) {
              console.warn('LoaderInterceptor - Error 401 en petición no relacionada con encuestas, limpiando localStorage');
              this.localData.deleteCookies();
              window.location.reload();
            } else {
              console.warn('LoaderInterceptor - Error 401 en servicio de encuestas, NO limpiando localStorage');
              
            }
          }
          this.removeRequest(req);
          observer.error(err);
        },
        () => {
          this.removeRequest(req);
          observer.complete();
        }
      );
      
      return () => {
        this.removeRequest(req);
        subscription.unsubscribe();
      };
    });
  }
}
