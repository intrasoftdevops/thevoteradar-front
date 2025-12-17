import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChallengeService, ChallengeApiResponse, UpdateChallengeRequest } from '@core/services/challenge.service';

/**
 * EditChallengeModalComponent - Modal para editar un challenge existente
 */
@Component({
  selector: 'app-edit-challenge-modal',
  templateUrl: './edit-challenge-modal.component.html',
  styleUrls: ['./edit-challenge-modal.component.scss']
})
export class EditChallengeModalComponent implements OnChanges {
  @Input() show = false;
  @Input() challenge: ChallengeApiResponse | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  challengeForm: FormGroup;
  updating = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private challengeService: ChallengeService
  ) {
    this.challengeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      puntos: [0, [Validators.required, Validators.min(1)]],
      max_users: [0, [Validators.required, Validators.min(1)]],
      max_date: ['', [Validators.required]],
      max_limit: [null],
      reward_id: [''],
      status: ['active', [Validators.required]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['challenge'] && this.challenge) {
      this.loadChallengeData();
    }
  }

  /**
   * Carga los datos del challenge en el formulario
   */
  loadChallengeData(): void {
    if (!this.challenge) return;

    // Formatear la fecha para el input datetime-local
    const maxDate = this.challenge.max_date 
      ? new Date(this.challenge.max_date).toISOString().slice(0, 16)
      : '';

    this.challengeForm.patchValue({
      name: this.challenge.name || '',
      description: this.challenge.description || '',
      puntos: this.challenge.puntos || 0,
      max_users: this.challenge.max_users || 0,
      max_date: maxDate,
      max_limit: this.challenge.max_limit || null,
      reward_id: this.challenge.reward_id || '',
      status: this.challenge.status || 'active'
    });
  }

  /**
   * Cierra el modal y resetea el formulario
   */
  onClose(): void {
    this.error = null;
    this.close.emit();
  }

  /**
   * Actualiza el challenge
   */
  onUpdate(): void {
    if (this.challengeForm.invalid || !this.challenge) {
      this.markFormGroupTouched(this.challengeForm);
      return;
    }

    this.updating = true;
    this.error = null;

    const formValue = this.challengeForm.value;
    const challengeData: UpdateChallengeRequest = {
      name: formValue.name,
      description: formValue.description || undefined,
      puntos: formValue.puntos,
      max_users: formValue.max_users,
      max_date: new Date(formValue.max_date).toISOString(),
      max_limit: formValue.max_limit || undefined,
      reward_id: formValue.reward_id || undefined,
      status: formValue.status as 'active' | 'completed' | 'upcoming' | 'cancelled'
    };

    this.challengeService.updateChallenge(this.challenge.challenge_id, challengeData).subscribe({
      next: (response) => {
        console.log('✅ Challenge actualizado exitosamente:', response);
        this.updating = false;
        this.onClose();
        this.updated.emit();
      },
      error: (error) => {
        console.error('❌ Error al actualizar challenge:', error);
        this.updating = false;
        
        let errorMessage = 'No se pudo actualizar el challenge';
        if (error?.status === 400) {
          errorMessage = error?.error?.message || 'Datos inválidos. Verifica los campos.';
        } else if (error?.status === 401 || error?.status === 403) {
          errorMessage = 'No tienes permisos para actualizar este challenge.';
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
   * Marca todos los campos del formulario como touched para mostrar errores
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getFieldError(fieldName: string): string {
    const field = this.challengeForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (field?.hasError('maxlength')) {
      return `Máximo ${field.errors?.['maxlength'].requiredLength} caracteres`;
    }
    if (field?.hasError('min')) {
      return `El valor mínimo es ${field.errors?.['min'].min}`;
    }
    return '';
  }

  /**
   * Verifica si un campo tiene error
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.challengeForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}

