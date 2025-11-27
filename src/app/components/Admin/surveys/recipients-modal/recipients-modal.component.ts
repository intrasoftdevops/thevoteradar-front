import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { SurveyService, RecipientImportItem } from '../../../../services/survey/survey.service';

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

  constructor(private surveyService: SurveyService) { }

  ngOnInit(): void {
    this.loadCachedData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue && this.surveyId) {
      this.loadCachedData();
      this.message = null;
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
        console.error('Error al importar destinatarios:', error);
        this.message = 'Guardado local. (Error al conectar con el servidor)';
        this.isUploading = false;
      }
    });
  }

  close(): void {
    this.isOpen = false;
    this.onClose.emit();
  }
}

