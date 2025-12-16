/**
 * Modelo de Theme para el sistema de temas multi-tenant
 * Cada tenant puede tener su propio tema con colores y branding
 */

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  success?: string;
  warning?: string;
  error?: string;
}

export interface ThemeBranding {
  logo: string;
  logoSize: 'small' | 'medium' | 'large';
  title: string;
  description: string;
  favicon?: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  branding: ThemeBranding;
}

/**
 * Temas disponibles en el sistema
 * Cada tema corresponde a un cliente/tenant
 */
export const THEMES: { [key: string]: Theme } = {
  default: {
    id: 'default',
    name: 'VoteRadar (Morado)',
    colors: {
      primary: '#64248b',
      secondary: '#cecece',
      accent: '#4a1a6b',
      background: '#f9fafb',
      surface: '#ffffff',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    branding: {
      logo: 'assets/logo.png',
      logoSize: 'small',
      title: 'VoteRadar',
      description: 'Sistema de gestión electoral en tiempo real',
    },
  },
  'daniel-quintero': {
    id: 'daniel-quintero',
    name: 'Daniel Quintero',
    colors: {
      primary: '#0032fd',
      secondary: '#ffef03',
      accent: '#1336bf',
      background: '#f9fafb',
      surface: '#ffffff',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    branding: {
      logo: 'assets/clients/client1/logo.jpg',
      logoSize: 'small',
      title: 'Reset a la política',
      description: 'Ingresa a tu cuenta de la plataforma electoral',
    },
  },
  'juan-duque': {
    id: 'juan-duque',
    name: 'Juan Duque',
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      accent: '#059669',
      background: '#f0fdf4',
      surface: '#ffffff',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    branding: {
      logo: 'assets/logo.png',
      logoSize: 'medium',
      title: 'EcoVerde',
      description: 'Soluciones sostenibles para un futuro mejor',
    },
  },
  'potus-44': {
    id: 'potus-44',
    name: 'Potus 44',
    colors: {
      primary: '#ef4444',
      secondary: '#fca5a5',
      accent: '#dc2626',
      background: '#fef2f2',
      surface: '#ffffff',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    branding: {
      logo: 'assets/logo.png',
      logoSize: 'small',
      title: 'RedPower',
      description: 'Energía y pasión en cada proyecto',
    },
  },
};

/**
 * Obtiene un tema por su ID
 */
export function getThemeById(themeId: string): Theme {
  return THEMES[themeId] || THEMES['default'];
}

/**
 * Aplica un tema al DOM
 */
export function applyThemeToDOM(theme: Theme): void {
  const root = document.documentElement;
  
  // Establecer atributo data-theme
  root.setAttribute('data-theme', theme.id);
  
  // Aplicar variables CSS
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

/**
 * Lista de todos los temas disponibles
 */
export function getAvailableThemes(): Theme[] {
  return Object.values(THEMES);
}

