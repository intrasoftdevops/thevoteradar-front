import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-reporte-votos-coordinador',
  templateUrl: './reporte-votos-coordinador.component.html',
  styleUrls: ['./reporte-votos-coordinador.component.scss']
})
export class ReporteVotosCoordinadorComponent implements OnInit, OnDestroy {

  tabla: boolean = false;
  dataStations: any = [];
  listMesas: any = [];
  reporte: any = {};
  listReportes: any = [];
  photos: any = [];
  totalVotosMesas: number = 0;
  searchForm: UntypedFormGroup = this.fb.group({
    puestos: [null],
  });
  dtOptionsVotosReportados: DataTables.Settings = {};
  dtOptionsVotosNoReportados: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective) dtElement!: DataTableDirective;
  notFirstTime = false;

  constructor(private apiService: ApiService, private fb: UntypedFormBuilder, private chRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.dataTableOptions();
    this.getStationsTestigo();
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  ModalReporteActual(mesa: any) {
    this.photos = [];
    this.listReportes = [];
    this.reporte = mesa;
    this.listReportes = this.reporte.reporte.reportes;
    this.photos = mesa.reporte.archivos;
    this.totalVotosMesas = this.listReportes.reduce((acc: any, obj: any,) => acc + (obj.numero_votos), 0);
  }

  getVotosCoordinador(data: any) {
    this.apiService.getVotosCoordinador(data).subscribe((resp: any) => {
      const { puesto } = resp;
      const { mesas_reportadas } = puesto;
      this.listMesas = mesas_reportadas;
      this.renderer();
      this.notFirstTime = true;
    })
  }

  getStationsTestigo() {
    this.apiService.getStationsTestigo().subscribe((resp: any) => {
      this.dataStations = resp;
      if (this.dataStations.length > 0) {
        this.searchForm.get('puestos')?.setValue(this.dataStations[0].codigo_unico);
        this.getSelectedValue(this.dataStations[0]);
      }
    })
  }

  getSelectedValue(item: any) {
    if (item) {
      this.tabla = true;
      const data = { puesto: item.codigo_unico }
      this.getVotosCoordinador(data);
    } else {
      this.tabla = false;
      this.listMesas = [];
      this.renderer();
    }
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
        url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json'
      }
    };
  }

  renderer() {
    if (this.notFirstTime) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.draw();
        dtInstance.destroy();
      });
    }
    setTimeout(() => {
      this.dtTrigger.next(void 0);
    });
  }

}
