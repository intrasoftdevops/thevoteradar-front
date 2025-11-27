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

  login(email: string, password: string, tenantId?: string): Observable<BackofficeLoginResponse> {
    const url = `${this.backofficeUrl}/users/token`;
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    if (tenantId) {
      headers = headers.set('X-Tenant-ID', tenantId);
    }

    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);
    if (tenantId && !headers.has('X-Tenant-ID')) {
      body.set('tenant_id', tenantId);
    }

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

