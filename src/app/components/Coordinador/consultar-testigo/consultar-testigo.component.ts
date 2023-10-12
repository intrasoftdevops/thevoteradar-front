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

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective | undefined;

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
      console.log(resp)
      const { testigos_asignados, testigos_no_asignados } = resp;
      this.listTestigoAsignados = testigos_asignados;
      this.listTestigoNoAsignados = testigos_no_asignados;
      for (let testigo of this.listTestigoAsignados) {
        this.getTables(testigo);
      }
      setTimeout(() => {
        if (this.dtElement) {
          this.dtElement.dtInstance?.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy();
            this.dtTrigger.next(void 0); // Proporciona un valor (puede ser void 0 o cualquier otro valor)
          });
        }
      });
    });
  }

  getTables(testigo: any) {
    const testigoId = testigo.id
    this.apiService.getTestigo(testigoId).subscribe((resp: any) => {
      console.log(resp )
      if (resp.puestos_asignados.codigo_unico == this.puestoSeleccionado) {
        const mesas_asignadas = resp.mesas_asignadas.map(
          (mesa: any) => mesa.numero_mesa
        );
       
        this.testigosMesas[testigoId] = mesas_asignadas;
      }
      else{
        const newTestigos = this.listTestigoAsignados.filter((item: any) => item !== testigo);
        this.listTestigoAsignados = newTestigos
      }
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
      processing: true,
      pageLength: 10,
      columns: [
        {
          orderable: true,
        },
        {
          orderable: true,
          className: 'd-none d-lg-table-cell',
        },
        {
          orderable: true,
          className: 'd-none d-lg-table-cell',
        },
        {
          orderable: true,
        },
        {
          orderable: false,
        },
      ],
      responsive: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json',
      },
    };
    this.dtOptionsTestigoNoAsignados = {
      processing: true,
      pageLength: 10,
      columns: [
        {
          orderable: true,
        },
        {
          orderable: true,
          className: 'd-none d-lg-table-cell',
        },
        {
          orderable: true,
          className: 'd-none d-lg-table-cell',
        },
        {
          orderable: false,
        },
      ],
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
      this.puestoSeleccionado = data.puesto
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
