import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
import { User, UserRole, getRoleInfo, getHomeRouteByRole } from '../models/user.model';
import { TenantService } from './tenant.service';

/**
 * AuthService - Servicio singleton para autenticación
 * 
 * Responsabilidades:
 * - Almacenar/recuperar credenciales encriptadas
 * - Manejar estado de autenticación
 * - Proveer información del usuario actual
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated$ = new BehaviorSubject<boolean>(false);
  private currentUser$ = new BehaviorSubject<Partial<User> | null>(null);

  constructor(
    private router: Router,
    private tenantService: TenantService
  ) {
    this.checkInitialAuth();
  }

  /**
   * Observable del estado de autenticación
   */
  get authenticated$(): Observable<boolean> {
    return this.isAuthenticated$.asObservable();
  }

  /**
   * Observable del usuario actual
   */
  get user$(): Observable<Partial<User> | null> {
    return this.currentUser$.asObservable();
  }

  /**
   * Verificar autenticación al iniciar
   */
  private checkInitialAuth(): void {
    const token = this.getToken();
    const rol = this.getRol();
    
    if (token && rol) {
      this.isAuthenticated$.next(true);
      this.currentUser$.next({
        id: parseInt(this.getId() || '0', 10),
        rol: parseInt(rol, 10) as UserRole,
      });
    }
  }

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  setToken(token: string): void {
    const encrypted = CryptoJS.AES.encrypt(token, environment.key1).toString();
    localStorage.setItem('keyA', encrypted);
  }

  getToken(): string | null {
    try {
      const encrypted = localStorage.getItem('keyA');
      if (!encrypted) return null;
      return CryptoJS.AES.decrypt(encrypted, environment.key1).toString(CryptoJS.enc.Utf8) || null;
    } catch {
      return null;
    }
  }

  // ============================================
  // ROL MANAGEMENT
  // ============================================

  setRol(rol: number | string): void {
    const rolString = rol.toString();
    const encrypted = CryptoJS.AES.encrypt(rolString, environment.key2).toString();
    localStorage.setItem('keyB', encrypted);
  }

  getRol(): string | null {
    try {
      const encrypted = localStorage.getItem('keyB');
      if (!encrypted) return null;
      const decrypted = CryptoJS.AES.decrypt(encrypted, environment.key2).toString(CryptoJS.enc.Utf8);
      return decrypted && decrypted !== '0' ? decrypted : null;
    } catch {
      return null;
    }
  }

  getRolNumber(): number | null {
    const rol = this.getRol();
    return rol ? parseInt(rol, 10) : null;
  }

  // ============================================
  // USER ID MANAGEMENT
  // ============================================

  setId(id: number | string): void {
    const encrypted = CryptoJS.AES.encrypt(id.toString(), environment.key3).toString();
    localStorage.setItem('keyC', encrypted);
  }

  getId(): string | null {
    try {
      const encrypted = localStorage.getItem('keyC');
      if (!encrypted) return null;
      return CryptoJS.AES.decrypt(encrypted, environment.key3).toString(CryptoJS.enc.Utf8) || null;
    } catch {
      return null;
    }
  }

  // ============================================
  // EXTERNAL ID ENCRYPTION (para URLs, etc)
  // ============================================

  encryptExternalId(id: number | string): string {
    return CryptoJS.AES.encrypt(id.toString(), environment.key4).toString();
  }

  decryptExternalId(encryptedId: string): string | null {
    try {
      return CryptoJS.AES.decrypt(encryptedId, environment.key4).toString(CryptoJS.enc.Utf8) || null;
    } catch {
      return null;
    }
  }

  // ============================================
  // BACKOFFICE AUTH
  // ============================================

  setBackofficeToken(token: string): void {
    const encrypted = CryptoJS.AES.encrypt(token, environment.key1).toString();
    localStorage.setItem('backoffice_token', encrypted);
    // También guardar como token principal
    this.setToken(token);
  }

  getBackofficeToken(): string | null {
    try {
      const encrypted = localStorage.getItem('backoffice_token');
      if (!encrypted) return this.getToken();
      return CryptoJS.AES.decrypt(encrypted, environment.key1).toString(CryptoJS.enc.Utf8) || null;
    } catch {
      return null;
    }
  }

  setBackofficeUser(userInfo: any): void {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(userInfo), environment.key2).toString();
    localStorage.setItem('backoffice_user', encrypted);
  }

  getBackofficeUser(): any | null {
    try {
      const encrypted = localStorage.getItem('backoffice_user');
      if (!encrypted) return null;
      const decrypted = CryptoJS.AES.decrypt(encrypted, environment.key2).toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  }

  // ============================================
  // LOGIN/LOGOUT
  // ============================================

  /**
   * Guardar datos de sesión después de login exitoso
   */
  saveSession(data: { token: string; id: number | string; rol: number | string; tenantId?: string }): void {
    this.setToken(data.token);
    this.setId(data.id);
    this.setRol(data.rol);
    
    if (data.tenantId) {
      this.tenantService.saveTenant(data.tenantId);
    }
    
    this.isAuthenticated$.next(true);
    this.currentUser$.next({
      id: typeof data.id === 'string' ? parseInt(data.id, 10) : data.id,
      rol: typeof data.rol === 'string' ? parseInt(data.rol, 10) as UserRole : data.rol as UserRole,
    });
  }

  /**
   * Cerrar sesión y limpiar datos
   */
  logout(): void {
    localStorage.removeItem('keyA');
    localStorage.removeItem('keyB');
    localStorage.removeItem('keyC');
    localStorage.removeItem('backoffice_token');
    localStorage.removeItem('backoffice_user');
    
    this.tenantService.clearTenant();
    this.isAuthenticated$.next(false);
    this.currentUser$.next(null);
    
    this.router.navigate(['']);
  }

  /**
   * Limpiar todo el localStorage
   */
  clearAll(): void {
    localStorage.clear();
    this.isAuthenticated$.next(false);
    this.currentUser$.next(null);
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Verificar si está autenticado (síncrono)
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const rol = this.getRol();
    return !!token && !!rol;
  }

  /**
   * Verificar si es autenticación de backoffice
   */
  isBackofficeAuthenticated(): boolean {
    const token = this.getBackofficeToken();
    return !!token;
  }

  /**
   * Obtener información del rol actual
   */
  getCurrentRoleInfo() {
    const rol = this.getRolNumber();
    return rol ? getRoleInfo(rol) : null;
  }

  /**
   * Obtener ruta home según el rol
   */
  getHomeRoute(): string {
    const rol = this.getRolNumber();
    return rol ? getHomeRouteByRole(rol) : '/';
  }

  /**
   * Verificar si el usuario puede acceder a ciertos roles
   */
  canAccessRoles(allowedRoles: number[]): boolean {
    const rol = this.getRolNumber();
    return rol ? allowedRoles.includes(rol) : false;
  }

  /**
   * Navegar al home del rol actual
   */
  navigateToHome(): void {
    const homeRoute = this.getHomeRoute();
    this.router.navigate([homeRoute]);
  }
}

