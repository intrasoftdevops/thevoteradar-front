import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SurveyService, Respondent, Survey } from 'src/app/services/survey/survey.service';

interface DemographicBucket {
  label: string;
  count: number;
  percentage: number;
}

interface DemographicSection {
  key: string;
  label: string;
  total: number;
  buckets: DemographicBucket[];
}

@Component({
  selector: 'app-voto-opinion-muestra',
  templateUrl: './voto-opinion-muestra.component.html',
  styleUrls: ['./voto-opinion-muestra.component.scss']
})
export class VotoOpinionMuestraComponent implements OnInit {
  loading = false;
  error: string | null = null;

  // Surveys
  surveys: Survey[] = [];
  selectedSurveyId: string | null = null;
  selectedSurvey: Survey | null = null;
  showAllSurveys = false;
  
  // Survey summaries (when showing all surveys)
  surveySummaries: Array<{
    survey: Survey;
    recipientsCount: number;
    responsesCount: number;
    loading?: boolean;
  }> = [];

  // Data
  totalRespondents = 0;
  respondentsLoaded = 0;
  lastUpdated: Date | null = null;

  demographicSections: DemographicSection[] = [];

  // Respondents (preview)
  respondentsPreview: any[] = [];
  showRespondents = true;
  revealPhones = false;
  previewLimit = 50;

  // Controls
  limitPerPage = 1000;
  maxPagesToScan = 20; // safety

  constructor(private surveyService: SurveyService) {}

  ngOnInit(): void {
    this.loadSurveys();
  }

  async loadSurveys(): Promise<void> {
    try {
      this.surveys = await firstValueFrom(this.surveyService.getSurveys());
      // Si no hay encuesta seleccionada, cargar resumen de todas
      if (!this.selectedSurveyId) {
        await this.loadAllSurveysSummary();
      } else if (this.selectedSurveyId) {
        // Si hay encuesta seleccionada, cargar su muestra
        this.selectedSurvey = this.surveys.find(s => s.id === this.selectedSurveyId) || null;
        this.loadSample();
      }
    } catch (e: any) {
      console.error('Error cargando encuestas:', e);
      // Si falla, intentar cargar el resumen
      if (!this.selectedSurveyId) {
        await this.loadAllSurveysSummary();
      } else if (this.selectedSurveyId) {
        this.loadSample();
      }
    }
  }

  onSurveyChange(surveyId: string | null): void {
    // Convertir string "null" a null real
    if (surveyId === 'null' || surveyId === null || surveyId === undefined || surveyId === '') {
      this.selectedSurveyId = null;
      this.selectedSurvey = null;
      // Cargar resumen de todas las encuestas
      this.loadAllSurveysSummary();
    } else {
      this.selectedSurveyId = surveyId;
      this.selectedSurvey = this.surveys.find(s => s.id === surveyId) || null;
      // Cargar muestra de la encuesta seleccionada
      this.loadSample();
    }
  }

  async loadSample(): Promise<void> {
    this.loading = true;
    this.error = null;
    this.demographicSections = [];
    this.totalRespondents = 0;
    this.respondentsLoaded = 0;
    this.respondentsPreview = [];

    try {
      // Normalizar selectedSurveyId para asegurar que null/undefined/'' se traten como null
      const surveyId = this.selectedSurveyId === 'null' || 
                       this.selectedSurveyId === null || 
                       this.selectedSurveyId === undefined || 
                       this.selectedSurveyId === '' 
                       ? null 
                       : this.selectedSurveyId;

      if (surveyId) {
        // Cargar recipients de la encuesta seleccionada
        console.log('📊 Cargando recipients de encuesta:', surveyId);
        await this.loadSurveyRecipients();
      } else {
        // Cargar directorio central
        console.log('📊 Cargando directorio central (todas las encuestas)');
        await this.loadCentralDirectory();
      }
    } catch (e: any) {
      console.error('❌ VotoOpinionMuestra - Error cargando muestra:', e);
      const errorMessage = e?.error?.detail || e?.error?.message || e?.message || 'No se pudo cargar la muestra';
      this.error = errorMessage;
      // Limpiar datos en caso de error
      this.demographicSections = [];
      this.totalRespondents = 0;
      this.respondentsLoaded = 0;
      this.respondentsPreview = [];
    } finally {
      this.loading = false;
    }
  }

