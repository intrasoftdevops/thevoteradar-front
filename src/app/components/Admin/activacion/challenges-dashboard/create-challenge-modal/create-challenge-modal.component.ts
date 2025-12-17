import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChallengeService, CreateChallengeRequest } from '@core/services/challenge.service';

/**
 * CreateChallengeModalComponent - Modal para crear un nuevo challenge
 */
@Component({
  selector: 'app-create-challenge-modal',
  templateUrl: './create-challenge-modal.component.html',
  styleUrls: ['./create-challenge-modal.component.scss']
})
export class CreateChallengeModalComponent {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  challengeForm: FormGroup;
  creating = false;
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
      max_limit: [0, [Validators.required, Validators.min(0)]],
      reward_id: ['']
    });
  }

  /**
   * Cierra el modal y resetea el formulario
   */
  onClose(): void {
    this.challengeForm.reset();
    this.error = null;
    this.close.emit();
  }

  /**
   * Crea el challenge
   */
  onCreate(): void {
    if (this.challengeForm.invalid) {
      this.markFormGroupTouched(this.challengeForm);
      return;
    }

    this.creating = true;
    this.error = null;

    const formValue = this.challengeForm.value;
    const challengeData: CreateChallengeRequest = {
      name: formValue.name,
      description: formValue.description || '',
      puntos: formValue.puntos,
      max_users: formValue.max_users,
      max_date: new Date(formValue.max_date).toISOString(),
      max_limit: formValue.max_limit ?? 0, // Requerido por el backend, usar 0 como valor por defecto si no se especifica
      reward_id: formValue.reward_id || undefined
    };

    this.challengeService.createChallenge(challengeData).subscribe({
      next: (response) => {
        console.log('✅ Challenge creado exitosamente:', response);
        this.creating = false;
        this.onClose();
        this.created.emit();
      },
      error: (error) => {
        console.error('❌ Error al crear challenge:', error);
        this.creating = false;
        
        let errorMessage = 'No se pudo crear el challenge';
        if (error?.status === 400) {
          errorMessage = error?.error?.message || 'Datos inválidos. Verifica los campos.';
        } else if (error?.status === 401 || error?.status === 403) {
          errorMessage = 'No tienes permisos para crear challenges.';
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

