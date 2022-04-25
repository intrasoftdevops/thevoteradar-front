import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ApiService } from '../../../services/api/api.service';
import { AlertService } from '../../../services/alert/alert.service';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';

@Component({
  selector: 'app-crear-coordinador-admin',
  templateUrl: './crear-coordinador-admin.component.html',
  styleUrls: ['./crear-coordinador-admin.component.scss']
})
export class CrearCoordinadorAdminComponent implements OnInit {

  dataZones: any = [];
  dataStations: any = [];
  dataFiltered: any = [];
  dataDepartments: any = [];
  dataMunicipals: any = [];
  selectedMunicipal: any = [];

  createForm: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    genero_id: [null, Validators.required],
    tipo_documento_id: [null, Validators.required],
    numero_documento: ['', Validators.required],
    telefono: [''],
    email: ['', [Validators.required, Validators.email, this.customValidator.patternValidator()]],
    password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
    zona: [[], Validators.required],
    puestos: [[]],
  });

  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService, private customValidator: CustomValidationService) { }

  ngOnInit() {
    this.getDepartmentAdmin();
  }

  getDepartmentAdmin() {
    this.apiService.getDepartmentAdmin().subscribe((resp: any) => {
      this.dataDepartments = resp;
    })
  }

  getSelectedDepartment(item: any) {
    this.selectedMunicipal = [];
    this.createFormControl['zona'].reset();
    this.createFormControl['puestos'].reset();
    if (item) {
      this.getMunicipalAdmin(item.codigo_unico);
    }
  }

  getSelectedMunicipal(item: any) {
    this.createFormControl['zona'].reset();
    this.createFormControl['puestos'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { municipio: codigo_unico }
      this.getZonasyGerentes(data);
    }
  }

  getSelectedZone(item: any) {
    this.createFormControl['puestos'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { zona: codigo_unico }
      this.getPuestosySupervisores(data);
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
        this.apiService.createCoordinador(this.createForm.value).subscribe((resp: any) => {

          this.alertService.successAlert(resp.message);

        })
      } else {
        this.alertService.errorAlert("Llene los campos obligatorios.");
      }

    }
  }

  getMunicipalAdmin(data: any) {
    this.apiService.getMunicipalAdmin().subscribe((resp: any) => {
      this.dataMunicipals = resp.filter((dataMunicipal: any) => dataMunicipal.codigo_departamento_votacion == data);
    })
  }

  getZonasyGerentes(data: any) {
    this.apiService.getZonasyGerentes(data).subscribe((resp: any) => {
      const { zonas } = resp;
      this.dataZones = zonas;
    })
  }

  getPuestosySupervisores(data: any) {
    this.apiService.getPuestosySupervisores(data).subscribe((resp: any) => {
      const { puestos } = resp;
      this.dataStations = puestos;
    })
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

}
