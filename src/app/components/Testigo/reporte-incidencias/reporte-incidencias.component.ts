import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AlertService } from '../../../services/alert/alert.service';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-reporte-incidencias',
  templateUrl: './reporte-incidencias.component.html',
  styleUrls: ['./reporte-incidencias.component.scss']
})
export class ReporteIncidenciasComponent implements OnInit,OnDestroy {

  photos: any = [];
  files: File[] = [];
  categoryIncidencias: any = [];
  mesas_asignadas: any = [];
  dataIncidencias: any = [];
  createForm: FormGroup = this.fb.group({
    categoria_id: [null, Validators.required],
    descripcion: ['', Validators.required],
    codigo_mesa: [null, Validators.required],
  });
  incidenciaActual: any = {};
  dtOptionsIncidencias: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService, private localData: LocalDataService) { }

  ngOnInit(): void {
    this.dataTableOptions();
    this.getIncidenciasDeTestigo();
    this.getMesasTetigo();
    this.getCategoriasIncidencias();
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  get createFormControl() {
    return this.createForm.controls;
  }

  onSubmit() {

    if (this.createForm.valid && this.files.length > 0) {

      const uploadData = new FormData();
      uploadData.append('categoria_id', this.createForm.get('categoria_id')!.value);
      uploadData.append('descripcion', this.createForm.get('descripcion')!.value);
      for (let file in this.files) {
        uploadData.append("url_archivo[]", this.files[file]);
      }
      uploadData.append('codigo_mesa', this.createForm.get('codigo_mesa')!.value);

      this.apiService.createIncidencias(uploadData).subscribe((resp: any) => {

        this.createForm.reset();
        this.files = [];
        this.alertService.successAlert(resp.message);

      })
    } else {
      this.alertService.errorAlert("Llene los campos obligatorios.");
    }
  }

  ModalIncidenciaActual(incidencia: any) {
    this.photos = [];
    this.incidenciaActual = {};
    this.incidenciaActual = incidencia;
    this.photos = incidencia.archivos;
  }

  getCategoriasIncidencias() {
    this.apiService.getCategoriasIncidencias().subscribe((res: any) => {
      this.categoryIncidencias = res;
    })
  }

  getMesasTetigo() {
    this.apiService.getTestigo(this.localData.getId()).subscribe((resp: any) => {
      const { mesas_asignadas } = resp;
      this.mesas_asignadas = mesas_asignadas;
    })
  }

  getIncidenciasDeTestigo() {
    this.apiService.getIncidenciasDeTestigo().subscribe((resp: any) => {
      this.dataIncidencias = resp;
      setTimeout(() => {
        this.dtTrigger.next(void 0);
      });
    })
  }

  onSelect(event: any) {
    this.files.push(...event.addedFiles);
  }

  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  dataTableOptions() {
    this.dtOptionsIncidencias = {
      processing: true,
      pageLength: 10,
      columns: [{
        orderable: true,
      }, {
        orderable: true,
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
