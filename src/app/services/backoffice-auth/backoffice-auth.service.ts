import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface BackofficeLoginRequest {
  username: string;
  password: string;
  tenant_id?: string; 
}

export interface BackofficeLoginResponse {
  access_token: string;
  token_type: string;
  user: {
    email: string;
    role: string;
    phone?: string;
    name?: string;
    lastname?: string;
    tenant_id?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BackofficeAuthService {

  private backofficeUrl = environment.backofficeApiURL || '';

  constructor(private http: HttpClient) { }

  /**
   * Login al backoffice
   * @param email Email del usuario (se envía como username)
   * @param password Contraseña del usuario
   * @returns Observable con la respuesta del login
   * 
   * Flujo:
   * 1. Login: Frontend envía email, password y X-Tenant-ID → Backend devuelve token
   * 2. Almacenar: Guardar access_token y tenant_id en localStorage
   * 3. Peticiones protegidas: Enviar solo Authorization: Bearer <token> (el tenant_id viene en el token)
   * 
   * Body (form-data):
   * - username: email del usuario
   * - password: contraseña del usuario
   */
  login(email: string, password: string, tenantId?: string): Observable<BackofficeLoginResponse> {
    const url = `${this.backofficeUrl}/users/token`;
    
    // Headers - El interceptor agregará automáticamente X-Tenant-ID solo para el login
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);

    return this.http.post<BackofficeLoginResponse>(url, body.toString(), { headers })
      .pipe(
        catchError(error => {
          console.error('Error en login de backoffice:', error);
          return throwError(() => error);
        })
      );
  }

  getAuthHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  validateToken(token: string): Observable<any> {
    const url = `${this.backofficeUrl}/users/me/`;
    const headers = this.getAuthHeaders(token);
    
    return this.http.get(url, { headers })
      .pipe(
        catchError(error => {
          console.error('Error validando token de backoffice:', error);
          return throwError(() => error);
        })
      );
  }

  isAdmin(userResponse: BackofficeLoginResponse): boolean {
    const role = userResponse.user?.role?.toLowerCase();
    return role === 'admin' || role === 'super_admin';
  }
}

