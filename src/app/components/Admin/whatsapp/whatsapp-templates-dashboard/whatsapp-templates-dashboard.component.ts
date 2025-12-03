import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { WhatsAppTemplatesService } from 'src/app/services/whatsapp-templates/whatsapp-templates.service';
import { LocalDataService } from 'src/app/services/localData/local-data.service';
import {
  WhatsAppTemplatePending,
  WhatsAppTemplatePendingCreate,
  WhatsAppTemplateSummaryResponse
} from 'src/app/services/whatsapp-templates/whatsapp-templates.types';

type ViewType = 'main' | 'templates' | 'create' | 'send';

@Component({
  selector: 'app-whatsapp-templates-dashboard',
  templateUrl: './whatsapp-templates-dashboard.component.html',
  styleUrls: ['./whatsapp-templates-dashboard.component.scss']
})
export class WhatsAppTemplatesDashboardComponent implements OnInit, OnDestroy {
  loading = true;
  isAuthenticated = false;
  currentView: ViewType = 'main';
  templates: WhatsAppTemplatePending[] = [];
  templatesLoading = false;
  error: string | null = null;
  
  // Form data para crear template
  formData = {
    template_name: '',
    template_content: '',
    category: 'MARKETING',
    language: 'es',
    notes: ''
  };
  
  creating = false;
  createSuccess = false;
  
  // Modal de envío
  sendModalOpen = false;
  selectedTemplate: WhatsAppTemplatePending | null = null;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private whatsappService: WhatsAppTemplatesService,
    private localData: LocalDataService
  ) { }

  ngOnInit(): void {
    // Verificar autenticación - usar el servicio LocalData
    const token = this.localData.getBackofficeToken() || this.localData.getToken();
    this.isAuthenticated = !!token;
    this.loading = false;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  formatDate(dateString: string): string {
    return this.whatsappService.formatTemplateDate(dateString);
  }

  loadTemplates(): void {
    this.templatesLoading = true;
    this.error = null;
    
    const sub = this.whatsappService.getWatiTemplates().subscribe({
      next: (data) => {
        this.templates = data.templates || [];
        this.templatesLoading = false;
      },
      error: (err) => {
        console.error('Error loading templates:', err);
        this.error = `Error al cargar los templates: ${err.message}`;
        this.templatesLoading = false;
      }
    });
    
    this.subscriptions.push(sub);
  }

  handleViewTemplates(): void {
    this.currentView = 'templates';
    this.loadTemplates();
  }

  handleSendTemplates(): void {
    this.currentView = 'send';
    this.loadTemplates();
  }

  handleSendTemplate(template: WhatsAppTemplatePending): void {
    this.selectedTemplate = template;
    this.sendModalOpen = true;
  }

  handleCreateTemplate(event: Event): void {
    event.preventDefault();
    
    if (!this.formData.template_name.trim() || !this.formData.template_content.trim()) {
      this.error = 'Por favor completa el nombre y contenido del template';
      return;
    }

    this.creating = true;
    this.error = null;
    this.createSuccess = false;

    // Extraer parámetros del contenido automáticamente
    const paramMatches = this.formData.template_content.match(/\{\{(\w+)\}\}/g);
    const extractedParams = paramMatches ? [...new Set(paramMatches.map(match => match.slice(2, -2)))] : [];

    const templateData: WhatsAppTemplatePendingCreate = {
      template_name: this.formData.template_name,
      template_content: this.formData.template_content,
      parameters: extractedParams,
      category: this.formData.category,
      language: this.formData.language,
      notes: this.formData.notes
    };

    const sub = this.whatsappService.createPendingTemplate(templateData).subscribe({
      next: () => {
        this.createSuccess = true;
        // Reset form
        this.formData = {
          template_name: '',
          template_content: '',
          category: 'MARKETING',
          language: 'es',
          notes: ''
        };
        this.creating = false;
      },
      error: (err) => {
        console.error('Error creating template:', err);
        if (err.status === 401) {
          this.error = 'Token de autenticación expirado. Por favor, inicia sesión nuevamente.';
        } else {
          this.error = err.error?.detail || `Error al crear el template (${err.status})`;
        }
        this.creating = false;
      }
    });
    
    this.subscriptions.push(sub);
  }

  handleBackToMain(): void {
    this.currentView = 'main';
    this.error = null;
    this.createSuccess = false;
  }

  handleCreateView(): void {
    this.currentView = 'create';
  }

  closeSendModal(): void {
    this.sendModalOpen = false;
    this.selectedTemplate = null;
  }

  onSendSuccess(): void {
    // Recargar templates después de enviar
    this.loadTemplates();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    return this.whatsappService.getTemplateStatusLabel(status);
  }

  get approvedTemplates(): WhatsAppTemplatePending[] {
    return this.templates.filter(t => t.status === 'created');
  }

  get hasApprovedTemplates(): boolean {
    return this.approvedTemplates.length > 0;
  }
}
