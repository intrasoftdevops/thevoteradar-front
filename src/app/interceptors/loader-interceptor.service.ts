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
          if (err.status !== 401) {
            this.alertService.errorAlert(
              'Ha ocurrido un error. Por favor intente nuevamente.'
            );
          } else {
            this.localData.deleteCookies();
            window.location.reload();
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
