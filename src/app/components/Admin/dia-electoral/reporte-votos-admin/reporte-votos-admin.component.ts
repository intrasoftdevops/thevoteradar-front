import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../../services/api/api.service';
import { BackofficeAdminService } from '../../../../services/backoffice-admin/backoffice-admin.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { Lightbox } from 'ngx-lightbox';

@Component({
  selector: 'app-reporte-votos-admin',
  templateUrl: './reporte-votos-admin.component.html',
  styleUrls: ['./reporte-votos-admin.component.scss']
})
export class ReporteVotosAdminComponent implements OnInit, OnDestroy {

  tabla: boolean = false;
  dataDepartments: any = [];
  dataMunicipals: any = [];
  dataZones: any = [];
  dataStations: any = [];
  listMesas: any = [];
  reporte: any = {};
  listReportes: any = [];
  photos: any = [];
  totalVotosMesas: number = 0;
  loadingDepartamentos: boolean = false;
  loadingMunicipios: boolean = false;
  loadingZonas: boolean = false;
  loadingPuestos: boolean = false;
  loadingReportes: boolean = false;
  searchForm: FormGroup = this.fb.group({
    departamentos: [null],
    municipios: [null],
    zonas: [null],
    puestos: [null],
  });
  dtOptionsVotosReportados: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective) dtElement!: DataTableDirective;
  notFirstTime = false;

  constructor(
    private apiService: ApiService,
    private backofficeAdminService: BackofficeAdminService,
    private fb: FormBuilder,
    private chRef: ChangeDetectorRef,
    private lightbox: Lightbox
  ) { }

  ngOnInit() {
    this.dataTableOptions();
    this.getDepartmentAdmin();
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  get searchFormControl() {
    return this.searchForm.controls;
  }

  ModalReporteActual(mesa: any) {
    this.photos = [];
    this.listReportes = [];
    this.reporte = mesa;
    this.listReportes = this.reporte.reporte?.reportes || [];
    this.photos = mesa.reporte?.archivos || [];
    console.log('ModalReporteActual - Photos asignadas:', this.photos);
    console.log('ModalReporteActual - Cantidad de fotos:', this.photos.length);
    this.totalVotosMesas = this.listReportes.reduce((acc: any, obj: any,) => acc + (obj.numero_votos || 0), 0);
  }

  getVotosPuesto(data: any) {
    this.loadingReportes = true;
    this.apiService.getReportesPuesto(data).subscribe({
      next: (resp: any) => {
        const { mesas_reportadas } = resp;
        this.listMesas = mesas_reportadas || [];
        this.loadingReportes = false;
        this.renderer();
        this.notFirstTime = true;
      },
      error: (error: any) => {
        console.error('Error al cargar reportes:', error);
        this.listMesas = [];
        this.loadingReportes = false;
        this.clearTable();
      }
    });
  }

  getDepartmentAdmin() {
    this.loadingDepartamentos = true;
    this.backofficeAdminService.getDepartamentosAdmin().subscribe({
      next: (resp: any) => {
        this.dataDepartments = resp.departamentos || resp || [];
        this.loadingDepartamentos = false;
        if (this.dataDepartments.length > 0) {
          this.searchForm
            .get('departamentos')
            ?.setValue(this.dataDepartments[0].codigo_unico);
          this.getSelectedDepartment(this.dataDepartments[0]);
        }
      },
      error: (error: any) => {
        console.error('Error al cargar departamentos:', error);
        this.dataDepartments = [];
        this.loadingDepartamentos = false;
      }
    });
  }

  getSelectedDepartment(item: any) {
    this.searchFormControl['municipios'].reset();
    this.searchFormControl['zonas'].reset();
    this.searchFormControl['puestos'].reset();
    if (item) {
      const codigoDepartamento = typeof item === 'string' ? item : (item.codigo_unico || item);
      this.getMunicipalAdmin(codigoDepartamento);
      this.tabla = false;
      this.listMesas = [];
      this.clearTable();
    } else {
      this.dataMunicipals = [];
      this.dataZones = [];
      this.dataStations = [];
      this.tabla = false;
      this.listMesas = [];
      this.clearTable();
    }
  }

  getSelectedMunicipal(item: any) {
    this.searchFormControl['zonas'].reset();
    this.searchFormControl['puestos'].reset();
    if (item) {
      const codigo = typeof item === 'string' ? item : (item?.codigo_unico || item);
      this.getZonas(codigo);
      this.tabla = false;
      this.listMesas = [];
      this.clearTable();
    } else {
      this.dataZones = [];
      this.dataStations = [];
      this.tabla = false;
      this.listMesas = [];
      this.clearTable();
    }
  }

  getSelectedZone(item: any) {
    this.searchFormControl['puestos'].reset();
    if (item) {
      const codigo = typeof item === 'string' ? item : (item?.codigo_unico || item);
      this.getPuestos(codigo);
      this.tabla = false;
      this.listMesas = [];
      this.clearTable();
    } else {
      this.dataStations = [];
      this.tabla = false;
      this.listMesas = [];
      this.clearTable();
    }
  }

  getSelectedStation(item: any) {
    if (item) {
      this.tabla = true;
      const codigo = typeof item === 'string' ? item : (item?.codigo_unico || item);
      const data = { puesto: codigo };
      this.getVotosPuesto(data);
    } else {
      this.tabla = false;
      this.listMesas = [];
      this.clearTable();
    }
  }

  getMunicipalAdmin(codigoDepartamento: string) {
    this.loadingMunicipios = true;
    this.dataMunicipals = [];
    this.backofficeAdminService.getMunicipiosAdmin(codigoDepartamento).subscribe({
      next: (resp: any) => {
        this.dataMunicipals = resp.municipios || resp || [];
        this.loadingMunicipios = false;
      },
      error: (error: any) => {
        console.error('Error al cargar municipios:', error);
        this.dataMunicipals = [];
        this.loadingMunicipios = false;
      }
    });
  }

  getZonas(codigoMunicipio: string) {
    this.loadingZonas = true;
    this.dataZones = [];
    this.backofficeAdminService.getZonasPorMunicipio(codigoMunicipio).subscribe({
      next: (resp: any) => {
        this.dataZones = resp.zonas || resp || [];
        this.loadingZonas = false;
      },
      error: (error: any) => {
        console.error('Error al cargar zonas:', error);
        this.dataZones = [];
        this.loadingZonas = false;
      }
    });
  }

  getPuestos(codigoZona: string) {
    this.loadingPuestos = true;
    this.dataStations = [];
    this.backofficeAdminService.getPuestosPorZona(codigoZona).subscribe({
      next: (resp: any) => {
        this.dataStations = resp.puestos || resp || [];
        this.loadingPuestos = false;
      },
      error: (error: any) => {
        console.error('Error al cargar puestos:', error);
        this.dataStations = [];
        this.loadingPuestos = false;
      }
    });
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

  dataTableOptions() {
    this.dtOptionsVotosReportados = {
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
        url: 'https://cdn.datatables.net/plug-ins/1.11.3/i18n/es_ES.json'
      }
    };
  }

  openLightbox(index: number): void {
    try {
      if (!this.photos || this.photos.length === 0) {
        return;
      }
      // Filtrar fotos válidas y crear album
      const validPhotos = this.photos.filter((photo: any) => photo && photo.url_archivo);
      if (validPhotos.length === 0) {
        return;
      }
      
      // Crear album solo con fotos válidas
      const album = validPhotos.map((photo: any) => ({
        src: photo.url_archivo,
        thumb: photo.url_archivo
      }));
      
      // Asegurar que el índice esté dentro del rango del album filtrado
      if (index >= 0 && index < album.length) {
        this.lightbox.open(album, index);
      }
    } catch (error) {
      console.error('Error al abrir lightbox:', error);
    }
  }

  clearTable() {
    if (this.notFirstTime && this.dtElement?.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        if (dtInstance) {
          dtInstance.destroy();
        }
      }).catch(() => {
        // Ignorar errores si la tabla ya fue destruida
      });
    }
  }

  renderer() {
    if (this.notFirstTime) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.draw();
        dtInstance.destroy();
        this.dtTrigger.next(void 0);
      }).catch(() => {
        // Si falla, simplemente disparar el trigger
        this.dtTrigger.next(void 0);
      });
    } else {
      setTimeout(() => {
        this.dtTrigger.next(void 0);
      });
    }
  }

}