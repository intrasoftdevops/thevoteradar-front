import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Interceptor para agregar headers de dominio (X-Forwarded-Host) 
 * en las peticiones al Survey API.
 * 
 * Esto permite que el backend del survey module reconstruya las URLs
 * con el dominio correcto del frontend, similar al middleware de Next.js.
 */
@Injectable()
export class SurveyDomainInterceptor implements HttpInterceptor {
  
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Verificar si la petición es al Survey API
    const surveyApiUrl = environment.surveyApiURL || '';
    const isSurveyApiRequest = surveyApiUrl && req.url.includes(surveyApiUrl);
    
    if (isSurveyApiRequest) {
      // Obtener el dominio y protocolo actual del frontend
      const currentHost = window.location.host;
      const currentProto = window.location.protocol.slice(0, -1); // http o https
      
      // Clonar la petición y agregar los headers de dominio
      const clonedRequest = req.clone({
        setHeaders: {
          'X-Forwarded-Host': currentHost,
          'X-Forwarded-Proto': currentProto,
        }
      });
      
      return next.handle(clonedRequest);
    }
    
    // Si no es una petición al Survey API, continuar sin modificar
    return next.handle(req);
  }
}

