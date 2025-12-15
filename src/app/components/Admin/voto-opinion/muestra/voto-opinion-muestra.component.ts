import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SurveyService, Respondent } from 'src/app/services/survey/survey.service';

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

  // Data
  totalRespondents = 0;
  respondentsLoaded = 0;
  lastUpdated: Date | null = null;

  demographicSections: DemographicSection[] = [];

  // Respondents (preview)
  respondentsPreview: Respondent[] = [];
  showRespondents = true;
  revealPhones = false;
  previewLimit = 50;

  // Controls
  limitPerPage = 1000;
  maxPagesToScan = 20; // safety

  constructor(private surveyService: SurveyService) {}

  ngOnInit(): void {
    this.loadSample();
  }

  async loadSample(): Promise<void> {
    this.loading = true;
    this.error = null;
    this.demographicSections = [];
    this.totalRespondents = 0;
    this.respondentsLoaded = 0;
    this.respondentsPreview = [];

    try {
      const allRespondents: Respondent[] = [];

      let offset = 0;
      for (let page = 0; page < this.maxPagesToScan; page++) {
        const res = await firstValueFrom(this.surveyService.getRespondents({ limit: this.limitPerPage, offset }));
        const parsed = this.parseRespondentsResponse(res);

        if (typeof parsed.total === 'number') {
          this.totalRespondents = parsed.total;
        }

        if (parsed.respondents.length > 0) {
          allRespondents.push(...parsed.respondents);
          this.respondentsLoaded = allRespondents.length;
        }

        // Guardar preview (primeros N) para mostrar "quiénes son"
        if (this.respondentsPreview.length < this.previewLimit) {
          const remaining = this.previewLimit - this.respondentsPreview.length;
          this.respondentsPreview.push(...parsed.respondents.slice(0, remaining));
        }

        // Si el backend trae demográficos agregados, preferimos eso (evita inferencias)
        if (parsed.demographics && Object.keys(parsed.demographics).length > 0) {
          this.demographicSections = this.buildDemographicsFromAggregates(parsed.demographics, parsed.total ?? allRespondents.length);
          break;
        }

        // Criterio de fin: si no hay más resultados
        if (parsed.respondents.length < this.limitPerPage) break;

        offset += this.limitPerPage;
      }

      // Si no venían agregados, los calculamos desde los respondents cargados
      if (this.demographicSections.length === 0) {
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
    } catch (e: any) {
      console.error('❌ VotoOpinionMuestra - Error cargando respondents:', e);
      this.error = e?.error?.detail || e?.message || 'No se pudo cargar la muestra';
    } finally {
      this.loading = false;
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
    // 1) lugar ideal: demographics (según swagger)
    const d1 = r?.demographics;
    if (d1 && typeof d1 === 'object' && !Array.isArray(d1)) return d1;

    // 2) otras variantes
    const d2 = r?.profile?.demographics;
    if (d2 && typeof d2 === 'object' && !Array.isArray(d2)) return d2;

    const d3 = r?.metadata?.demographics;
    if (d3 && typeof d3 === 'object' && !Array.isArray(d3)) return d3;

    // fallback: sin demográficos
    return {};
  }

  private normalizeValue(v: any): string {
    if (v === null || v === undefined) return 'N/A';
    if (typeof v === 'string') {
      const s = v.trim();
      return s.length ? s : 'N/A';
    }
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (Array.isArray(v)) return v.length ? v.map(x => this.normalizeValue(x)).join(', ') : 'N/A';
    if (typeof v === 'object') {
      // Casos comunes: { value: 'F' } / { label: '18-25' } / { name: 'Bogotá' }
      if (v.label) return this.normalizeValue(v.label);
      if (v.value) return this.normalizeValue(v.value);
      if (v.name) return this.normalizeValue(v.name);
      if (v.text) return this.normalizeValue(v.text);
      if (v.key) return this.normalizeValue(v.key);

      // Si es objeto vacío => N/A
      const keys = Object.keys(v);
      if (keys.length === 0) return 'N/A';

      // Si tiene una sola llave y su valor es primitivo, úsalo
      if (keys.length === 1) {
        const only = (v as any)[keys[0]];
        if (only === null || only === undefined) return 'N/A';
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
        return json && json !== '{}' ? json : 'N/A';
      } catch {
        return 'N/A';
      }
    }
    return 'N/A';
  }

  private prettyLabel(key: string): string {
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
}


