/**
 * Modelo para definir temas de clientes (Multitenant)
 */
export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
  };
  branding?: {
    logo: string;
    logoSize?: 'small' | 'medium' | 'large';
    title: string;
    description: string;
  };
}

/**
 * Temas predefinidos del sistema
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
    },
    branding: {
      logo: '../../../assets/logo.png',
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
    },
    branding: {
      logo: '../../../assets/logo.png',
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
    },
    branding: {
      logo: '../../../assets/logo.png',
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
    },
    branding: {
      logo: '../../../assets/logo.png',
      logoSize: 'small',
      title: 'RedPower',
      description: 'Energía y pasión en cada proyecto',
    },
  },
};

