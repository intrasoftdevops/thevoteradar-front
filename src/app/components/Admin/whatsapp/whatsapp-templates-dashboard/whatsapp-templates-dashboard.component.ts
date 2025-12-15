import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { WhatsAppTemplatesService } from 'src/app/services/whatsapp-templates/whatsapp-templates.service';
import { LocalDataService } from 'src/app/services/localData/local-data.service';
import {
  WhatsAppTemplatePending,
  WhatsAppTemplatePendingCreate,
  WhatsAppTemplateSummaryResponse
} from 'src/app/services/whatsapp-templates/whatsapp-templates.types';

@Component({
  selector: 'app-whatsapp-templates-dashboard',
  templateUrl: './whatsapp-templates-dashboard.component.html',
  styleUrls: ['./whatsapp-templates-dashboard.component.scss']
})
export class WhatsAppTemplatesDashboardComponent implements OnInit, OnDestroy {
  templates: WhatsAppTemplatePending[] = [];
  filteredTemplates: WhatsAppTemplatePending[] = [];
  templatesLoading = false;
  error: string | null = null;

  // Búsqueda y filtros
  searchTerm = '';
  selectedStatus = '';
  selectedCategory = '';
  sortBy: 'date' | 'name' | 'status' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';
  
  // Modales
  showCreateModal = false;
  showSendModal = false;
  selectedTemplate: WhatsAppTemplatePending | null = null;
  
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
  
  private subscriptions: Subscription[] = [];

  constructor(
    private whatsappService: WhatsAppTemplatesService,
    private localData: LocalDataService
  ) { }

  ngOnInit(): void {
    // Cargar templates directamente al iniciar
    this.loadTemplates();
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
        console.log('📱 WhatsApp - Respuesta completa del endpoint:', data);
        console.log('📱 WhatsApp - Templates recibidos:', data.templates);
        console.log('📱 WhatsApp - Total desde API:', data.total);
        console.log('📱 WhatsApp - Length del array:', data.templates?.length);
        
        this.templates = data.templates || [];
        this.filteredTemplates = [...this.templates];
        
        console.log('📱 WhatsApp - Templates asignados al componente:', this.templates.length);
        console.log('📱 WhatsApp - Filtered templates:', this.filteredTemplates.length);
        
        this.applyFilters();
        this.templatesLoading = false;
      },
      error: (err) => {
        console.error('❌ WhatsApp - Error loading templates:', err);
        this.error = `Error al cargar los templates: ${err.message}`;
        this.templates = [];
        this.filteredTemplates = [];
        this.templatesLoading = false;
      }
    });

    this.subscriptions.push(sub);
  }

  /**
   * Aplicar filtros y búsqueda
   */
  applyFilters(): void {
    console.log('🔍 WhatsApp - Aplicando filtros...');
    console.log('🔍 WhatsApp - Templates totales:', this.templates.length);
    console.log('🔍 WhatsApp - Filtros activos:', {
      searchTerm: this.searchTerm,
      selectedStatus: this.selectedStatus,
      selectedCategory: this.selectedCategory,
      sortBy: this.sortBy
    });

    let filtered = [...this.templates];
    console.log('🔍 WhatsApp - Después de copiar:', filtered.length);

    // Filtrar por búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.template_name.toLowerCase().includes(term) ||
        t.template_content.toLowerCase().includes(term)
      );
      console.log('🔍 WhatsApp - Después de búsqueda:', filtered.length);
    }

    // Filtrar por status
    if (this.selectedStatus) {
      filtered = filtered.filter(t => t.status === this.selectedStatus);
      console.log('🔍 WhatsApp - Después de filtrar status:', filtered.length);
    }

    // Filtrar por categoría
    if (this.selectedCategory) {
      filtered = filtered.filter(t => t.category === this.selectedCategory);
      console.log('🔍 WhatsApp - Después de filtrar categoría:', filtered.length);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'name':
          comparison = a.template_name.localeCompare(b.template_name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'date':
        default:
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          comparison = dateB - dateA;
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.filteredTemplates = filtered;
    console.log('✅ WhatsApp - Templates filtrados finales:', this.filteredTemplates.length);
    console.log('✅ WhatsApp - Nombres de templates filtrados:', this.filteredTemplates.map(t => t.template_name));
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedCategory = '';
    this.sortBy = 'date';
    this.sortOrder = 'desc';
    this.applyFilters();
  }

  openCreateModal(): void {
    console.log('🔄 WhatsAppDashboard - Abriendo modal de crear template');
    this.showCreateModal = true;
    this.createSuccess = false;
    this.error = null;
    console.log('✅ WhatsAppDashboard - showCreateModal:', this.showCreateModal);
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.formData = {
      template_name: '',
      template_content: '',
      category: 'MARKETING',
      language: 'es',
      notes: ''
    };
    this.createSuccess = false;
    this.error = null;
  }

  openSendModal(template: WhatsAppTemplatePending): void {
    console.log('🔄 WhatsAppDashboard - Abriendo modal de enviar template:', template);
    this.selectedTemplate = template;
    this.showSendModal = true;
    console.log('✅ WhatsAppDashboard - showSendModal:', this.showSendModal);
  }

  closeSendModal(): void {
    this.showSendModal = false;
    this.selectedTemplate = null;
  }

  onCreateTemplate(): void {
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
        this.creating = false;
        // Recargar templates después de crear
        setTimeout(() => {
          this.loadTemplates();
          this.closeCreateModal();
        }, 1500);
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

  onSendSuccess(): void {
    // Recargar templates después de enviar
    this.loadTemplates();
    this.closeSendModal();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'created':
        return 'badge bg-success';
      case 'failed':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  isApproved(template: WhatsAppTemplatePending): boolean {
    // Un template está aprobado si tiene status 'created' y tiene wati_template_id
    return this.whatsappService.isTemplateReadyForSending(template);
  }

  truncateText(text: string, maxLength: number = 100): string {
    if (!text) return 'Sin contenido';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  getCategoryLabel(category: string): string {
    const categoryLabels: Record<string, string> = {
      'MARKETING': 'Marketing',
      'UTILITY': 'Utilidad',
      'AUTHENTICATION': 'Autenticación'
    };
    return categoryLabels[category] || category || 'Sin categoría';
  }

  /**
   * Obtener el texto del idioma para mostrar
   * Maneja tanto strings como objetos { key, value, text }
   */
  getLanguageDisplay(language: any): string {
    if (!language) return '';
    
    // Si es un objeto con la estructura { key, value, text }
    if (typeof language === 'object' && language !== null) {
      return (language.text || language.value || language.key || 'es').toUpperCase();
    }
    
    // Si es un string simple
    if (typeof language === 'string') {
      return language.toUpperCase();
    }
    
    return '';
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
