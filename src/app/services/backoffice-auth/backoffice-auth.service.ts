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
  access_token?: string;
  token_type?: string;
  user?: {
    email: string;
    role: string;
    phone?: string;
    name?: string;
    lastname?: string;
    tenant_id?: string;
  };
  voteradar_token?: string;  // Token de voteradar-back (MySQL) si el usuario es admin
  voteradar_user_id?: number;  // ID del usuario en voteradar-back
  requires_profile_completion?: boolean;
  requires_otp?: boolean;
  verification_id?: string;
  remote_user?: any;
  missing_fields?: string[];
  message?: string;
  res?: boolean;
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
   * 1. Login: Frontend envía email, password → El interceptor agrega automáticamente X-Tenant-ID → Backend devuelve token
   * 2. Almacenar: Guardar access_token y tenant_id en localStorage
   * 3. Peticiones protegidas: Enviar solo Authorization: Bearer <token> (el tenant_id viene en el token)
   * 
   * Nota: El header X-Tenant-ID se agrega automáticamente por el BackofficeTenantInterceptor
   * usando el valor de environment.defaultTenantId
   * 
   * Body (form-data):
   * - username: email del usuario
   * - password: contraseña del usuario
   */
  login(email: string, password: string): Observable<BackofficeLoginResponse> {
    const url = `${this.backofficeUrl}/users/token`;
    
    
    // Headers - El interceptor agregará automáticamente X-Tenant-ID usando environment.defaultTenantId
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);

    return this.http.post<BackofficeLoginResponse>(url, body.toString(), { headers })
      .pipe(
        catchError(error => {
          console.error('❌ Error en login de backoffice:', {
            url,
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            message: error.message
          });
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

  /**
   * Completa el perfil de un usuario después de la verificación OTP
   * @param profileData Datos del perfil a completar
   * @returns Observable con la respuesta del completar perfil
   */
  requestOtp(data: {
    email?: string;
    telefono?: string;
    tenant_code?: string;
    user_data?: any;
  }): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    // Agregar X-Tenant-ID si está disponible (desde tenant_code o localStorage)
    const tenantId = data.tenant_code || localStorage.getItem('temp_tenant_id_for_login') || null;
    if (tenantId) {
      headers = headers.set('X-Tenant-ID', tenantId);
    }
    
    const requestData: any = {};
    if (data.email) requestData.email = data.email;
    if (data.telefono) requestData.telefono = data.telefono;
    if (data.tenant_code) requestData.tenant_code = data.tenant_code;
    if (data.user_data) requestData.user_data = data.user_data;
    
    return this.http.post(`${this.backofficeUrl}/users/request-otp`, requestData, { headers })
      .pipe(
        catchError(error => {
          console.error('Error solicitando OTP:', error);
          return throwError(() => error);
        })
      );
  }

  verifyOtp(otp: string, verificationId: string): Observable<any> {
    const url = `${this.backofficeUrl}/users/verify-otp`;
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    // Agregar X-Tenant-ID si está disponible (desde localStorage o environment)
    const tenantId = localStorage.getItem('temp_tenant_id_for_login') || 
                     localStorage.getItem('tenant_id') || 
                     null;
    if (tenantId) {
      headers = headers.set('X-Tenant-ID', tenantId);
    } else {
      // Si no hay tenant_id en localStorage, usar el de environment como fallback
      const envTenantId = (environment as any).defaultTenantId;
      if (envTenantId) {
        headers = headers.set('X-Tenant-ID', envTenantId);
      }
    }

    return this.http.post(url, { otp, verification_id: verificationId }, { headers })
      .pipe(
        catchError(error => {
          console.error('Error verificando OTP:', error);
          return throwError(() => error);
        })
      );
  }

  completeProfile(profileData: {
    email: string;
    otp: string;
    verification_id?: string;
    nombres: string;
    apellidos: string;
    numero_documento: string;
    password: string;
    password_confirmation: string;
    telefono?: string;
  }): Observable<BackofficeLoginResponse> {
    const url = `${this.backofficeUrl}/users/complete-profile`;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<BackofficeLoginResponse>(url, profileData, { headers })
      .pipe(
        catchError(error => {
          console.error('Error completando perfil:', error);
          return throwError(() => error);
        })
      );
  }
}

