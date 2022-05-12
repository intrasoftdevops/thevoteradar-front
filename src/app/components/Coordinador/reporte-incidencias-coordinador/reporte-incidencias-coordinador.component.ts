import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AlertService } from '../../../services/alert/alert.service';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-reporte-incidencias-coordinador',
  templateUrl: './reporte-incidencias-coordinador.component.html',
  styleUrls: ['./reporte-incidencias-coordinador.component.scss']
})
export class ReporteIncidenciasCoordinadorComponent implements OnInit,OnDestroy {

  dataIncidenciasAbiertas: any = [];
  dataIncidenciasCerradas: any = [];
  incidenciaAbiertaActual: any = {};
  incidenciaCerradaActual: any = {};
  photosOpen: any = [];
  photosClose: any = [];
  replyForm: FormGroup = this.fb.group({
    respuesta: ['', Validators.required],
  });
  dtOptionsIncidenciasAbiertas: DataTables.Settings = {};
  dtOptionsIncidenciasCerradas: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService, private customValidator: CustomValidationService) { }

  ngOnInit() {
    this.dataTableOptions();
    this.getIncidenciasDeCoordinador();
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
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
      setTimeout(() => {
        this.dtTrigger.next(void 0);
      });
    })
  }

  ModalIncidenciaAbiertaActual(incidencia: any) {
    this.photosOpen = [];
    this.incidenciaAbiertaActual = {};
    this.incidenciaAbiertaActual = incidencia;
    this.photosOpen = incidencia.archivos;
    console.log(this.photosOpen.url_archivo)
  }

  ModalIncidenciaCerradaActual(incidencia: any) {
    this.photosClose = [];
    this.incidenciaCerradaActual = {};
    this.incidenciaCerradaActual = incidencia;
    this.photosClose = incidencia.archivos;
  }

  dataTableOptions() {
    this.dtOptionsIncidenciasAbiertas = {
      processing: true,
      pageLength: 10,
      columns: [{
        orderable: true,
      }, {
        orderable: true,
      }, {
        orderable: true,
        className: 'd-none d-md-table-cell'
      },
      {
        orderable: false,
      }
      ],
      responsive: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json'
      }
    };
    this.dtOptionsIncidenciasCerradas = {
      processing: true,
      pageLength: 10,
      columns: [{
        orderable: true,
      }, {
        orderable: true,
      },
      {
        orderable: true,
        className: 'd-none d-md-table-cell'
      },
      {
        orderable: false,
      }
      ],
      responsive: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json'
      }
    };
  }

}
