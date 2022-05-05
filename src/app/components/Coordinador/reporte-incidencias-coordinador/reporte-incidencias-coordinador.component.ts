import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AlertService } from '../../../services/alert/alert.service';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';

@Component({
  selector: 'app-reporte-incidencias-coordinador',
  templateUrl: './reporte-incidencias-coordinador.component.html',
  styleUrls: ['./reporte-incidencias-coordinador.component.scss']
})
export class ReporteIncidenciasCoordinadorComponent implements OnInit {

  dataIncidenciasAbiertas: any = [];
  dataIncidenciasCerradas: any = [];
  incidenciaAbiertaActual: any = {};
  incidenciaCerradaActual: any = {};
  photosOpen: any = [];
  photosClose: any = [];
  replyForm: FormGroup = this.fb.group({
    respuesta: ['', Validators.required],
  });

  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService, private customValidator: CustomValidationService) { }

  ngOnInit() {
    this.getIncidenciasDeCoordinador();
  }

  get replyFormControl() {
    return this.replyForm.controls;
  }

  onSubmit() {
    console.log(this.replyForm.value)
    if (this.replyForm.valid) {
      console.log(this.replyForm.value)
      this.apiService.replyIncidencia(this.incidenciaAbiertaActual.id, this.replyForm.value).subscribe((resp: any) => {

        this.alertService.successAlert(resp.message);

      })
    } else {
      this.alertService.errorAlert("Llene los campos obligatorios.");
    }
  }

  openIncidencia() {
    let data = { estado: 0 };
    this.apiService.openIncidencias(this.incidenciaCerradaActual.id, data).subscribe((resp: any) => {
      this.alertService.successAlert(resp.message);
      this.getIncidenciasDeCoordinador();
    })
  }

  getIncidenciasDeCoordinador() {
    this.apiService.getIncidenciasDeCoordinador().subscribe((resp: any) => {
      console.log(resp)
      this.dataIncidenciasAbiertas = resp.filter((incidencia: any) => {
        return incidencia.estado === 0;
      }
      );
      this.dataIncidenciasCerradas = resp.filter((incidencia: any) => {
        return incidencia.estado === 1;
      }
      );
    })
  }

  ModalIncidenciaAbiertaActual(incidencia: any) {
    this.photosOpen = [];
    this.incidenciaAbiertaActual = {};
    this.incidenciaAbiertaActual = incidencia;
    this.photosOpen = incidencia.archivos;
  }

  ModalIncidenciaCerradaActual(incidencia: any) {
    this.photosClose = [];
    this.incidenciaCerradaActual = {};
    this.incidenciaCerradaActual = incidencia;
    this.photosClose = incidencia.archivos;
  }

}
