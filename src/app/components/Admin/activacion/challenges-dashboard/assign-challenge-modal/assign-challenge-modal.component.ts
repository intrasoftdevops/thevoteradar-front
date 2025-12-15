import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChallengeService, ChallengeApiResponse } from '@core/services/challenge.service';
import { BackofficeAdminService } from 'src/app/services/backoffice-admin/backoffice-admin.service';
import { User } from 'src/app/services/backoffice-admin/backoffice-admin.types';

type AssignType = 'tree' | 'direct' | 'user';

/**
 * AssignChallengeModalComponent - Modal para asignar un challenge
 */
@Component({
  selector: 'app-assign-challenge-modal',
  templateUrl: './assign-challenge-modal.component.html',
  styleUrls: ['./assign-challenge-modal.component.scss']
})
export class AssignChallengeModalComponent {
  @Input() show = false;
  @Input() challenge: ChallengeApiResponse | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() assigned = new EventEmitter<void>();

  assignType: AssignType = 'tree';
  userPhone: string = '';
  selectedUser: User | null = null;

  // Selector de usuarios del sistema (para assignType === 'user')
  showUsersPicker = false;
  usersLoading = false;
  usersError: string | null = null;
  users: User[] = [];
  usersCursor?: string;
  usersHasMore = false;
  userSearch = '';

  assigning = false;
  error: string | null = null;

  constructor(
    private challengeService: ChallengeService,
    private adminService: BackofficeAdminService
  ) {}

  /**
   * Cierra el modal y resetea los campos
   */
  onClose(): void {
    this.assignType = 'tree';
    this.userPhone = '';
    this.selectedUser = null;
    this.showUsersPicker = false;
    this.usersLoading = false;
    this.usersError = null;
    this.users = [];
    this.usersCursor = undefined;
    this.usersHasMore = false;
    this.userSearch = '';
    this.error = null;
    this.close.emit();
  }

  openUsersPicker(): void {
    this.showUsersPicker = true;
    // Carga inicial si aún no tenemos usuarios
    if (this.users.length === 0) {
      this.loadUsers(true);
    }
  }

  closeUsersPicker(): void {
    this.showUsersPicker = false;
  }

  onUserSearchChange(): void {
    // búsqueda client-side sobre el set cargado
    // (el endpoint solo soporta cursor/limit)
  }

  getFilteredUsers(): User[] {
    const q = this.userSearch.trim().toLowerCase();
    if (!q) return this.users;
    return this.users.filter(u => {
      const fullName = `${u.name || ''} ${u.lastname || ''}`.trim().toLowerCase();
      const phone = (u.phone || '').toLowerCase();
      const city = (u.city || '').toLowerCase();
      const state = (u.state || '').toLowerCase();
      return (
        fullName.includes(q) ||
        phone.includes(q) ||
        city.includes(q) ||
        state.includes(q)
      );
    });
  }

  loadUsers(reset: boolean = true): void {
    if (this.usersLoading) return;
    if (!reset && !this.usersHasMore) return;

    this.usersLoading = true;
    this.usersError = null;

    const cursor = reset ? undefined : this.usersCursor;
    this.adminService.getAllUsers({ limit: 50, cursor }).subscribe({
      next: (res) => {
        this.users = reset ? (res.users || []) : [...this.users, ...(res.users || [])];
        this.usersCursor = res.next_page_cursor;
        this.usersHasMore = !!res.next_page_cursor;
        this.usersLoading = false;
      },
      error: (err) => {
        console.error('❌ AssignChallengeModal - Error cargando usuarios del sistema:', err);
        this.usersLoading = false;
        this.usersError = 'No se pudieron cargar los usuarios';
      }
    });
  }

  selectUserFromPicker(user: User): void {
    if (!user.phone) {
      this.usersError = 'Este usuario no tiene teléfono registrado';
      return;
    }
    this.selectedUser = user;
    this.userPhone = user.phone;
    this.usersError = null;
    this.showUsersPicker = false;
  }

  /**
   * Asigna el challenge según el tipo seleccionado
   */
  onAssign(): void {
    if (!this.challenge) return;

    if (this.assignType === 'user' && !this.userPhone.trim()) {
      this.error = 'Debes ingresar un número de teléfono';
      return;
    }

    this.assigning = true;
    this.error = null;

    const assignObservable = 
      this.assignType === 'tree'
        ? this.challengeService.assignToTree({ challenge_id: this.challenge.challenge_id })
        : this.assignType === 'direct'
        ? this.challengeService.assignToDirect({ challenge_id: this.challenge.challenge_id })
        : this.challengeService.assignToUser({ 
            challenge_id: this.challenge.challenge_id, 
            phone: this.userPhone.trim() 
          });

    assignObservable.subscribe({
      next: (response) => {
        console.log('✅ Challenge asignado exitosamente:', response);
        this.assigning = false;
        this.onClose();
        this.assigned.emit();
      },
      error: (error) => {
        console.error('❌ Error al asignar challenge:', error);
        this.assigning = false;
        
        let errorMessage = 'No se pudo asignar el challenge';
        if (error?.status === 400) {
          errorMessage = error?.error?.message || 'Datos inválidos. Verifica los campos.';
        } else if (error?.status === 401 || error?.status === 403) {
          errorMessage = 'No tienes permisos para asignar este challenge.';
        } else if (error?.status === 404) {
          errorMessage = 'El challenge o usuario no fue encontrado.';
        } else if (error?.status === 0) {
          errorMessage = 'El servicio no está disponible. Verifica que el backend esté corriendo.';
        }
        
        this.error = errorMessage;
      }
    });
  }

  /**
   * Obtiene el texto descriptivo del tipo de asignación
   */
  getAssignTypeDescription(): string {
    switch (this.assignType) {
      case 'tree':
        return 'Se asignará a todo tu árbol de referidos (todos los niveles)';
      case 'direct':
        return 'Se asignará solo a tus referidos directos (primer nivel)';
      case 'user':
        return 'Se asignará a un usuario específico por su número de teléfono';
      default:
        return '';
    }
  }
}

