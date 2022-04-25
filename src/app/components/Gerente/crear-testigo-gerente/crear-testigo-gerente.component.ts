import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ApiService } from '../../../services/api/api.service';
import { AlertService } from '../../../services/alert/alert.service';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';

@Component({
  selector: 'app-crear-testigo-gerente',
  templateUrl: './crear-testigo-gerente.component.html',
  styleUrls: ['./crear-testigo-gerente.component.scss']
})
export class CrearTestigoGerenteComponent implements OnInit {

  dataStations: any = [];
  dataTables: any = [];
  dataMunicipals: any = [];
  selectedZone: any = [];
  dataZones: any = [];

  createForm: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    genero_id: [null, Validators.required],
    tipo_documento_id: [null, Validators.required],
    numero_documento: ['', Validators.required],
    telefono: [''],
    email: ['', [Validators.required, Validators.email, this.customValidator.patternValidator()]],
    password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
    puesto: [[], Validators.required],
    mesas: [[]],
  });

  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService, private customValidator: CustomValidationService) { }

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
    console.log(this.createForm.value)
    if ((!this.createFormControl['email'].errors?.['email'] || !this.createFormControl['email'].errors?.['invalidEmail']) && !this.createFormControl['password'].errors?.['minlength']) {

      if (this.createForm.valid) {
        console.log(this.createForm.value)
        this.apiService.createTestigo(this.createForm.value).subscribe((resp: any) => {

          this.alertService.successAlert(resp.message);

        })
      } else {
        this.alertService.errorAlert("Llene los campos obligatorios.");
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
    }
  }

  getSelectedZone(item: any) {
    this.createFormControl['puesto'].reset();
    this.createFormControl['mesas'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { zona: codigo_unico }
      this.getPuestosySupervisores(data);
    }
  }

  getSelectedStation(item: any) {
    this.createFormControl['mesas'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { puesto: codigo_unico }
      this.getMesasyCoordinadores(data);
    }
  }

  getMunicipalAdmin() {
    this.apiService.getMunicipalGerente().subscribe(resp => {
      this.dataMunicipals = resp;
    });
  }

  getZonas(data: any) {
    this.apiService.getZoneGerente().subscribe((resp: any) => {
      this.dataZones = resp.filter((dataZone: any) => dataZone.codigo_municipio_votacion == data);
    });
  }

  getPuestosySupervisores(data: any) {
    this.apiService.getPuestosySupervisores(data).subscribe((resp: any) => {
      const { puestos } = resp;
      this.dataStations = puestos;

    })
  }

  getMesasyCoordinadores(data: any) {
    this.apiService.getMesasyCoordinadores(data).subscribe((resp: any) => {
      const { mesas } = resp;
      console.log(resp)
      this.dataTables = mesas;
    })
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

}
