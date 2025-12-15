import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ChallengeService, ChallengeApiResponse, AssignedUser } from '@core/services/challenge.service';

/**
 * AssignedUsersModalComponent - Modal para ver usuarios asignados a un challenge
 */
@Component({
  selector: 'app-assigned-users-modal',
  templateUrl: './assigned-users-modal.component.html',
  styleUrls: ['./assigned-users-modal.component.scss']
})
export class AssignedUsersModalComponent implements OnChanges {
  @Input() show = false;
  @Input() challenge: ChallengeApiResponse | null = null;
  @Output() close = new EventEmitter<void>();

  assignedUsers: AssignedUser[] = [];
  loading = false;
  error: string | null = null;

  constructor(private challengeService: ChallengeService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show'] && this.show && this.challenge) {
      this.loadAssignedUsers();
    }
  }

  /**
   * Carga los usuarios asignados al challenge
   */
  loadAssignedUsers(): void {
    if (!this.challenge) return;

    this.loading = true;
    this.error = null;

    this.challengeService.getAssignedUsers(this.challenge.challenge_id).subscribe({
      next: (users) => {
        console.log('✅ Usuarios asignados cargados:', users);
        this.assignedUsers = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar usuarios asignados:', error);
        this.loading = false;
        
        let errorMessage = 'No se pudieron cargar los usuarios asignados';
        if (error?.status === 401 || error?.status === 403) {
          errorMessage = 'No tienes permisos para ver los usuarios asignados.';
        } else if (error?.status === 404) {
          errorMessage = 'El challenge no fue encontrado.';
        } else if (error?.status === 0) {
          errorMessage = 'El servicio no está disponible. Verifica que el backend esté corriendo.';
        }
        
        this.error = errorMessage;
      }
    });
  }

  /**
   * Cierra el modal
   */
  onClose(): void {
    this.assignedUsers = [];
    this.error = null;
    this.close.emit();
  }

  /**
   * Formatea la fecha para mostrar
   */
  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtiene el badge class según el status del usuario
   */
  getStatusBadgeClass(status?: string): string {
    if (!status) return 'badge bg-secondary';
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'completado':
        return 'badge bg-success';
      case 'active':
      case 'activo':
        return 'badge bg-primary';
      case 'pending':
      case 'pendiente':
        return 'badge bg-warning';
      default:
        return 'badge bg-secondary';
    }
  }
}

