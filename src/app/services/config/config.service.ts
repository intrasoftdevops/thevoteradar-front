import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface AppConfig {
  production: boolean;
  development: boolean;
  apiURL: string;
  backofficeApiURL: string;
  surveyApiURL: string;
  defaultTenantId: string;
  key1: string;
  key2: string;
  key3: string;
  key4: string;
  powerBiURL: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig | null = null;

  constructor() {}

  async loadConfig(): Promise<AppConfig> {
    if (this.config) {
      return this.config;
    }

    if ((window as any).APP_CONFIG) {
      this.config = (window as any).APP_CONFIG as AppConfig;
      return this.config;
    }

    try {
      const response = await fetch('/assets/config.js');
      if (response.ok) {
        const configText = await response.text();
        const configMatch = configText.match(/window\.APP_CONFIG\s*=\s*({[\s\S]*?});/);
        if (configMatch) {
          const config = eval(`(${configMatch[1]})`) as AppConfig;
          this.config = config;
          return this.config;
        }
      }
    } catch (error) {
      console.warn('No se pudo cargar config.js, usando environment por defecto', error);
    }

    const defaultConfig: AppConfig = {
      production: environment.production,
      development: environment.development,
      apiURL: environment.apiURL,
      backofficeApiURL: (environment as any).backofficeApiURL || '',
      surveyApiURL: (environment as any).surveyApiURL || '',
      defaultTenantId: (environment as any).defaultTenantId || '475711',
      key1: environment.key1,
      key2: environment.key2,
      key3: environment.key3,
      key4: environment.key4,
      powerBiURL: environment.powerBiURL
    };
    this.config = defaultConfig;
    return this.config;
  }

  getConfig(): AppConfig {
    if (!this.config) {
      throw new Error('Config not loaded. Call loadConfig() first.');
    }
    return this.config;
  }
}

