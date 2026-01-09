import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ApiService } from '../../services/api/api.service';
import { AlertService } from '../../services/alert/alert.service';
import { CustomValidationService } from 'src/app/services/validations/custom-validation.service';
import { LocalDataService } from '../../services/localData/local-data.service';
import { RxwebValidators } from '@rxweb/reactive-form-validators';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.scss']
})
export class EditarPerfilComponent implements OnInit {

  files: File[] = [];
  loading: boolean = true;
  updateForm: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    genero_id: [null, Validators.required],
    tipo_documento_id: [null, Validators.required],
    numero_documento: ['', Validators.required],
    telefono: [''],
    email: ['', [Validators.required, Validators.email, this.customValidator.patternValidator()]],
    password: [''],
  });

  @Input() password = "";
  @Input() confirmedPassword = "";

  updatePasswordForm: FormGroup = this.fb.group({
    password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
    confirmedPassword: ['', Validators.compose([Validators.required, Validators.minLength(8), RxwebValidators.compare({ fieldName: 'password' })])],
  });

  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService, private customValidator: CustomValidationService, private localData: LocalDataService) { }

  ngOnInit() {
    this.getUser();
  }

  get updateFormControl() {
    return this.updateForm.controls;
  }

  get updatePasswordFormControl() {
    return this.updatePasswordForm.controls;
  }

  get keypressValidator() {
    return this.customValidator;
  }

  onSubmit() {
    if ((!this.updateFormControl['email'].errors?.['email'] || !this.updateFormControl['email'].errors?.['invalidEmail']) && !this.updateFormControl['password'].errors?.['minlength']) {

      if (this.updateForm.valid) {
        this.apiService.updateUser(this.updateForm.value).subscribe((resp: any) => {

          this.alertService.successAlert(resp.message);

        })
      } else {
        this.alertService.errorAlert("Llene los campos obligatorios.");
      }

    }
  }

  onSubmitPassword() {

    if (this.updatePasswordForm.valid) {
      this.apiService.updateUser({ password: this.updatePasswordFormControl['password'].value }).subscribe((resp: any) => {

        this.alertService.successAlert(resp.message);

      })
    } else {
      this.alertService.errorAlert("Llene los campos obligatorios.");
    }
  }

  getUser() {
    this.loading = true;
    this.apiService.getUser().subscribe({
      next: (resp: any) => {
        
        // Asegurar que el formulario esté habilitado
        this.updateForm.enable();
        
        // Mapear campos correctamente según la estructura del backend
        // El backend devuelve datos de users_control que tienen: nombres, apellidos, email, phone, etc.
        // Pero también puede devolver name/lastname si existe en users
        // Prioridad: nombres/apellidos (de users_control) > name/lastname (de users)
        const nombres = resp?.nombres || resp?.name || '';
        const apellidos = resp?.apellidos || resp?.lastname || '';
        // Para genero_id y tipo_documento_id, usar el valor exacto (puede ser null, 0, 1, 2, etc.)
        const genero_id = resp?.genero_id !== undefined ? resp.genero_id : null;
        const email = resp?.email || '';
        const tipo_documento_id = resp?.tipo_documento_id !== undefined ? resp.tipo_documento_id : null;
        const numero_documento = resp?.numero_documento || '';
        // Limpiar el teléfono: remover el prefijo "+57" si existe para mostrar solo el número local
        let telefono = resp?.telefono || resp?.phone || '';
        if (telefono) {
          // Remover el "+" y el código de país "57" si está presente
          telefono = telefono.replace(/^\+?57/, '').trim();
        }
        
       
        // Establecer valores en el formulario (establecer siempre, incluso si están vacíos o null)
        this.updateForm.patchValue({
          nombres: nombres || '',
          apellidos: apellidos || '',
          genero_id: genero_id !== null && genero_id !== undefined ? genero_id : null,
          email: email || '',
          tipo_documento_id: tipo_documento_id !== null && tipo_documento_id !== undefined ? tipo_documento_id : null,
          numero_documento: numero_documento || '',
          telefono: telefono || '',
          password: '' // No mostrar password
        });
        

        // Asegurar que todos los campos estén habilitados individualmente
        this.updateForm.get('nombres')?.enable();
        this.updateForm.get('apellidos')?.enable();
        this.updateForm.get('genero_id')?.enable();
        this.updateForm.get('email')?.enable();
        this.updateForm.get('tipo_documento_id')?.enable();
        this.updateForm.get('numero_documento')?.enable();
        this.updateForm.get('telefono')?.enable();
        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
      }
    });
  }

  onSelect(event: any) {
    this.files = [];
    this.files.push(...event.addedFiles);
  }

  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

}