  async loadSurveyRecipients(): Promise<void> {
    if (!this.selectedSurveyId) {
      console.warn('No hay encuesta seleccionada, no se pueden cargar recipients');
      return;
    }

    try {
      const recipients = await firstValueFrom(this.surveyService.getSurveyRecipients(this.selectedSurveyId));
      
      if (!Array.isArray(recipients)) {
        console.warn('La respuesta de recipients no es un array:', recipients);
        this.totalRespondents = 0;
        this.respondentsLoaded = 0;
        this.respondentsPreview = [];
        this.demographicSections = [];
        return;
      }
      
      this.totalRespondents = recipients.length;
      this.respondentsLoaded = recipients.length;
      this.respondentsPreview = recipients.slice(0, this.previewLimit);
      this.lastUpdated = new Date();

      // Extraer demográficos de los recipients
      // Convertir recipients a formato compatible con buildDemographicsFromRespondents
      const allRecipients: any[] = recipients.map(r => ({
        id: r.id || r.recipient_id || '',
        tenant_id: r.tenant_id || '',
        phone_number: r.phone_number || r.phone || '',
        opt_out: r.opt_out || false,
        demographics: r.metadata || {},
        history: r.history || [],
        created_at: r.created_at || new Date().toISOString(),
        updated_at: r.updated_at || new Date().toISOString()
      }));

      this.demographicSections = this.buildDemographicsFromRespondents(allRecipients);
      this.demographicSections = this.demographicSections.sort((a, b) => b.buckets.length - a.buckets.length);
    } catch (error: any) {
      console.error('Error cargando recipients de encuesta:', error);
      // Si hay error, limpiar datos
      this.totalRespondents = 0;
      this.respondentsLoaded = 0;
      this.respondentsPreview = [];
      this.demographicSections = [];
      throw error; // Re-lanzar para que loadSample lo maneje
    }
  }

  async loadCentralDirectory(): Promise<void> {
    const allRespondents: any[] = [];

    try {
      let offset = 0;
      for (let page = 0; page < this.maxPagesToScan; page++) {
        const res = await firstValueFrom(this.surveyService.getRespondents({ limit: this.limitPerPage, offset }));
        const parsed = this.parseRespondentsResponse(res);

        if (typeof parsed.total === 'number') {
          this.totalRespondents = parsed.total;
        }

        if (parsed.respondents && parsed.respondents.length > 0) {
          allRespondents.push(...parsed.respondents);
          this.respondentsLoaded = allRespondents.length;
        }

        // Guardar preview (primeros N) para mostrar "quiénes son"
        if (this.respondentsPreview.length < this.previewLimit && parsed.respondents && parsed.respondents.length > 0) {
          const remaining = this.previewLimit - this.respondentsPreview.length;
          this.respondentsPreview.push(...parsed.respondents.slice(0, remaining));
        }

        // Si el backend trae demográficos agregados, preferimos eso (evita inferencias)
        if (parsed.demographics && Object.keys(parsed.demographics).length > 0) {
          this.demographicSections = this.buildDemographicsFromAggregates(parsed.demographics, parsed.total ?? allRespondents.length);
          break;
        }

        // Criterio de fin: si no hay más resultados
        if (!parsed.respondents || parsed.respondents.length < this.limitPerPage) break;

        offset += this.limitPerPage;
      }

      // Si no venían agregados, los calculamos desde los respondents cargados
      if (this.demographicSections.length === 0 && allRespondents.length > 0) {
        this.demographicSections = this.buildDemographicsFromRespondents(allRespondents);
      }

      // Totales finales
      if (!this.totalRespondents) {
        this.totalRespondents = allRespondents.length;
      }
      this.respondentsLoaded = allRespondents.length;
      this.lastUpdated = new Date();

      // Ordenar secciones por cantidad de buckets (para que sea más útil arriba)
      this.demographicSections = this.demographicSections.sort((a, b) => b.buckets.length - a.buckets.length);
    } catch (error: any) {
      console.error('Error cargando directorio central:', error);
      // Si hay error, al menos mostrar que no hay datos
      this.totalRespondents = 0;
      this.respondentsLoaded = 0;
      this.respondentsPreview = [];
      this.demographicSections = [];
      throw error; // Re-lanzar para que loadSample lo maneje
    }
  }

