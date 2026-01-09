import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { WhatsAppTemplatesService } from 'src/app/services/whatsapp-templates/whatsapp-templates.service';
import { 
  WhatsAppTemplatePending,
  UserDetails,
  ReferralDetailsResponse 
} from 'src/app/services/whatsapp-templates/whatsapp-templates.types';

interface Recipient {
  phone: string;
  parameters: Record<string, string>;
}

interface SendResult {
  recipient: string;
  status: 'sent' | 'failed';
  error?: string;
  response?: string;
}

@Component({
  selector: 'app-send-template-modal',
  templateUrl: './send-template-modal.component.html',
  styleUrls: ['./send-template-modal.component.scss']
})
export class SendTemplateModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen = false;
  @Input() template: WhatsAppTemplatePending | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  recipients: Recipient[] = [];
  sending = false;
  successState = false;
  error: string | null = null;
  results: SendResult[] = [];

  // Paginación
  currentPage = 1;
  recipientsPerPage = 10;

  // Selector de referidos
  showReferralSelector = false;
  selectedReferrals: UserDetails[] = [];
  referralData: ReferralDetailsResponse | null = null;
  referralLoading = false;
  referralError: string | null = null;

  // Filtros para referidos
  filterCity = '';
  filterState = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private whatsappService: WhatsAppTemplatesService
  ) { }

  ngOnInit(): void {
    if (this.isOpen) {
      this.recipients = [];
      this.currentPage = 1;
      this.successState = false;
      this.error = null;
      this.sending = false;
    }
  }

  ngOnChanges(): void {
    if (this.isOpen && this.template) {
      this.recipients = [];
      this.currentPage = 1;
      this.successState = false;
      this.error = null;
      this.sending = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get totalPages(): number {
    return Math.ceil(this.recipients.length / this.recipientsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.recipientsPerPage;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.recipientsPerPage, this.recipients.length);
  }

  get currentRecipients(): Recipient[] {
    return this.recipients.slice(this.startIndex, this.endIndex);
  }

  get paginatedIndexOffset(): number {
    return this.startIndex;
  }

  handlePhoneChange(index: number, phone: string): void {
    this.recipients[index].phone = phone;
  }

  handleParameterChange(index: number, paramName: string, value: string): void {
    this.recipients[index].parameters[paramName] = value;
  }

  addRecipient(): void {
    if (this.template && this.template.parameters) {
      const initialParameters: Record<string, string> = {};
      this.template.parameters.forEach(param => {
        initialParameters[param] = '';
      });
      
      this.recipients.push({ 
        phone: '', 
        parameters: { ...initialParameters } 
      });
      
      // Ir a la última página al agregar un destinatario
      const newTotalPages = Math.ceil(this.recipients.length / this.recipientsPerPage);
      this.currentPage = newTotalPages;
    }
  }

  removeRecipient(index: number): void {
    this.recipients.splice(index, 1);
    
    // Ajustar página actual si la última página queda vacía
    const newTotalPages = Math.ceil(this.recipients.length / this.recipientsPerPage);
    if (this.currentPage > newTotalPages && newTotalPages > 0) {
      this.currentPage = newTotalPages;
    } else if (this.recipients.length === 0) {
      this.currentPage = 1;
    }
  }

  validateForm(): boolean {
    // Validar que haya al menos un destinatario
    if (this.recipients.length === 0) {
      this.error = 'Debe agregar al menos un destinatario';
      return false;
    }

    // Validar que todos los teléfonos estén llenos
    const emptyPhones = this.recipients.some(r => !r.phone.trim());
    if (emptyPhones) {
      this.error = 'Todos los números de teléfono son requeridos';
      return false;
    }

    // Validar formato de teléfonos (básico)
    const phoneRegex = /^[\+]?[1-9][\d]{7,14}$/;
    const invalidPhones = this.recipients.some(r => !phoneRegex.test(r.phone.replace(/\s/g, '')));
    if (invalidPhones) {
      this.error = 'Formato de teléfono inválido. Use formato internacional con código de país (ej: +57XXXXXXXXXX)';
      return false;
    }

    // Validar que todos los parámetros estén llenos
    if (this.template && this.template.parameters) {
      const emptyParams = this.recipients.some(r => 
        this.template!.parameters.some(param => !r.parameters[param]?.trim())
      );
      if (emptyParams) {
        this.error = 'Todos los parámetros son requeridos';
        return false;
      }
    }

    return true;
  }

  handleSend(): void {
    
    if (!this.template) {
      this.error = 'No hay template seleccionado';
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    this.sending = true;
    this.error = null;
    this.results = [];

    // Preparar datos para el envío
    const phoneNumbers = this.recipients.map(r => r.phone);
    const parametersValues = this.recipients.map(r => r.parameters);

    // Para templates de WATI usar template_name, para templates de Firestore usar template_id
    const templateIdentifier = this.template.wati_template_id || this.template.template_name || this.template.template_id;
    
    const request = {
      template_id: templateIdentifier,
      recipients: phoneNumbers,
      parameters_values: parametersValues
    };


    const sub = this.whatsappService.sendPendingTemplate(request).subscribe({
      next: (data) => {
        this.successState = true;
        this.results = data.results || [];
        
        // Emitir evento de éxito
        this.success.emit();
        
        // Cerrar modal después de 3 segundos
        setTimeout(() => {
          this.handleClose();
        }, 3000);
      },
      error: (err) => {
        this.error = err.error?.detail || err.message || 'Error al enviar templates';
        this.sending = false;
      }
    });

    this.subscriptions.push(sub);
  }

  handleClose(): void {
    this.recipients = [];
    this.sending = false;
    this.successState = false;
    this.error = null;
    this.results = [];
    this.currentPage = 1;
    this.close.emit();
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  shouldShowPage(page: number): boolean {
    return page === 1 || 
           page === this.totalPages || 
           (page >= this.currentPage - 1 && page <= this.currentPage + 1);
  }

  shouldShowEllipsis(page: number): boolean {
    return (page === this.currentPage - 2 && this.currentPage > 3) ||
           (page === this.currentPage + 2 && this.currentPage < this.totalPages - 2);
  }

  // ============================================================================
  // MÉTODOS PARA SELECTOR DE REFERIDOS
  // ============================================================================

  loadReferrals(): void {
    if (this.referralData || this.referralLoading) return; // Ya cargados o cargando
    
    this.referralLoading = true;
    this.referralError = null;
    
    const sub = this.whatsappService.getUserReferrals().subscribe({
      next: (data) => {
        this.referralData = data;
        this.referralLoading = false;
      },
      error: (err) => {
        this.referralError = 'Error al cargar referidos';
        this.referralLoading = false;
      }
    });
    
    this.subscriptions.push(sub);
  }

  handleReferralToggle(referral: UserDetails): void {
    const isSelected = this.selectedReferrals.some(r => r.phone === referral.phone);
    if (isSelected) {
      this.selectedReferrals = this.selectedReferrals.filter(r => r.phone !== referral.phone);
    } else {
      this.selectedReferrals = [...this.selectedReferrals, referral];
    }
  }

  addSelectedReferrals(): void {
    if (this.template && this.template.parameters) {
      const initialParameters: Record<string, string> = {};
      this.template.parameters.forEach(param => {
        initialParameters[param] = '';
      });

      const newRecipients = this.selectedReferrals.map(referral => ({
        phone: referral.phone,
        parameters: { ...initialParameters }
      }));

      this.recipients = [...this.recipients, ...newRecipients];
      this.selectedReferrals = [];
      this.showReferralSelector = false;
      
      // Ir a la última página al agregar referidos
      const newTotalPages = Math.ceil(this.recipients.length / this.recipientsPerPage);
      this.currentPage = newTotalPages;
    }
  }

  selectAllFiltered(): void {
    const filtered = this.getFilteredReferrals();
    this.selectedReferrals = filtered;
  }

  deselectAll(): void {
    this.selectedReferrals = [];
  }

  getAllReferrals(): UserDetails[] {
    if (!this.referralData) return [];
    
    const allReferrals: UserDetails[] = [];
    
    // Agregar referidos directos
    Object.values(this.referralData.directos).forEach(referralList => {
      allReferrals.push(...referralList);
    });
    
    // Agregar referidos indirectos
    Object.values(this.referralData.indirectos).forEach(referralList => {
      allReferrals.push(...referralList);
    });
    
    // Eliminar duplicados por teléfono
    const uniqueReferrals = allReferrals.filter((referral, index, self) => 
      index === self.findIndex(r => r.phone === referral.phone)
    );
    
    return uniqueReferrals;
  }

  getFilteredReferrals(): UserDetails[] {
    let filtered = this.getAllReferrals();
    
    // Filtrar por departamento
    if (this.filterState) {
      filtered = filtered.filter(r => r.state === this.filterState);
    }
    
    // Filtrar por ciudad
    if (this.filterCity) {
      filtered = filtered.filter(r => r.city === this.filterCity);
    }
    
    return filtered;
  }

  getUniqueStates(): string[] {
    const allReferrals = this.getAllReferrals();
    const states = allReferrals
      .map(r => r.state)
      .filter((state): state is string => state !== null && state !== undefined && state.trim() !== '');
    return Array.from(new Set(states)).sort();
  }

  getUniqueCities(): string[] {
    let referrals = this.getAllReferrals();
    
    // Si hay departamento seleccionado, filtrar por ese departamento
    if (this.filterState) {
      referrals = referrals.filter(r => r.state === this.filterState);
    }
    
    const cities = referrals
      .map(r => r.city)
      .filter((city): city is string => city !== null && city !== undefined && city.trim() !== '');
    return Array.from(new Set(cities)).sort();
  }

  isReferralSelected(referral: UserDetails): boolean {
    return this.selectedReferrals.some(r => r.phone === referral.phone);
  }

  closeReferralSelector(): void {
    this.showReferralSelector = false;
    this.selectedReferrals = [];
  }

  clearFilters(): void {
    this.filterState = '';
    this.filterCity = '';
  }

  openReferralSelector(): void {
    this.loadReferrals();
    this.showReferralSelector = true;
  }
}

