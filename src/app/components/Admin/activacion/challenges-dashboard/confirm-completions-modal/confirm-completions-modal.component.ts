import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChallengeService, ChallengeApiResponse } from '@core/services/challenge.service';

/**
 * ConfirmCompletionsModalComponent - Modal para confirmar completaciones de challenge
 */
@Component({
  selector: 'app-confirm-completions-modal',
  templateUrl: './confirm-completions-modal.component.html',
  styleUrls: ['./confirm-completions-modal.component.scss']
})
export class ConfirmCompletionsModalComponent {
  @Input() show = false;
  @Input() challenge: ChallengeApiResponse | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  phones: string[] = [''];
  confirming = false;
  error: string | null = null;

  constructor(private challengeService: ChallengeService) {}

  /**
   * Cierra el modal y resetea los campos
   */
  onClose(): void {
    this.phones = [''];
    this.error = null;
    this.close.emit();
  }

  /**
   * Agrega un nuevo campo de teléfono
   */
  addPhoneField(): void {
    this.phones.push('');
  }

  /**
   * Elimina un campo de teléfono
   */
  removePhoneField(index: number): void {
    if (this.phones.length > 1) {
      this.phones.splice(index, 1);
    }
  }

  /**
   * Obtiene los teléfonos válidos (no vacíos)
   */
  getValidPhones(): string[] {
    return this.phones
      .map(phone => phone.trim())
      .filter(phone => phone.length > 0);
  }

  /**
   * Confirma las completaciones
   */
  onConfirm(): void {
    if (!this.challenge) return;

    const validPhones = this.getValidPhones();
    if (validPhones.length === 0) {
      this.error = 'Debes ingresar al menos un número de teléfono';
      return;
    }

    this.confirming = true;
    this.error = null;

    this.challengeService.confirmCompletions({
      challenge_id: this.challenge.challenge_id,
      phones: validPhones
    }).subscribe({
      next: (response) => {
        console.log('✅ Completaciones confirmadas exitosamente:', response);
        this.confirming = false;
        this.onClose();
        this.confirmed.emit();
      },
      error: (error) => {
        console.error('❌ Error al confirmar completaciones:', error);
        this.confirming = false;
        
        let errorMessage = 'No se pudieron confirmar las completaciones';
        if (error?.status === 400) {
          errorMessage = error?.error?.message || 'Datos inválidos. Verifica los números de teléfono.';
        } else if (error?.status === 401 || error?.status === 403) {
          errorMessage = 'No tienes permisos para confirmar completaciones.';
        } else if (error?.status === 404) {
          errorMessage = 'El challenge no fue encontrado.';
        } else if (error?.status === 0) {
          errorMessage = 'El servicio no está disponible. Verifica que el backend esté corriendo.';
        }
        
        this.error = errorMessage;
      }
    });
  }
}

