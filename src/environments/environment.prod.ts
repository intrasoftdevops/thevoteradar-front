// Variables de entorno cargadas en runtime desde Cloud Run (window.__ENV__)
// o valores por defecto para desarrollo local
declare const window: any;

const runtimeEnv = (window && window.__ENV__) || {};

export const environment = {
  production: runtimeEnv.production !== undefined ? runtimeEnv.production : true,
  development: runtimeEnv.development !== undefined ? runtimeEnv.development : false,
  apiURL: runtimeEnv.apiURL || '',
  backofficeApiURL: runtimeEnv.backofficeApiURL || '',
  surveyApiURL: runtimeEnv.surveyApiURL || '',
  defaultTenantId: runtimeEnv.defaultTenantId || '473173',
  key1: runtimeEnv.key1 || '',
  key2: runtimeEnv.key2 || '',
  key3: runtimeEnv.key3 || '',
  key4: runtimeEnv.key4 || '',
  powerBiURL: runtimeEnv.powerBiURL || '',
};

