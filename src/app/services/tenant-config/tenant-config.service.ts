import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LocalDataService } from '../localData/local-data.service';
import {
  TenantConfigPublic,
  TenantConfigResponse,
  TenantListResponse,
  TenantConfigUpdate,
  TenantCreate
} from './tenant-config.types';

@Injectable({
  providedIn: 'root'
})
export class TenantConfigService {
  private backofficeUrl = environment.backofficeApiURL || '';
  private cachePrefix = 'tenant_config_';
  private cacheTTL = 60 * 60 * 1000; // 1 hora en milisegundos

  // State management
  private currentConfigSubject = new BehaviorSubject<TenantConfigPublic | null>(null);
  public currentConfig$ = this.currentConfigSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(
    private http: HttpClient,
    private localData: LocalDataService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.localData.getToken() || localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Obtiene la configuración pública de un tenant (sin autenticación)
   */
  getTenantConfigPublic(tenantId: string): Observable<TenantConfigPublic> {
    // Verificar caché primero
    const cached = this.getCachedConfig(tenantId);
    if (cached) {
      this.currentConfigSubject.next(cached);
      return of(cached);
    }

    this.loadingSubject.next(true);
    const url = `${this.backofficeUrl}/tenants/${tenantId}/config`;

    return this.http.get<TenantConfigPublic>(url).pipe(
      tap(config => {
        this.cacheConfig(tenantId, config);
        this.currentConfigSubject.next(config);
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        const errorMessage = error.error?.detail || error.message || 'Error al obtener configuración del tenant';
        this.errorSubject.next(errorMessage);
        return throwError(() => error);
      })
    );
  }

  /**
   * Lista todos los tenants (solo super admin)
   */
  listTenants(): Observable<TenantListResponse> {
    this.loadingSubject.next(true);
    const url = `${this.backofficeUrl}/super-admin/tenants`;

    return this.http.get<TenantListResponse>(url, { headers: this.getHeaders() }).pipe(
      tap(() => {
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        const errorMessage = error.error?.detail || error.message || 'Error al listar tenants';
        this.errorSubject.next(errorMessage);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene la configuración completa de un tenant (solo super admin)
   */
  getTenantConfig(tenantId: string): Observable<TenantConfigResponse> {
    this.loadingSubject.next(true);
    const url = `${this.backofficeUrl}/super-admin/tenants/${tenantId}`;

    return this.http.get<TenantConfigResponse>(url, { headers: this.getHeaders() }).pipe(
      tap(() => {
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        const errorMessage = error.error?.detail || error.message || 'Error al obtener configuración del tenant';
        this.errorSubject.next(errorMessage);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza la configuración de un tenant (solo super admin)
   */
  updateTenantConfig(tenantId: string, config: TenantConfigUpdate): Observable<TenantConfigResponse> {
    this.loadingSubject.next(true);
    const url = `${this.backofficeUrl}/super-admin/tenants/${tenantId}`;

    return this.http.put<TenantConfigResponse>(url, config, { headers: this.getHeaders() }).pipe(
      tap(() => {
        // Invalidar caché
        this.invalidateCache(tenantId);
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        const errorMessage = error.error?.detail || error.message || 'Error al actualizar configuración del tenant';
        this.errorSubject.next(errorMessage);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crea un nuevo tenant (solo super admin)
   */
  createTenant(tenant: TenantCreate): Observable<TenantConfigResponse> {
    this.loadingSubject.next(true);
    const url = `${this.backofficeUrl}/super-admin/tenants`;

    return this.http.post<TenantConfigResponse>(url, tenant, { headers: this.getHeaders() }).pipe(
      tap(() => {
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        const errorMessage = error.error?.detail || error.message || 'Error al crear tenant';
        this.errorSubject.next(errorMessage);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene la configuración desde el caché
   */
  private getCachedConfig(tenantId: string): TenantConfigPublic | null {
    try {
      const cacheKey = `${this.cachePrefix}${tenantId}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) {
        return null;
      }

      const parsed = JSON.parse(cached);
      const now = Date.now();
      
      // Verificar si el caché expiró
      if (parsed.expiresAt && now > parsed.expiresAt) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return parsed.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Guarda la configuración en el caché
   */
  private cacheConfig(tenantId: string, config: TenantConfigPublic): void {
    try {
      const cacheKey = `${this.cachePrefix}${tenantId}`;
      const cacheData = {
        data: config,
        expiresAt: Date.now() + this.cacheTTL
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
    }
  }

  /**
   * Invalida el caché de un tenant
   */
  invalidateCache(tenantId: string): void {
    const cacheKey = `${this.cachePrefix}${tenantId}`;
    localStorage.removeItem(cacheKey);
    this.currentConfigSubject.next(null);
  }

  /**
   * Obtiene la configuración actual desde el BehaviorSubject
   */
  getCurrentConfig(): TenantConfigPublic | null {
    return this.currentConfigSubject.value;
  }
}

