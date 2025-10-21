import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import { ApiService } from '../../../services/api/api.service';
import { AlertService } from '../../../services/alert/alert.service';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';

@Component({
  selector: 'app-crear-coordinador-admin',
  templateUrl: './crear-coordinador-admin.component.html',
  styleUrls: ['./crear-coordinador-admin.component.scss'],
})
export class CrearCoordinadorAdminComponent implements OnInit {
  dataZones: any = [];
  dataStations: any = [];
  dataFiltered: any = [];
  dataDepartments: any = [];
  dataMunicipals: any = [];
  selectedMunicipal: any = [];

  createForm: UntypedFormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    genero_id: [null, Validators.required],
    tipo_documento_id: [null, Validators.required],
    numero_documento: ['', Validators.required],
    telefono: ['', Validators.required],
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        this.customValidator.patternValidator(),
      ],
    ],
    zona: [[], Validators.required],
    puestos: [[]],
  });

  constructor(
    private apiService: ApiService,
    private fb: UntypedFormBuilder,
    private alertService: AlertService,
    private customValidator: CustomValidationService
  ) {}

  ngOnInit() {
    this.getDepartmentAdmin();
  }

  getDepartmentAdmin() {
    this.apiService.getDepartmentAdmin().subscribe((resp: any) => {
      this.dataDepartments = resp;
    });
  }

  getSelectedDepartment(item: any) {
    this.selectedMunicipal = [];
    this.createFormControl['zona'].reset();
    this.createFormControl['puestos'].reset();
    if (item) {
      this.getMunicipalAdmin(item.codigo_unico);
    } else {
      this.dataMunicipals = [];
      this.dataZones = [];
      this.dataStations = [];
    }
  }

  getSelectedMunicipal(item: any) {
    this.createFormControl['zona'].reset();
    this.createFormControl['puestos'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { municipio: codigo_unico };
      this.getZonasyGerentes(data);
    } else {
      this.dataZones = [];
      this.dataStations = [];
    }
  }

  getSelectedZone(item: any) {
    this.createFormControl['puestos'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { zona: codigo_unico };
      this.getPuestosySupervisores(data);
    } else {
      this.dataStations = [];
    }
  }

  get createFormControl() {
    return this.createForm.controls;
  }

  get keypressValidator() {
    return this.customValidator;
  }

  onSubmit() {
    if (
      !this.createFormControl['email'].errors?.['email'] ||
      !this.createFormControl['email'].errors?.['invalidEmail']
    ) {
      if (this.createForm.valid) {
        this.apiService
          .createCoordinador(this.createForm.value)
          .subscribe((resp: any) => {
            this.alertService.successAlert(resp.message);
          });
      } else {
        this.alertService.errorAlert('Llene los campos obligatorios.');
      }
    }
  }

  getMunicipalAdmin(data: any) {
    this.apiService.getMunicipalAdmin().subscribe((resp: any) => {
      this.dataMunicipals = resp.filter(
        (dataMunicipal: any) =>
          dataMunicipal.codigo_departamento_votacion == data
      );
    });
  }

  getZonasyGerentes(data: any) {
    this.apiService.getZonasyGerentes(data).subscribe((resp: any) => {
      const { zonas } = resp;
      this.dataZones = zonas;
    });
  }

  getPuestosySupervisores(data: any) {
    this.apiService.getPuestosySupervisores(data).subscribe((resp: any) => {
      const { puestos } = resp;
      this.dataStations = puestos;
    });
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }
}
