// loader-interceptor.service.ts
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
    // No mostrar loading en modo development
    if (!environment.development) {
      this.loaderService.isLoading.next(this.requests.length > 0);
    }
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.requests.push(req);

    //console.log("No of requests--->" + this.requests.length);

    // No mostrar loading en modo development
    if (!environment.development) {
      this.loaderService.isLoading.next(true);
    }
    return Observable.create((observer: any) => {
      const subscription = next.handle(req).subscribe(
        (event) => {
          //console.log(event)
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
          
          console.log('LoaderInterceptor - Error en petición:', url);
          console.log('LoaderInterceptor - Status:', err.status);
          console.log('LoaderInterceptor - Es servicio de encuestas?', isSurveyApi);
          
          // No mostrar error si es un error de conexión al servidor Laravel (puede no estar corriendo)
          // Tampoco mostrar error si es una petición a contactos-usuario (el componente maneja el error)
          if ((isConnectionRefused && isLaravelApi) || url.includes('contactos-usuario')) {
            console.warn('LoaderInterceptor - Servidor Laravel no disponible o petición de contactos, omitiendo alerta de error');
            this.removeRequest(req);
            observer.error(err);
            return;
          }
          
          if (err.status !== 401) {
            this.alertService.errorAlert(
              'Ha ocurrido un error. Por favor intente nuevamente.'
            );
          } else {
            // Solo limpiar localStorage si NO es del servicio de encuestas
            // El servicio de encuestas puede tener problemas de autenticación diferentes
            if (!isSurveyApi) {
              console.warn('LoaderInterceptor - Error 401 en petición no relacionada con encuestas, limpiando localStorage');
              this.localData.deleteCookies();
              window.location.reload();
            } else {
              console.warn('LoaderInterceptor - Error 401 en servicio de encuestas, NO limpiando localStorage');
              // No limpiar localStorage para errores del servicio de encuestas
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
      // remove request from queue when cancelled
      return () => {
        this.removeRequest(req);
        subscription.unsubscribe();
      };
    });
  }
}
