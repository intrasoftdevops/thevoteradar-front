import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Theme, THEMES } from '../../models/theme.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme$ = new BehaviorSubject<Theme>(THEMES['default']);
  
  constructor() {
    this.loadSavedTheme();
  }

  getCurrentTheme(): Observable<Theme> {
    return this.currentTheme$.asObservable();
  }

  getCurrentThemeValue(): Theme {
    return this.currentTheme$.value;
  }

  /**
   * Cambiar el tema del sistema
   * @param themeId - ID del tema a aplicar
   */
  setTheme(themeId: string): void {
    const theme = THEMES[themeId] || THEMES['default'];
    
    this.applyThemeToDOM(theme);
    localStorage.setItem('app-theme', themeId);
    this.currentTheme$.next(theme);
  }

  /**
   * Cargar tema personalizado desde API o configuración
   * @param theme - Objeto de tema personalizado
   */
  setCustomTheme(theme: Theme): void {
    this.applyThemeToDOM(theme);
    this.currentTheme$.next(theme);
  }

  /**
   * Obtener tema desde el backend (ejemplo)
   * @param clientId - ID del cliente
   */
  async loadThemeFromAPI(clientId: string): Promise<void> {
    try {
      
      
      
      
      
      this.setTheme(`client${clientId}`);
    } catch (error) {
      console.error('Error al cargar tema:', error);
      this.setTheme('default');
    }
  }

  /**
   * Obtener todos los temas disponibles
   */
  getAvailableThemes(): Theme[] {
    return Object.values(THEMES);
  }

  /**
   * Aplicar el tema al DOM
   */
  private applyThemeToDOM(theme: Theme): void {
    const root = document.documentElement;
    
    
    root.setAttribute('data-theme', theme.id);
    
    
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-text-primary', theme.colors.textPrimary);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
  }

  /**
   * Cargar tema guardado del localStorage
   */
  private loadSavedTheme(): void {
    const savedThemeId = localStorage.getItem('app-theme');
    if (savedThemeId && THEMES[savedThemeId]) {
      this.setTheme(savedThemeId);
    } else {
      const detectedTheme = this.detectThemeFromDomain();
      this.setTheme(detectedTheme);
    }
  }

  /**
   * Detectar tema basado en el dominio/subdominio o tenant_id (Multitenant)
   */
  private detectThemeFromDomain(): string {
    // Primero intentar obtener el tema desde tenant_id (prioridad)
    const tenantId = localStorage.getItem('tenant_id');
    if (tenantId) {
      const themeId = this.getThemeIdFromTenantId(tenantId);
      if (themeId) {
        return themeId;
      }
    }
    
    // Si no hay tenant_id, intentar detectar desde el dominio
    const hostname = window.location.hostname;
    if (hostname.includes('client1')) return 'client1';
    if (hostname.includes('client2')) return 'client2';
    if (hostname.includes('client3')) return 'client3';
    
    return 'default';
  }

  /**
   * Mapear tenant_id a theme_id
   * Este mapeo debe coincidir con la configuración del backend
   */
  private getThemeIdFromTenantId(tenantId: string): string | null {
    const tenantThemeMap: { [key: string]: string } = {
      '473173': 'client1', // Partido Azul (colores azul/amarillo)
      '473174': 'client2', // Partido Verde (colores verdes)
      '473175': 'client3', // Partido Rojo (colores rojos)
    };
    
    return tenantThemeMap[tenantId] || null;
  }

  /**
   * Cargar tema basado en tenant_id
   * Se llama después del login cuando se guarda el tenant_id
   */
  loadThemeFromTenantId(tenantId?: string): void {
    const id = tenantId || localStorage.getItem('tenant_id');
    if (id) {
      const themeId = this.getThemeIdFromTenantId(id);
      if (themeId) {
        this.setTheme(themeId);
      } else {
        // Si no hay mapeo, usar el tema por defecto
        this.setTheme('default');
      }
    } else {
      this.setTheme('default');
    }
  }

  /**
   * Mapear dominio/subdominio a tenant_id
   */
  getTenantIdFromDomain(): string | null {
    const hostname = window.location.hostname.toLowerCase();
    
    const domainTenantMap: { [key: string]: string } = {
      // Subdominios
      'client1': '473173',
      'client1.localhost': '473173',
      'partido-azul': '473173',
      'reset-politica': '473173',
      
      'client2': '473174',
      'client2.localhost': '473174',
      'partido-verde': '473174',
      'ecoverde': '473174',
      
      'client3': '473175',
      'client3.localhost': '473175',
      'partido-rojo': '473175',
      'redpower': '473175',
      
      // Dominios completos (opcional)
      'partido-azul.com': '473173',
      'reset-politica.com': '473173',
      'partido-verde.com': '473174',
      'partido-rojo.com': '473175',
    };
    
    // Buscar coincidencia exacta primero
    if (domainTenantMap[hostname]) {
      return domainTenantMap[hostname];
    }
    
    // Buscar por subdominio (ej: client1.voteradar.com)
    const subdomainMatch = hostname.match(/^([^.]+)\./);
    if (subdomainMatch) {
      const subdomain = subdomainMatch[1];
      if (domainTenantMap[subdomain]) {
        return domainTenantMap[subdomain];
      }
    }
    
    // Buscar por palabra clave en el hostname
    for (const [key, tenantId] of Object.entries(domainTenantMap)) {
      if (hostname.includes(key)) {
        return tenantId;
      }
    }
    
    return null;
  }

  /**
   * Detectar y aplicar tema desde el dominio al cargar la página
   * Retorna el tenant_id detectado para usarlo en el login
   */
  detectAndApplyThemeFromDomain(): string | null {
    // Primero verificar si ya hay un tenant_id guardado (después de login)
    const savedTenantId = localStorage.getItem('tenant_id');
    if (savedTenantId) {
      // Si ya hay un tenant_id, usar ese y aplicar su tema
      this.loadThemeFromTenantId(savedTenantId);
      return savedTenantId;
    }
    
    // Si no hay tenant_id guardado, detectar desde el dominio
    const tenantId = this.getTenantIdFromDomain();
    
    if (tenantId) {
      // Guardar el tenant_id detectado temporalmente
      localStorage.setItem('detected_tenant_id', tenantId);
      
      // Aplicar el tema correspondiente
      this.loadThemeFromTenantId(tenantId);
      
      return tenantId;
    }
    
    // Si no se detecta ningún dominio, usar el tema por defecto
    this.setTheme('default');
    return null;
  }

  /**
   * Resetear al tema por defecto
   */
  resetToDefault(): void {
    this.setTheme('default');
  }
}

