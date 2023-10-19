import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { Router } from '@angular/router';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { Subject } from 'rxjs';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-consultar-testigo',
  templateUrl: './consultar-testigo.component.html',
  styleUrls: ['./consultar-testigo.component.scss'],
})
export class ConsultarTestigoComponent implements OnInit, OnDestroy {
  listTestigoAsignados: any = [];
  listTestigoNoAsignados: any = [];
  testigosMesas: { [key: number]: string[] } = {};
  dtOptionsTestigoAsignados: DataTables.Settings = {};
  dtOptionsTestigoNoAsignados: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  testigoActual: any = {};
  mesasActual: any = '';
  searchForm: UntypedFormGroup;
  dataStations: any = [];
  tabla: boolean = false;
  puestoSeleccionado = '';
  @ViewChild(DataTableDirective)
  dtElement!: any;
  notFirstTime = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private localData: LocalDataService,
    private fb: UntypedFormBuilder
  ) {
    this.searchForm = this.fb.group({
      puestos: [null],
    });
  }

  ngOnInit(): void {
    this.dataTableOptions();
    this.getPuestos();
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  getTestigos() {
    this.apiService.getTestigos().subscribe((resp: any) => {
      const { testigos_asignados, testigos_no_asignados } = resp;
      this.listTestigoAsignados = testigos_asignados.filter((testigo: any) => {
        // Filtrar el array mesas del testigo para que solo incluya las mesas con el código de puesto de votación deseado
        testigo.mesas = testigo.mesas.filter(
          (mesa: any) => mesa.codigo_puesto_votacion === this.puestoSeleccionado
        );
        // Solo incluir el testigo si tiene al menos una mesa con el código de puesto de votación deseado
        return testigo.mesas.length > 0;
      });
      this.listTestigoNoAsignados = testigos_no_asignados;
      this.renderer();
      this.notFirstTime = true;
    });
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

  redirectUpdateTestigo(id: any) {
    const idEncrypt = this.localData.encryptIdUser(id);
    this.router.navigate(['editarTestigo', idEncrypt]);
  }

  testigoActualSeleccionado(testigo: any, mesas?: any) {
    this.testigoActual = testigo;
    this.mesasActual = mesas;
  }

  dataTableOptions() {
    this.dtOptionsTestigoAsignados = {
      destroy: true,
      processing: true,
      pageLength: 20,
      responsive: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json',
      },
    };
    this.dtOptionsTestigoNoAsignados = {
      destroy: true,
      processing: true,
      pageLength: 20,
      responsive: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json',
      },
    };
  }

  getPuestos() {
    this.apiService.getStationsTestigo().subscribe((resp: any) => {
      this.dataStations = resp;
      if (this.dataStations.length > 0) {
        this.searchForm
          .get('puestos')
          ?.setValue(this.dataStations[0].codigo_unico);
        this.getSelectedStation(this.dataStations[0]);
      }
    });
  }

  getSelectedStation(item: any) {
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { puesto: codigo_unico };
      this.puestoSeleccionado = data.puesto;
      this.getTestigos();
      this.tabla = true;
    } else {
      this.tabla = false;
    }
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }
}
