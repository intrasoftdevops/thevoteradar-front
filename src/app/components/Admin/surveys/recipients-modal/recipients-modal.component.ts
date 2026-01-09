import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SurveyService, RecipientImportItem, Respondent } from '../../../../services/survey/survey.service';

@Component({
  selector: 'app-recipients-modal',
  templateUrl: './recipients-modal.component.html',
  styleUrls: ['./recipients-modal.component.scss']
})
export class RecipientsModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() surveyId: string | null = null;
  @Input() surveyTitle: string | null = null;
  @Output() onClose = new EventEmitter<void>();

  rawText = '';
  isUploading = false;
  message: string | null = null;
  parsedRows: RecipientImportItem[] = [];
  stats = { total: 0, phones: 0, emails: 0 };

  // Tabs
  activeTab: 'manual' | 'segment' = 'manual';

  // Segmentación (respondents)
  respondentsLoading = false;
  respondentsError: string | null = null;
  respondents: Respondent[] = [];
  respondentsLoaded = 0;
  limit = 500;
  offset = 0;
  hasMore = false;

  // Demográficos dinámicos
  demographicKeys: string[] = [];
  demographicValues: string[] = [];
  selectedKey = '';
  selectedValue = '';

  // Selección
  selectedPhones = new Set<string>(); // phone_number
  revealPhones = false;

  constructor(private surveyService: SurveyService) { }

  ngOnInit(): void {
    this.loadCachedData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue && this.surveyId) {
      this.loadCachedData();
      this.message = null;
      // reset segment state
      this.activeTab = 'manual';
      this.respondentsError = null;
      this.respondentsLoading = false;
      this.respondents = [];
      this.respondentsLoaded = 0;
      this.offset = 0;
      this.hasMore = false;
      this.demographicKeys = [];
      this.demographicValues = [];
      this.selectedKey = '';
      this.selectedValue = '';
      this.selectedPhones.clear();
      this.revealPhones = false;
    }
  }

  loadCachedData(): void {
    if (this.surveyId) {
      const cached = localStorage.getItem(`recipients:${this.surveyId}`);
      this.rawText = cached || '';
      this.parseText();
    } else {
      this.rawText = '';
      this.parseText();
    }
  }

  parseText(): void {
    const lines = this.rawText
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    this.parsedRows = lines.map(line => {
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      const item: RecipientImportItem = {};
      
      for (const p of parts) {
        if (/^\+?\d[\d\s-]{6,}$/.test(p)) {
          item.phone = p.replace(/\s|-/g, '');
        }
        else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p)) {
          item.email = p;
        }
        else if (p) {
          item.name = p;
        }
      }
      return item;
    });

    this.updateStats();
  }

  updateStats(): void {
    this.stats = {
      total: this.parsedRows.length,
      phones: this.parsedRows.filter(r => r.phone).length,
      emails: this.parsedRows.filter(r => r.email).length
    };
  }

  onTextChange(): void {
    this.parseText();
  }

  clearText(): void {
    this.rawText = '';
    this.parseText();
    this.message = null;
  }

  importRecipients(): void {
    if (!this.surveyId || this.parsedRows.length === 0) return;

    this.isUploading = true;
    this.message = null;

    if (this.surveyId) {
      localStorage.setItem(`recipients:${this.surveyId}`, this.rawText);
    }

    this.surveyService.uploadRecipients(this.surveyId, this.parsedRows).subscribe({
      next: () => {
        this.message = 'Destinatarios cargados exitosamente.';
        this.isUploading = false;
        setTimeout(() => {
          this.close();
        }, 1500);
      },
      error: (error) => {
        this.message = 'Guardado local. (Error al conectar con el servidor)';
        this.isUploading = false;
      }
    });
  }

  // =========================
  // Segmentación por respondents
  // =========================

  async loadRespondents(reset: boolean = true): Promise<void> {
    if (this.respondentsLoading) return;

    this.respondentsLoading = true;
    this.respondentsError = null;
    this.message = null;

    try {
      const offset = reset ? 0 : this.offset;
      const res = await firstValueFrom(this.surveyService.getRespondents({ limit: this.limit, offset }));
      const list = this.parseRespondentsResponse(res);

      if (reset) {
        this.respondents = list;
        this.offset = this.limit;
      } else {
        this.respondents = [...this.respondents, ...list];
        this.offset = this.offset + this.limit;
      }

      this.respondentsLoaded = this.respondents.length;
      this.hasMore = list.length === this.limit;

      this.refreshDemographicKeys();
      this.refreshDemographicValues();
    } catch (e: any) {
      this.respondentsError = e?.error?.detail || e?.message || 'No se pudieron cargar respondents';
    } finally {
      this.respondentsLoading = false;
    }
  }

  private parseRespondentsResponse(res: any): Respondent[] {
    if (Array.isArray(res)) return res as Respondent[];
    const respondents = res?.respondents || res?.items || res?.data || res?.results || [];
    return Array.isArray(respondents) ? (respondents as Respondent[]) : [];
  }

  private refreshDemographicKeys(): void {
    const keys = new Set<string>();
    for (const r of this.respondents) {
      const d = r?.demographics;
      if (d && typeof d === 'object') {
        Object.keys(d).forEach(k => keys.add(k));
      }
    }
    this.demographicKeys = Array.from(keys).sort((a, b) => a.localeCompare(b));
  }

  private refreshDemographicValues(): void {
    if (!this.selectedKey) {
      this.demographicValues = [];
      this.selectedValue = '';
      return;
    }
    const values = new Set<string>();
    for (const r of this.respondents) {
      const v = r?.demographics ? (r.demographics as any)[this.selectedKey] : undefined;
      values.add(this.normalizeDemoValue(v));
    }
    this.demographicValues = Array.from(values).sort((a, b) => a.localeCompare(b));
    if (this.selectedValue && !values.has(this.selectedValue)) {
      this.selectedValue = '';
    }
  }

  onKeyChange(): void {
    this.selectedValue = '';
    this.refreshDemographicValues();
    this.selectedPhones.clear();
  }

  onValueChange(): void {
    this.selectedPhones.clear();
  }

  private normalizeDemoValue(v: any): string {
    if (v === null || v === undefined) return 'N/A';
    if (typeof v === 'string') return v.trim() || 'N/A';
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (Array.isArray(v)) return v.length ? v.map(x => this.normalizeDemoValue(x)).join(', ') : 'N/A';
    if (typeof v === 'object') {
      if (v.label) return this.normalizeDemoValue(v.label);
      if (v.value) return this.normalizeDemoValue(v.value);
      if (v.name) return this.normalizeDemoValue(v.name);
      if (v.text) return this.normalizeDemoValue(v.text);
      const keys = Object.keys(v);
      if (keys.length === 0) return 'N/A';
      if (keys.length === 1) {
        const only = (v as any)[keys[0]];
        if (typeof only === 'string' || typeof only === 'number' || typeof only === 'boolean') return this.normalizeDemoValue(only);
      }
      // compacta props primitivas
      const pairs: string[] = [];
      for (const k of keys) {
        const val = (v as any)[k];
        if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') pairs.push(`${k}: ${this.normalizeDemoValue(val)}`);
      }
      if (pairs.length) return pairs.join(' · ');
      try { return JSON.stringify(v); } catch { return 'N/A'; }
    }
    return 'N/A';
  }

  getFilteredRespondents(): Respondent[] {
    const key = this.selectedKey;
    const value = this.selectedValue;

    const base = (this.respondents || []).filter(r => !!r.phone_number && !r.opt_out);
    if (!key) return base;

    return base.filter(r => {
      const v = r?.demographics ? (r.demographics as any)[key] : undefined;
      const nv = this.normalizeDemoValue(v);
      if (!value) return true;
      return nv === value;
    });
  }

  toggleSelectPhone(phone: string): void {
    if (!phone) return;
    if (this.selectedPhones.has(phone)) this.selectedPhones.delete(phone);
    else this.selectedPhones.add(phone);
  }

  selectAllFiltered(): void {
    this.selectedPhones.clear();
    this.getFilteredRespondents().forEach(r => {
      if (r.phone_number) this.selectedPhones.add(r.phone_number);
    });
  }

  clearSelection(): void {
    this.selectedPhones.clear();
  }

  async importSegmentRecipients(): Promise<void> {
    if (!this.surveyId) return;
    if (this.selectedPhones.size === 0) return;

    this.isUploading = true;
    this.message = null;

    try {
      const recipients: RecipientImportItem[] = Array.from(this.selectedPhones).map(phone => ({ phone }));
      await firstValueFrom(this.surveyService.uploadRecipients(this.surveyId, recipients));
      this.message = 'Destinatarios del segmento cargados exitosamente.';
      this.isUploading = false;
      setTimeout(() => this.close(), 1200);
    } catch (e: any) {
      this.message = e?.error?.detail || e?.message || 'Error al importar destinatarios del segmento';
      this.isUploading = false;
    }
  }

  maskPhone(phone: string): string {
    if (!phone) return '—';
    if (this.revealPhones) return phone;
    const last = phone.slice(-4);
    const prefix = phone.startsWith('+') ? '+' : '';
    return `${prefix}****${last}`;
  }

  close(): void {
    this.isOpen = false;
    this.onClose.emit();
  }
}