  private parseRespondentsResponse(res: any): { respondents: Respondent[]; total?: number; demographics?: Record<string, any> } {
    // Flexible: el backend puede responder con array directo o con wrapper
    if (Array.isArray(res)) {
      return { respondents: res, total: res.length };
    }

    const respondents =
      res?.respondents ||
      res?.items ||
      res?.data ||
      res?.results ||
      [];

    const total =
      typeof res?.total === 'number' ? res.total :
      typeof res?.count === 'number' ? res.count :
      typeof res?.total_count === 'number' ? res.total_count :
      undefined;

    const demographics = res?.demographics || res?.demographic_breakdown || res?.breakdown || undefined;

    return { respondents: Array.isArray(respondents) ? respondents : [], total, demographics };
  }

  private buildDemographicsFromAggregates(
    demographics: Record<string, any>,
    total: number
  ): DemographicSection[] {
    const sections: DemographicSection[] = [];

    for (const [key, value] of Object.entries(demographics)) {
      // Esperamos algo tipo { "gender": { "M": 10, "F": 12 } } o arrays
      const bucketsMap: Record<string, number> = {};

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const [k, v] of Object.entries(value)) {
          const num = typeof v === 'number' ? v : Number(v);
          if (!Number.isNaN(num)) bucketsMap[String(k)] = num;
        }
      } else if (Array.isArray(value)) {
        // array de {label,count} (si existiera)
        for (const item of value) {
          const label = (item?.label ?? item?.key ?? item?.value ?? 'N/A').toString();
          const count = Number(item?.count ?? 0);
          if (!Number.isNaN(count)) bucketsMap[label] = (bucketsMap[label] || 0) + count;
        }
      }

      const buckets = Object.entries(bucketsMap)
        .sort(([, a], [, b]) => b - a)
        .map(([label, count]) => ({
          label,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0
        }));

