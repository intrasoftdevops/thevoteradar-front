import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import { ApiService } from '../../../services/api/api.service';
import { AlertService } from '../../../services/alert/alert.service';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';

@Component({
  selector: 'app-crear-testigo-gerente',
  templateUrl: './crear-testigo-gerente.component.html',
  styleUrls: ['./crear-testigo-gerente.component.scss'],
})
export class CrearTestigoGerenteComponent implements OnInit {
  dataStations: any = [];
  dataTables: any = [];
  dataMunicipals: any = [];
  selectedZone: any = [];
  dataZones: any = [];

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
    puesto: [[], Validators.required],
    mesas: [[]],
  });

  constructor(
    private apiService: ApiService,
    private fb: UntypedFormBuilder,
    private alertService: AlertService,
    private customValidator: CustomValidationService
  ) {}

  ngOnInit() {
    this.getMunicipalAdmin();
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
          .createTestigo(this.createForm.value)
          .subscribe((resp: any) => {
            this.alertService.successAlert(resp.message);
          });
      } else {
        this.alertService.errorAlert('Llene los campos obligatorios.');
      }
    }
  }

  getSelectedMunicipal(item: any) {
    this.selectedZone = [];
    this.createFormControl['puesto'].reset();
    this.createFormControl['mesas'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      this.getZonas(codigo_unico);
    } else {
      this.dataZones = [];
      this.dataStations = [];
      this.dataTables = [];
    }
  }

  getSelectedZone(item: any) {
    this.createFormControl['puesto'].reset();
    this.createFormControl['mesas'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { zona: codigo_unico };
      this.getPuestosySupervisores(data);
    } else {
      this.dataStations = [];
      this.dataTables = [];
    }
  }

  getSelectedStation(item: any) {
    this.createFormControl['mesas'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { puesto: codigo_unico };
      this.getTablesTestigo(data);
    } else {
      this.dataTables = [];
    }
  }

  getMunicipalAdmin() {
    this.apiService.getMunicipalGerente().subscribe((resp) => {
      this.dataMunicipals = resp;
    });
  }

  getZonas(data: any) {
    this.apiService.getZoneGerente().subscribe((resp: any) => {
      this.dataZones = resp.filter(
        (dataZone: any) => dataZone.codigo_municipio_votacion == data
      );
    });
  }

  getPuestosySupervisores(data: any) {
    this.apiService.getPuestosySupervisores(data).subscribe((resp: any) => {
      const { puestos } = resp;
      this.dataStations = puestos;
    });
  }

  getTablesTestigo(data: any) {
    this.apiService.getMesasSinAsignar(data).subscribe((resp: any) => {
      this.dataTables = resp;
    });
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }
}
