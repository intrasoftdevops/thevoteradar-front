import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { 
  Tenant, 
  DOMAIN_TENANT_MAP, 
  TENANT_THEME_MAP,
  getTenantFromHostname,
  getThemeForTenant 
} from '../models/tenant.model';

/**
 * TenantService - Servicio singleton para manejo de multi-tenancy
 * 
 * Responsabilidades:
 * - Detectar tenant desde dominio/URL
 * - Almacenar tenant actual
 * - Proveer tenant_id para peticiones HTTP
 */
@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private readonly TENANT_KEY = 'tenant_id';
  private readonly DETECTED_TENANT_KEY = 'detected_tenant_id';
  private readonly TEMP_LOGIN_KEY = 'temp_tenant_id_for_login';
  
  private currentTenantId$ = new BehaviorSubject<string | null>(null);

  constructor() {
    this.initializeTenant();
  }

  /**
   * Observable del tenant actual
   */
  get tenantId$(): Observable<string | null> {
    return this.currentTenantId$.asObservable();
  }

  /**
   * Obtener tenant ID actual (síncrono)
   */
  getCurrentTenantId(): string | null {
    return this.currentTenantId$.value;
  }

  /**
   * Inicializar tenant al cargar la aplicación
   */
  private initializeTenant(): void {
    // Prioridad 1: Tenant guardado después de login
    let tenantId = localStorage.getItem(this.TENANT_KEY);
    
    // Prioridad 2: Detectar desde dominio
    if (!tenantId) {
      tenantId = this.detectTenantFromDomain();
    }
    
    if (tenantId) {
      this.currentTenantId$.next(tenantId);
    }
  }

  /**
   * Detectar tenant desde el hostname actual
   */
  detectTenantFromDomain(): string | null {
    const hostname = window.location.hostname.toLowerCase();
    const tenantId = getTenantFromHostname(hostname);
    
    if (tenantId) {
      // Guardar como detectado (temporal hasta login)
      localStorage.setItem(this.DETECTED_TENANT_KEY, tenantId);
    }
    
    return tenantId;
  }

  /**
   * Obtener tenant ID para usar en peticiones HTTP
   * Prioridad: temporal para login > guardado > detectado > environment > null
   */
  getTenantIdForRequest(): string | null {
    // Prioridad 1: Temporal para login (se usa solo durante el proceso de login)
    const tempTenant = localStorage.getItem(this.TEMP_LOGIN_KEY);
    if (tempTenant && tempTenant !== 'default' && tempTenant.trim() !== '') {
      return tempTenant;
    }
    
    // Prioridad 2: Tenant guardado (después de login exitoso)
    const savedTenant = localStorage.getItem(this.TENANT_KEY);
    if (savedTenant && savedTenant !== 'default' && savedTenant.trim() !== '') {
      return savedTenant;
    }
    
    // Prioridad 3: Tenant detectado desde dominio
    const detectedTenant = localStorage.getItem(this.DETECTED_TENANT_KEY);
    if (detectedTenant && detectedTenant !== 'default' && detectedTenant.trim() !== '') {
      return detectedTenant;
    }
    
    // Prioridad 4: Detectar nuevamente desde dominio
    const domainTenant = this.detectTenantFromDomain();
    if (domainTenant && domainTenant !== 'default' && domainTenant.trim() !== '') {
      return domainTenant;
    }
    
    // Prioridad 5: Environment default (pero validar que no sea "default")
    const envTenant = (environment as any).defaultTenantId;
    if (envTenant && envTenant !== 'default' && envTenant.trim() !== '') {
      return envTenant;
    }
    
    return null;
  }

  /**
   * Establecer tenant para el proceso de login
   * Se usa antes de hacer la petición de login
   */
  setTenantForLogin(tenantId: string): void {
    localStorage.setItem(this.TEMP_LOGIN_KEY, tenantId);
  }

  /**
   * Guardar tenant después de login exitoso
   */
  saveTenant(tenantId: string): void {
    localStorage.setItem(this.TENANT_KEY, tenantId);
    localStorage.removeItem(this.TEMP_LOGIN_KEY);
    localStorage.removeItem(this.DETECTED_TENANT_KEY);
    this.currentTenantId$.next(tenantId);
  }

  /**
   * Limpiar tenant al cerrar sesión
   */
  clearTenant(): void {
    localStorage.removeItem(this.TENANT_KEY);
    localStorage.removeItem(this.TEMP_LOGIN_KEY);
    // Mantener detected_tenant_id para el próximo login
    this.currentTenantId$.next(null);
    
    // Re-detectar desde dominio
    const detectedTenant = this.detectTenantFromDomain();
    if (detectedTenant) {
      this.currentTenantId$.next(detectedTenant);
    }
  }

  /**
   * Obtener el theme ID para el tenant actual
   */
  getThemeIdForCurrentTenant(): string {
    const tenantId = this.getCurrentTenantId();
    return tenantId ? getThemeForTenant(tenantId) : 'default';
  }

  /**
   * Verificar si hay un tenant activo
   */
  hasTenant(): boolean {
    return this.getCurrentTenantId() !== null;
  }

  /**
   * Obtener mapeo de dominios a tenants (para debug/admin)
   */
  getDomainTenantMap(): { [key: string]: string } {
    return { ...DOMAIN_TENANT_MAP };
  }

  /**
   * Obtener mapeo de tenants a themes (para debug/admin)
   */
  getTenantThemeMap(): { [key: string]: string } {
    return { ...TENANT_THEME_MAP };
  }
}