      if (buckets.length > 0) {
        sections.push({
          key,
          label: this.prettyLabel(key),
          total,
          buckets
        });
      }
    }

    return sections;
  }

  private buildDemographicsFromRespondents(respondents: Respondent[]): DemographicSection[] {
    const agg: Record<string, Record<string, number>> = {};

    for (const r of respondents) {
      const demo = this.extractDemographics(r);
      for (const [k, v] of Object.entries(demo)) {
        const key = k;
        const val = this.normalizeValue(v);
        if (!agg[key]) agg[key] = {};
        agg[key][val] = (agg[key][val] || 0) + 1;
      }
    }

    const total = respondents.length || 0;
    const sections: DemographicSection[] = [];

    for (const [key, valuesMap] of Object.entries(agg)) {
      const buckets = Object.entries(valuesMap)
        .sort(([, a], [, b]) => b - a)
        .map(([label, count]) => ({
          label,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0
        }));

      if (buckets.length > 0) {
        sections.push({
          key,
          label: this.prettyLabel(key),
          total,
          buckets
        });
      }
    }

    return sections;
  }

  private extractDemographics(r: any): Record<string, any> {
    // Campos técnicos/metadatos que NO son demográficos y deben ser excluidos
    const excludedFields = [
      'sms_message_id',
      'sms_bulk_id',
      'auto_sent',
      'id',
      'phone_number',
      'phone',
      'email',
      'created_at',
      'updated_at',
      'sent_at',
      'responded_at',
      'status',
      'short_url',
      'short_code',
      'unique_token',
      'tenant_id',
      'survey_id',
      'recipient_id',
      'metadata_hash',
      'phone_hash',
      'device_hash',
      'ip_hash'
    ];

    // 1) lugar ideal: demographics (según swagger)
    const d1 = r?.demographics;
    if (d1 && typeof d1 === 'object' && !Array.isArray(d1)) {
      return this.filterExcludedFields(d1, excludedFields);
    }

    // 2) metadata (para recipients de encuestas) - filtrar campos técnicos
    const d2 = r?.metadata;
    if (d2 && typeof d2 === 'object' && !Array.isArray(d2)) {
      return this.filterExcludedFields(d2, excludedFields);
    }

    // 3) otras variantes
    const d3 = r?.profile?.demographics;
    if (d3 && typeof d3 === 'object' && !Array.isArray(d3)) {
      return this.filterExcludedFields(d3, excludedFields);
    }

    const d4 = r?.metadata?.demographics;
    if (d4 && typeof d4 === 'object' && !Array.isArray(d4)) {
      return this.filterExcludedFields(d4, excludedFields);
    }

    // fallback: sin demográficos
    return {};
  }

  private filterExcludedFields(data: Record<string, any>, excludedFields: string[]): Record<string, any> {
    const filtered: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      // Excluir campos técnicos y también campos que parezcan IDs técnicos
      const shouldExclude = 
        excludedFields.includes(lowerKey) || 
        lowerKey.includes('_id') || 
        lowerKey.includes('id_') ||
        lowerKey.endsWith('_hash') ||
        lowerKey.startsWith('sms_') ||
        lowerKey.includes('sms') ||
        lowerKey.includes('token') ||
        lowerKey.includes('url') ||
        lowerKey.includes('code') ||
        lowerKey.includes('bulk') ||
        lowerKey.includes('message_id') ||
        lowerKey.includes('auto_sent') ||
        lowerKey === 'auto';
      
      if (!shouldExclude) {
        filtered[key] = value;
      }
    }
    return filtered;
  }

  private normalizeValue(v: any): string {
    if (v === null || v === undefined) return 'No especificado';
    
    // Traducir valores booleanos comunes
    if (typeof v === 'boolean') {
      return v ? 'Sí' : 'No';
    }
    
    if (typeof v === 'string') {
      const s = v.trim();
      if (!s.length) return 'No especificado';
      
      // Traducir valores comunes
      const valueMap: Record<string, string> = {
        'true': 'Sí',
        'false': 'No',
        'M': 'Masculino',
        'F': 'Femenino',
        'Male': 'Masculino',
        'Female': 'Femenino',
        'Hombre': 'Masculino',
        'Mujer': 'Femenino'
      };
      
      const lowerValue = s.toLowerCase();
      if (valueMap[lowerValue]) {
        return valueMap[lowerValue];
      }
      
      return s;
    }
    
    if (typeof v === 'number') {
      return String(v);
    }
    
    if (Array.isArray(v)) {
      return v.length ? v.map(x => this.normalizeValue(x)).join(', ') : 'No especificado';
    }
    
    if (typeof v === 'object') {
      // Casos comunes: { value: 'F' } / { label: '18-25' } / { name: 'Bogotá' }
      if (v.label) return this.normalizeValue(v.label);
      if (v.value) return this.normalizeValue(v.value);
      if (v.name) return this.normalizeValue(v.name);
      if (v.text) return this.normalizeValue(v.text);
      if (v.key) return this.normalizeValue(v.key);

      // Si es objeto vacío => No especificado
      const keys = Object.keys(v);
      if (keys.length === 0) return 'No especificado';

      // Si tiene una sola llave y su valor es primitivo, úsalo
      if (keys.length === 1) {
        const only = (v as any)[keys[0]];
        if (only === null || only === undefined) return 'No especificado';
        if (typeof only === 'string' || typeof only === 'number' || typeof only === 'boolean') return this.normalizeValue(only);
      }

      // Si tiene propiedades primitivas, compactarlas para que sea legible
      const primitivePairs: string[] = [];
      for (const k of keys) {
        const val = (v as any)[k];
        if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
          primitivePairs.push(`${k}: ${this.normalizeValue(val)}`);
        }
      }
      if (primitivePairs.length > 0) return primitivePairs.join(' · ');

      // Fallback: representar el objeto (limitado) para no romper la UX
      try {
        const json = JSON.stringify(v);
        return json && json !== '{}' ? json : 'No especificado';
      } catch {
        return 'No especificado';
      }
    }
    return 'No especificado';
  }

  private prettyLabel(key: string): string {
    // Mapeo de claves comunes a español
    const labelMap: Record<string, string> = {
      'gender': 'Género',
      'sexo': 'Género',
      'age': 'Edad',
      'edad': 'Edad',
      'location': 'Ubicación',
      'ciudad': 'Ciudad',
      'city': 'Ciudad',
      'departamento': 'Departamento',
      'education': 'Educación',
      'educacion': 'Educación',
      'nivel_educativo': 'Nivel Educativo',
      'estrato': 'Estrato',
      'sms_message_id': 'ID Mensaje SMS',
      'sms_bulk_id': 'ID Lote SMS',
      'auto_sent': 'Envío Automático',
      'phone_number': 'Teléfono',
      'name': 'Nombre',
      'email': 'Correo Electrónico'
    };

    // Si existe en el mapa, usar la traducción
    const lowerKey = key.toLowerCase();
    if (labelMap[lowerKey]) {
      return labelMap[lowerKey];
    }

    // Si no, formatear la clave
    return key
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  formatDate(d: Date | null): string {
    if (!d) return '—';
    return d.toLocaleString('es-ES');
  }

  formatIso(dateIso?: string): string {
    if (!dateIso) return '—';
    const d = new Date(dateIso);
    if (Number.isNaN(d.getTime())) return dateIso;
    return d.toLocaleString('es-ES');
  }

  maskPhone(phone?: string): string {
    if (!phone) return '—';
    if (this.revealPhones) return phone;
    const s = phone.toString();
    // Mantener prefijo + últimos 2-4 dígitos
    const last = s.slice(-4);
    const prefix = s.startsWith('+') ? '+' : '';
    return `${prefix}****${last}`;
  }

  getDisplayTitle(): string {
    if (this.selectedSurvey) {
      return `Muestra de: ${this.selectedSurvey.title}`;
    }
    return 'Resumen de todas las encuestas';
  }

  async loadAllSurveysSummary(): Promise<void> {
    this.loading = true;
    this.error = null;
    this.demographicSections = [];
    this.totalRespondents = 0;
    this.respondentsLoaded = 0;
    this.respondentsPreview = [];
    this.surveySummaries = [];

    try {
      // Cargar estadísticas para cada encuesta
      this.surveySummaries = this.surveys.map(survey => ({
        survey,
        recipientsCount: survey.recipients_count || 0,
        responsesCount: 0,
        loading: true
      }));

      // Cargar analytics y recipients de cada encuesta en paralelo
      const summaryPromises = this.surveySummaries.map(async (summary, index) => {
        try {
          // Cargar analytics para obtener respuestas
          const analytics = await firstValueFrom(
            this.surveyService.getSurveyAnalytics(summary.survey.id)
          );
          this.surveySummaries[index].responsesCount = analytics.total_respondents || 0;

          // Cargar recipients para obtener el número real de destinatarios
          try {
            const recipients = await firstValueFrom(
              this.surveyService.getSurveyRecipients(summary.survey.id)
            );
            this.surveySummaries[index].recipientsCount = Array.isArray(recipients) ? recipients.length : 0;
          } catch (recipientsError) {
            console.warn(`No se pudieron cargar recipients de encuesta ${summary.survey.id}:`, recipientsError);
            // Mantener el valor por defecto o intentar usar recipients_count si está disponible
            if (summary.survey.recipients_count) {
              this.surveySummaries[index].recipientsCount = summary.survey.recipients_count;
            }
          }

          this.surveySummaries[index].loading = false;
        } catch (error) {
          console.error(`Error cargando analytics de encuesta ${summary.survey.id}:`, error);
          this.surveySummaries[index].loading = false;
        }
      });

      await Promise.all(summaryPromises);

      // Calcular totales
      this.totalRespondents = this.surveySummaries.reduce(
        (sum, s) => sum + s.recipientsCount, 0
      );
      this.lastUpdated = new Date();
    } catch (e: any) {
      console.error('Error cargando resumen de encuestas:', e);
      this.error = e?.error?.detail || e?.error?.message || e?.message || 'No se pudo cargar el resumen';
    } finally {
      this.loading = false;
    }
  }

  viewSurveySample(surveyId: string): void {
    this.selectedSurveyId = surveyId;
    this.selectedSurvey = this.surveys.find(s => s.id === surveyId) || null;
    this.loadSample();
  }
}


