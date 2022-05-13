import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ApiService } from '../../services/api/api.service';
import { AlertService } from '../../services/alert/alert.service';
import { CustomValidationService } from 'src/app/services/validations/custom-validation.service';
import { LocalDataService } from '../../services/localData/local-data.service';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.scss']
})
export class EditarPerfilComponent implements OnInit {

  files: File[] = [];
  updateForm: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    genero_id: [null, Validators.required],
    tipo_documento_id: [null, Validators.required],
    numero_documento: ['', Validators.required],
    telefono: [''],
    email: ['', [Validators.required, Validators.email, this.customValidator.patternValidator()]],
    password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
  });

  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService, private customValidator: CustomValidationService, private localData: LocalDataService) { }

  ngOnInit() {
    this.getUser();
  }

  get createFormControl() {
    return this.updateForm.controls;
  }

  get keypressValidator() {
    return this.customValidator;
  }

  onSubmit() {
    console.log(this.updateForm.value)
    if ((!this.createFormControl['email'].errors?.['email'] || !this.createFormControl['email'].errors?.['invalidEmail']) && !this.createFormControl['password'].errors?.['minlength']) {

      if (this.updateForm.valid) {
        console.log(this.updateForm.value)
        this.apiService.updateUser(this.updateForm.value).subscribe((resp: any) => {

          this.alertService.successAlert(resp.message);

        })
      } else {
        this.alertService.errorAlert("Llene los campos obligatorios.");
      }

    }
  }

  getUser() {
    this.apiService.getUser().subscribe((resp: any) => {
      this.updateForm.get('nombres')?.setValue(resp.nombres);
      this.updateForm.get('apellidos')?.setValue(resp.apellidos);
      this.updateForm.get('genero_id')?.setValue(resp.genero_id);
      this.updateForm.get('email')?.setValue(resp.email);
      this.updateForm.get('password')?.setValue(resp.password);
      this.updateForm.get('tipo_documento_id')?.setValue(resp.tipo_documento_id);
      this.updateForm.get('numero_documento')?.setValue(resp.numero_documento);
      this.updateForm.get('telefono')?.setValue(resp.telefono);

    })
  }

  onSelect(event: any) {
    this.files=[];
    this.files.push(...event.addedFiles);
    console.log(this.files)
  }

  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
    console.log(this.files)
  }

}
