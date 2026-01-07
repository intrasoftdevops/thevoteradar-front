import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Theme, THEMES } from '../../core/models/theme.model';
import { TenantConfigService } from '../tenant-config/tenant-config.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme$ = new BehaviorSubject<Theme>(THEMES['default']);
  
  constructor(private tenantConfigService: TenantConfigService) {
    this.loadSavedTheme();
  }

  getCurrentTheme(): Observable<Theme> {
    return this.currentTheme$.asObservable();
  }

  getCurrentThemeValue(): Theme {
    return this.currentTheme$.value;
  }

  setTheme(themeId: string): void {
    const theme = THEMES[themeId] || THEMES['default'];
    
    this.applyThemeToDOM(theme);
    localStorage.setItem('app-theme', themeId);
    this.currentTheme$.next(theme);
  }

  setCustomTheme(theme: Theme): void {
    this.applyThemeToDOM(theme);
    this.currentTheme$.next(theme);
  }

  getAvailableThemes(): Theme[] {
    return Object.values(THEMES);
  }

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
    
    if (theme.colors.success) {
      root.style.setProperty('--color-success', theme.colors.success);
    }
    if (theme.colors.warning) {
      root.style.setProperty('--color-warning', theme.colors.warning);
    }
    if (theme.colors.error) {
      root.style.setProperty('--color-error', theme.colors.error);
    }
  }

  private loadSavedTheme(): void {}

  private getThemeIdFromTenantId(tenantId: string): string | null {
    const tenantThemeMap: { [key: string]: string } = {
      '475711': 'daniel-quintero',
      '1062885': 'juan-duque',
      '473173': 'potus-44',
    };
    
    return tenantThemeMap[tenantId] || null;
  }

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

  getTenantIdFromDomain(): string | null {
    const hostname = window.location.hostname.toLowerCase();
    const domainTenantMap: { [key: string]: string } = {
		// ===== DANIEL QUINTERO (475711) =====
		'daniel-quintero': '475711',
		'daniel-quintero.localhost': '475711',
		// Dominios de producción
		'daniel-quintero.com': '475711',
		
		// ===== JUAN DUQUE (1062885) =====
		'juan-duque': '1062885',
		'juan-duque.localhost': '1062885',
		// Dominios de producción
		'juan-duque.com': '1062885',
		
		// ===== POTUS 44 (473173) =====
		'potus-44': '473173',
		'potus-44.localhost': '473173',
		// Dominios de producción
		'potus-44.com': '473173',
    };
    
    if (domainTenantMap[hostname]) {
      return domainTenantMap[hostname];
    }
    
    const subdomainMatch = hostname.match(/^([^.]+)\./);
    if (subdomainMatch) {
      const subdomain = subdomainMatch[1];
      if (domainTenantMap[subdomain]) {
        return domainTenantMap[subdomain];
      }
    }
    
    for (const [key, tenantId] of Object.entries(domainTenantMap)) {
      if (hostname.includes(key)) {
        return tenantId;
      }
    }
    
    return null;
  }

  detectAndApplyThemeFromDomain(): string | null {
    const savedTenantId = localStorage.getItem('tenant_id');
    if (savedTenantId) {
      this.loadThemeFromTenantId(savedTenantId);
      return savedTenantId;
    }
    
    const tenantId = this.getTenantIdFromDomain();
    if (tenantId) {
      localStorage.setItem('detected_tenant_id', tenantId);
      this.loadThemeFromTenantId(tenantId);
      return tenantId;
    }
    
    this.setTheme('default');
    return null;
  }

  async loadThemeFromTenantConfig(tenantId: string): Promise<void> {
    try {
      const config = await firstValueFrom(this.tenantConfigService.getTenantConfigPublic(tenantId));
      
      if (config && config.branding) {
        const branding = config.branding;
        const defaultTheme = THEMES['default'];
        
        const isValidColor = (color: string | null | undefined): boolean => {
          return !!(color && color.trim() !== '' && color.trim() !== 'null' && color.trim() !== 'undefined');
        };
        
        const customTheme: Theme = {
          id: `tenant-${tenantId}`,
          name: branding.candidate_name || branding.contact_name || branding.title || 'Tenant Theme',
          colors: {
            primary: isValidColor(branding.primary_color) 
              ? (branding.primary_color || '').trim()
              : defaultTheme.colors.primary,
            secondary: isValidColor(branding.secondary_color) 
              ? (branding.secondary_color || '').trim()
              : defaultTheme.colors.secondary,
            accent: isValidColor(branding.accent_color) 
              ? (branding.accent_color || '').trim()
              : defaultTheme.colors.accent,
            background: isValidColor(branding.background_color) 
              ? (branding.background_color || '').trim()
              : defaultTheme.colors.background,
            surface: isValidColor(branding.surface_color) 
              ? (branding.surface_color || '').trim()
              : defaultTheme.colors.surface,
            textPrimary: isValidColor(branding.text_primary_color) 
              ? (branding.text_primary_color || '').trim()
              : defaultTheme.colors.textPrimary,
            textSecondary: isValidColor(branding.text_secondary_color) 
              ? (branding.text_secondary_color || '').trim()
              : defaultTheme.colors.textSecondary,
            success: isValidColor(branding.success_color) 
              ? (branding.success_color || '').trim()
              : defaultTheme.colors.success,
            warning: isValidColor(branding.warning_color) 
              ? (branding.warning_color || '').trim()
              : defaultTheme.colors.warning,
            error: isValidColor(branding.error_color) 
              ? (branding.error_color || '').trim()
              : defaultTheme.colors.error,
          },
          branding: {
            logo: (branding.logo_url && branding.logo_url.trim() !== '') 
              ? branding.logo_url.trim() 
              : defaultTheme.branding.logo,
            logoSize: (branding.logo_size as 'small' | 'medium' | 'large') || defaultTheme.branding.logoSize,
            title: branding.title || branding.candidate_name || branding.contact_name || defaultTheme.branding.title,
            description: branding.description || branding.welcome_message || defaultTheme.branding.description,
          },
        };
        
        this.setCustomTheme(customTheme);
      } else {
        this.loadThemeFromTenantId(tenantId);
      }
    } catch (error) {
      console.error('Error al cargar tema desde configuración del tenant:', error);
      this.loadThemeFromTenantId(tenantId);
    }
  }

  async getTenantIdFromSubdomain(): Promise<string | null> {
    const hostname = window.location.hostname.toLowerCase();
    
    try {
      const subdomainMatch = hostname.match(/^([^.]+)\./);
      if (subdomainMatch) {
        const subdomain = subdomainMatch[1];
        // Aquí podríamos hacer una búsqueda en la lista de tenants
        // Por ahora usamos el mapeo existente como fallback
      }
    } catch (error) {
      console.error('Error al obtener tenant desde subdominio:', error);
    }
    
    return this.getTenantIdFromDomain();
  }

  resetToDefault(): void {
    this.setTheme('default');
  }
}

