import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import 'bootstrap';

if (environment.production) {
  enableProdMode();
}

(async () => {
  try {
    const response = await fetch('/assets/config.js');
    if (response.ok) {
      const configText = await response.text();
      const configMatch = configText.match(/window\.APP_CONFIG\s*=\s*({[\s\S]*?});/);
      if (configMatch) {
        const config = eval(`(${configMatch[1]})`);
        (window as any).APP_CONFIG = config;
      }
    }
  } catch (error) {
    console.warn('No se pudo cargar config.js, usando environment por defecto', error);
  }

  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
})();
