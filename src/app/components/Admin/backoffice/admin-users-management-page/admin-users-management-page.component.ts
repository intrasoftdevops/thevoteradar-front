import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { BackofficeAdminService } from '../../../../services/backoffice-admin/backoffice-admin.service';
import { User, LocationsResponse } from '../../../../services/backoffice-admin/backoffice-admin.types';

@Component({
  selector: 'app-admin-users-management-page',
  templateUrl: './admin-users-management-page.component.html',
  styleUrls: ['./admin-users-management-page.component.scss']
})
export class AdminUsersManagementPageComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  locations: LocationsResponse | null = null;
  loading = false;
  error: string | null = null;
  hasMore = false;
  hasMoreFiltered = false;
  
  selectedCity = '';
  selectedState = '';
  selectedUser: User | null = null;
  isFiltering = false;
  filterError: string | null = null;
  filterCursor: string | undefined;
  activeFilter: { type: 'city' | 'state', value: string } | null = null;

  // Selección múltiple para envío masivo
  selectedUsers: Set<string> = new Set(); // Set de phone numbers
  showSendTemplateModal = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private adminService: BackofficeAdminService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to users
    const usersSub = this.adminService.users$.subscribe(users => {
      this.users = users;
    });

    // Subscribe to loading
    const loadingSub = this.adminService.loading$.subscribe(loading => {
      this.loading = loading;
    });

    // Subscribe to error
    const errorSub = this.adminService.error$.subscribe(error => {
      this.error = error;
    });

    // Subscribe to hasMore
    const hasMoreSub = this.adminService.hasMore$.subscribe(hasMore => {
      this.hasMore = hasMore;
    });

    // Subscribe to locations
    const locationsSub = this.adminService.locations$.subscribe(locations => {
      this.locations = locations;
    });

    this.subscriptions.push(usersSub, loadingSub, errorSub, hasMoreSub, locationsSub);

    // Fetch initial data
    this.adminService.fetchUsers({ limit: 50 });
    this.adminService.fetchLocations();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getCurrentUsers(): User[] {
    return this.filteredUsers.length > 0 ? this.filteredUsers : this.users;
  }

  isFilterActive(): boolean {
    return this.filteredUsers.length > 0;
  }

  async handleFilterByCity(reset: boolean = true): Promise<void> {
    if (!this.selectedCity) return;
    
    this.isFiltering = true;
    this.filterError = null;
    
    try {
      const params = {
        city: this.selectedCity,
        limit: 50,
        cursor: reset ? undefined : this.filterCursor
      };
      
      const response = await firstValueFrom(this.adminService.getUsersByCity(params));
      
      if (response) {
        if (reset) {
          this.filteredUsers = response.users;
          this.activeFilter = { type: 'city', value: this.selectedCity };
        } else {
          this.filteredUsers = [...this.filteredUsers, ...response.users];
        }
        
        this.filterCursor = response.next_page_cursor;
        this.hasMoreFiltered = !!response.next_page_cursor;
      }
    } catch (err: any) {
      this.filterError = err.error?.detail || 'Error al filtrar por ciudad';
    } finally {
      this.isFiltering = false;
    }
  }

  async handleFilterByState(reset: boolean = true): Promise<void> {
    if (!this.selectedState) return;
    
    this.isFiltering = true;
    this.filterError = null;
    
    try {
      const params = {
        state: this.selectedState,
        limit: 50,
        cursor: reset ? undefined : this.filterCursor
      };
      
      const response = await firstValueFrom(this.adminService.getUsersByState(params));
      
      if (response) {
        if (reset) {
          this.filteredUsers = response.users;
          this.activeFilter = { type: 'state', value: this.selectedState };
        } else {
          this.filteredUsers = [...this.filteredUsers, ...response.users];
        }
        
        this.filterCursor = response.next_page_cursor;
        this.hasMoreFiltered = !!response.next_page_cursor;
      }
    } catch (err: any) {
      this.filterError = err.error?.detail || 'Error al filtrar por estado';
    } finally {
      this.isFiltering = false;
    }
  }

  async loadMoreFiltered(): Promise<void> {
    if (!this.activeFilter || !this.filterCursor || this.isFiltering) return;
    
    if (this.activeFilter.type === 'city') {
      await this.handleFilterByCity(false);
    } else {
      await this.handleFilterByState(false);
    }
  }

  handleClearFilters(): void {
    this.selectedCity = '';
    this.selectedState = '';
    this.filteredUsers = [];
    this.filterError = null;
    this.filterCursor = undefined;
    this.hasMoreFiltered = false;
    this.activeFilter = null;
    this.adminService.refreshUsers();
  }

  loadMore(): void {
    this.adminService.loadMoreUsers();
  }

  openUserDetails(user: User): void {
    this.selectedUser = user;
  }

  closeUserDetails(): void {
    this.selectedUser = null;
  }

  /**
   * Contactar usuario por WhatsApp
   * Abre wa.me con el número del usuario en formato correcto
   */
  contactViaWhatsApp(phone: string | null): void {
    if (!phone) {
      return;
    }

    // Limpiar el número: solo dígitos y el signo +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // Construir URL de WhatsApp
    const whatsappUrl = `https://wa.me/${cleanPhone}`;
    
    
    // Abrir en nueva pestaña
    window.open(whatsappUrl, '_blank');
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  // Métodos helper para manejar eventos hover y focus con TypeScript
  onButtonHoverEnter(event: Event): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.background = 'linear-gradient(to right, var(--color-accent), var(--color-primary))';
    }
  }

  onButtonHoverLeave(event: Event): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.background = 'linear-gradient(to right, var(--color-primary), var(--color-accent))';
    }
  }

  onDetailButtonHoverEnter(event: Event): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.borderColor = 'var(--color-primary)';
      target.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.1)';
    }
  }

  onDetailButtonHoverLeave(event: Event): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.borderColor = 'rgba(var(--color-primary-rgb), 0.3)';
      target.style.backgroundColor = '';
    }
  }

  onInputFocus(event: Event): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.borderColor = 'var(--color-primary)';
      target.style.boxShadow = '0 0 0 2px rgba(var(--color-primary-rgb), 0.2)';
    }
  }

  onInputBlur(event: Event): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.borderColor = '';
      target.style.boxShadow = '';
    }
  }

  // ========================================
  // MÉTODOS PARA SELECCIÓN MÚLTIPLE
  // ========================================

  /**
   * Toggle selección de un usuario
   */
  toggleUserSelection(phone: string | null): void {
    if (!phone) return; // Si no hay teléfono, no hacer nada
    
    if (this.selectedUsers.has(phone)) {
      this.selectedUsers.delete(phone);
    } else {
      this.selectedUsers.add(phone);
    }
  }

  /**
   * Verificar si un usuario está seleccionado
   */
  isUserSelected(phone: string): boolean {
    return this.selectedUsers.has(phone);
  }

  /**
   * Seleccionar todos los usuarios visibles
   */
  selectAllUsers(): void {
    const currentUsers = this.getCurrentUsers();
    currentUsers.forEach(user => {
      if (user.phone) {
        this.selectedUsers.add(user.phone);
      }
    });
  }

  /**
   * Deseleccionar todos los usuarios
   */
  deselectAllUsers(): void {
    this.selectedUsers.clear();
  }

  /**
   * Obtener array de usuarios seleccionados
   */
  getSelectedUsersArray(): User[] {
    const currentUsers = this.getCurrentUsers();
    return currentUsers.filter(user => user.phone && this.selectedUsers.has(user.phone));
  }

  /**
   * Abrir modal para enviar template a usuarios seleccionados
   */
  openSendTemplateModal(): void {
    if (this.selectedUsers.size === 0) {
      alert('Selecciona al menos un usuario para enviar el template');
      return;
    }
    this.showSendTemplateModal = true;
  }

  /**
   * Cerrar modal de envío de template
   */
  closeSendTemplateModal(): void {
    this.showSendTemplateModal = false;
  }

  /**
   * Callback cuando se envía el template exitosamente
   */
  onTemplateSent(): void {
    this.deselectAllUsers();
    this.showSendTemplateModal = false;
  }

  /**
   * Navegar a WhatsApp con usuarios preseleccionados
   * Guarda los usuarios en localStorage y navega
   */
  goToWhatsAppWithSelectedUsers(): void {
    const selectedUsersData = this.getSelectedUsersArray().map(user => ({
      phone: user.phone,
      name: `${user.name || ''} ${user.lastname || ''}`.trim(),
      email: user.email
    }));

    // Guardar en localStorage para que el componente de WhatsApp los use
    localStorage.setItem('preselectedWhatsAppRecipients', JSON.stringify(selectedUsersData));
    
    
    // Navegar a WhatsApp
    this.router.navigate(['/panel/activacion/whatsapp']);
    
    // Cerrar modal
    this.closeSendTemplateModal();
  }
}

