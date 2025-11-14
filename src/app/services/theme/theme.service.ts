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
      // TODO: hacer una llamada al backend
      // const response = await this.http.get<Theme>(`/api/themes/${clientId}`).toPromise();
      // this.setCustomTheme(response);
      
      // temas predefinidos
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
    
    // Aplicar data-theme attribute
    root.setAttribute('data-theme', theme.id);
    
    // Aplicar variables CSS
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
   * Detectar tema basado en el dominio/subdominio (Multitenant)
   */
  private detectThemeFromDomain(): string {
    const hostname = window.location.hostname;
    
    // TODO: detección
	// const subdomain = hostname.split('.')[0];
    // return subdomain === 'www' ? 'default' : subdomain;
    if (hostname.includes('client1')) return 'client1';
    if (hostname.includes('client2')) return 'client2';
    if (hostname.includes('client3')) return 'client3';
    
    return 'default';
  }

  /**
   * Resetear al tema por defecto
   */
  resetToDefault(): void {
    this.setTheme('default');
  }
}

