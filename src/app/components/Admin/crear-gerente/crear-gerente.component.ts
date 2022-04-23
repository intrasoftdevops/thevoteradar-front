import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import { AlertService } from 'src/app/services/alert/alert.service';

@Component({
  selector: 'app-crear-gerente',
  templateUrl: './crear-gerente.component.html',
  styleUrls: ['./crear-gerente.component.scss']
})
export class CrearGerenteComponent implements OnInit {

  dataMunicipals: any = [];
  dataDepartments: any = [];

  createForm: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    genero_id: [null, Validators.required],
    tipo_documento_id: [null, Validators.required],
    numero_documento: ['', Validators.required],
    telefono: [''],
    email: ['', [Validators.required, Validators.email, this.customValidator.patternValidator()]],
    password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
    departamento: [[], Validators.required],
    municipios: [[]],
  });

  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService, private customValidator: CustomValidationService) { }

  ngOnInit() {
    this.getDepartmentAdmin();
  }

  getSelectedValue(item: any) {
    this.createForm.patchValue({
      municipios: [],
    });
    if (item) {
      this.getMunicipalAdmin(item.codigo_unico)
    } else {
      this.dataMunicipals = [];
    }
  }

  get createFormControl() {
    return this.createForm.controls;
  }

  get keypressValidator() {
    return this.customValidator;
  }

  onSubmit() {
    console.log(this.createForm.value)
    if ((!this.createFormControl['email'].errors?.['email'] || !this.createFormControl['email'].errors?.['invalidEmail']) && !this.createFormControl['password'].errors?.['minlength']) {

      if (this.createForm.valid) {
        console.log(this.createForm.value)
        this.apiService.createGerente(this.createForm.value).subscribe((resp: any) => {
          this.alertService.successAlert(resp.message);
        })
      } else {
        this.alertService.errorAlert("Llene los campos obligatorios.");
      }

    }
  }

  getDepartmentAdmin() {
    this.apiService.getDepartmentAdmin().subscribe((resp: any) => {
      this.dataDepartments = resp;
    })
  }

  getMunicipalAdmin(data: any) {
    this.apiService.getMunicipalAdmin().subscribe((resp: any) => {
      console.log(resp)
      this.dataMunicipals = resp.filter((dataMunicipal: any) => dataMunicipal.codigo_departamento_votacion == data);
      console.log(this.dataMunicipals)
    });
  }

}
