import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ApiService } from '../../../services/api/api.service';
import { AlertService } from '../../../services/alert/alert.service';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';

@Component({
  selector: 'app-crear-testigo-supervisor',
  templateUrl: './crear-testigo-supervisor.component.html',
  styleUrls: ['./crear-testigo-supervisor.component.scss']
})
export class CrearTestigoSupervisorComponent implements OnInit {

  dataStations: any = [];
  dataTables: any = [];
  dataZones: any = [];

  createForm: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    genero_id: [null, Validators.required],
    tipo_documento_id: [null, Validators.required],
    numero_documento: ['', Validators.required],
    telefono: ['',Validators.required],
    email: ['', [Validators.required, Validators.email, this.customValidator.patternValidator()]],
    puesto: [[], Validators.required],
    mesas: [[]],
  });

  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService, private customValidator: CustomValidationService) { }

  ngOnInit() {
    this.getZonas();
  }

  get createFormControl() {
    return this.createForm.controls;
  }

  get keypressValidator() {
    return this.customValidator;
  }

  onSubmit() {
    console.log(this.createForm.value)
    if (!this.createFormControl['email'].errors?.['email'] || !this.createFormControl['email'].errors?.['invalidEmail']) {

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

  getSelectedZone(item: any) {
    this.createFormControl['puesto'].reset();
    this.createFormControl['mesas'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      this.getPuestos(codigo_unico);
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

  getZonas() {
    this.apiService.getZonesSupervisor().subscribe((resp: any) => {
      this.dataZones = resp;
    })
  }

  getPuestos(data: any) {
    this.apiService.getStationsCoordinador().subscribe((resp: any) => {
      this.dataStations = resp.filter((dataStation: any) => dataStation.codigo_zona_votacion == data);
    })
  }

  getMesasyCoordinadores(data: any) {
    this.apiService.getMesasyCoordinadores(data).subscribe((resp: any) => {
      const { mesas } = resp;
      this.dataTables = mesas;
    })
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

}
