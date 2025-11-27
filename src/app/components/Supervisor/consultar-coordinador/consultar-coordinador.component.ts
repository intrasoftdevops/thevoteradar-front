import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { Router } from '@angular/router';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-consultar-coordinador',
  templateUrl: './consultar-coordinador.component.html',
  styleUrls: ['./consultar-coordinador.component.scss']
})
export class ConsultarCoordinadorComponent implements OnInit,OnDestroy {

  listCoordinadorAsignados: any = [];
  listCoordinadorNoAsignados: any = [];
  listStations: any = [];
  dtOptionsCoordinadorAsignados: DataTables.Settings = {};
  dtOptionsCoordinadorNoAsignados: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  coordinadorActual: any={};
  puestosActual: any='';

  constructor(private apiService: ApiService,private router: Router,private localData: LocalDataService) { }

  ngOnInit() {
    this.dataTableOptions();
    this.getCoordinadores();
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  getCoordinadores() {
    this.apiService.getCoordinadores().subscribe((resp: any) => {
      const { coordinadores_asignados, coordinadores_no_asignados } = resp;
      this.listCoordinadorAsignados = coordinadores_asignados;
      this.listCoordinadorNoAsignados = coordinadores_no_asignados;
      for (let coordinador of this.listCoordinadorAsignados) {
        let puestos = this.getZones(coordinador.puestos);
        let lastPuestos;
        if (puestos.length > 1) {
          lastPuestos = puestos.shift();
          this.listStations.push(puestos.join(', ') + " y " + lastPuestos);
        } else {
          this.listStations.push(puestos);
        }
      }
      setTimeout(() => {
        this.dtTrigger.next(void 0);
      });
    })
  }

  getZones(data: any) {
    return data.map((zone: any) => {
      const { nombre } = zone;
      return nombre;
    });
  }

  redirectUpdateCoordinador(id: any) {
    const idEncrypt = this.localData.encryptIdUser(id);
    this.router.navigate(["editarCoordinador",idEncrypt]);
  }

  coordinadorActualSeleccionado(coordinador: any, puestos?:any) {
    this.coordinadorActual=coordinador;
    this.puestosActual=puestos;
  }

  dataTableOptions() {
    this.dtOptionsCoordinadorAsignados = {
      processing: true,
      pageLength: 10,
      columns: [{
        orderable: true,
      }, {
        orderable: true,
        className: 'd-none d-md-table-cell',
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
        url: 'https://cdn.datatables.net/plug-ins/1.11.3/i18n/es_ES.json'
      }
    };
    this.dtOptionsCoordinadorNoAsignados = {
      processing: true,
      pageLength: 10,
      columns: [{
        orderable: true,
      }, {
        orderable: true,
        className: 'd-none d-md-table-cell'
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
        url: 'https://cdn.datatables.net/plug-ins/1.11.3/i18n/es_ES.json'
      }
    };
  }

}
