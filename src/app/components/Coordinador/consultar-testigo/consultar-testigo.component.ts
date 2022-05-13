import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { Router } from '@angular/router';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-consultar-testigo',
  templateUrl: './consultar-testigo.component.html',
  styleUrls: ['./consultar-testigo.component.scss']
})
export class ConsultarTestigoComponent implements OnInit, OnDestroy{

  listTestigoAsignados: any = [];
  listTestigoNoAsignados: any = [];
  listTables: any = [];
  dtOptionsTestigoAsignados: DataTables.Settings = {};
  dtOptionsTestigoNoAsignados: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  testigoActual: any={};
  mesasActual: any='';

  constructor(private apiService: ApiService,private router: Router,private localData: LocalDataService) { }

  ngOnInit(): void {
    this.dataTableOptions();
    this.getTestigos();
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
        let mesas = this.getTables(testigo.mesas);
        let lastMesas;
        if (mesas.length > 1) {
          lastMesas = mesas.shift();
          this.listTables.push(mesas.join(', ') + " y " + lastMesas);
        } else {
          this.listTables.push(mesas);
        }
      }
      setTimeout(() => {
        this.dtTrigger.next(void 0);
      });
    })
  }

  getTables(data: any) {
    return data.map((table: any) => {
      const { numero_mesa } = table;
      return numero_mesa;
    });
  }

  redirectUpdateTestigo(id: any) {
    const idEncrypt = this.localData.encryptIdUser(id);
    this.router.navigate(["editarTestigo",idEncrypt]);
  }

  testigoActualSeleccionado(testigo: any, mesas?:any) {
    this.testigoActual=testigo;
    this.mesasActual=mesas;
  }

  dataTableOptions() {
    this.dtOptionsTestigoAsignados = {
      processing: true,
      pageLength: 10,
      columns: [{
        orderable: true,
      }, {
        orderable: true,
        className: 'd-none d-lg-table-cell',
      }, {
        orderable: true,
        className: 'd-none d-lg-table-cell'
      },
      {
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
    this.dtOptionsTestigoNoAsignados = {
      processing: true,
      pageLength: 10,
      columns: [{
        orderable: true,
      }, {
        orderable: true,
        className: 'd-none d-lg-table-cell'
      },
      {
        orderable: true,
        className: 'd-none d-lg-table-cell'
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
