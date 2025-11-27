import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AlertService } from '../../../services/alert/alert.service';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { Subject } from 'rxjs';
import { Lightbox } from 'ngx-lightbox';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-reporte-incidencias',
  templateUrl: './reporte-incidencias.component.html',
  styleUrls: ['./reporte-incidencias.component.scss']
})
export class ReporteIncidenciasComponent implements OnInit, OnDestroy {

  photos: any = [];
  videos: any = [];
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
  isDevelopmentMode: boolean = environment.development;

  constructor(private apiService: ApiService, private fb: FormBuilder, private alertService: AlertService, private localData: LocalDataService, private lightbox: Lightbox) { }

  ngOnInit(): void {
    this.dataTableOptions();
    if (this.isDevelopmentMode) {
      this.loadDevData();
    } else {
      this.getIncidenciasDeTestigo();
      this.getMesasTetigo();
      this.getCategoriasIncidencias();
    }
  }

  loadDevData() {
    
    this.categoryIncidencias = [
      { id: 1, nombre: 'Problemas de conectividad' },
      { id: 2, nombre: 'Fallas en equipos' },
      { id: 3, nombre: 'Problemas de acceso' },
      { id: 4, nombre: 'Otros' }
    ];

    this.mesas_asignadas = [
      { codigo_mesa: 'M001', nombre: 'Mesa 1 - Centro' },
      { codigo_mesa: 'M002', nombre: 'Mesa 2 - Norte' },
      { codigo_mesa: 'M003', nombre: 'Mesa 3 - Sur' }
    ];

    this.dataIncidencias = [
      {
        id: 1,
        categoria: 'Problemas de conectividad',
        descripcion: 'No hay internet en la mesa',
        codigo_mesa: 'M001',
        fecha: '2024-01-15',
        estado: 'Pendiente'
      },
      {
        id: 2,
        categoria: 'Fallas en equipos',
        descripcion: 'La computadora no enciende',
        codigo_mesa: 'M002',
        fecha: '2024-01-14',
        estado: 'Resuelto'
      }
    ];

    this.dtTrigger.next(null);
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  get createFormControl() {
    return this.createForm.controls;
  }

  onSubmit() {

    if (this.createForm.valid) {

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
    console.log(incidencia);
    this.photos = [];
    this.videos = [];
    this.incidenciaActual = {};
    this.incidenciaActual = incidencia;
    this.photos = incidencia.archivos_imagenes;
    this.videos = incidencia.archivos_videos;
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
      console.log(this.dataIncidencias);
      setTimeout(() => {
        this.dtTrigger.next(void 0);
      });
    })
  }

  onSelect(event: any) {
    this.files.push(...event.addedFiles);
  }

  onRemove(event: any) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  openLightbox(index: number): void {
    const album = this.photos.map((photo: any) => ({
      src: photo.url_archivo,
      thumb: photo.url_archivo
    }));
    this.lightbox.open(album, index);
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
        url: 'https://cdn.datatables.net/plug-ins/1.11.3/i18n/es_ES.json'
      }
    };
  }

}
