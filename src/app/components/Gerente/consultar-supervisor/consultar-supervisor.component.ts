import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-consultar-supervisor',
  templateUrl: './consultar-supervisor.component.html',
  styleUrls: ['./consultar-supervisor.component.scss']
})
export class ConsultarSupervisorComponent implements OnInit, OnDestroy {

  listSupervisorAsignados: any = [];
  listSupervisorNoAsignados: any = [];
  listZones: any = [];
  dtOptionsSupervisorAsignados: DataTables.Settings = {};
  dtOptionsSupervisorNoAsignados: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  supervisorActual: any={};
  zonasActual: any='';

  constructor(private apiService: ApiService, private router: Router, private localData: LocalDataService) { }

  ngOnInit(): void {
    this.dataTableOptions();
    this.getSupervisores();
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  getSupervisores() {
    this.apiService.getSupervisores().subscribe((resp: any) => {
      const { supervisores_asignados, supervisores_no_asignados } = resp;
      this.listSupervisorAsignados = supervisores_asignados;
      this.listSupervisorNoAsignados = supervisores_no_asignados;
      for (let supervisor of this.listSupervisorAsignados) {
        let zonas = this.getZones(supervisor.zonas);
        let lastZonas;
        if (zonas.length > 1) {
          lastZonas = zonas.shift();
          this.listZones.push(zonas.join(', ') + " y " + lastZonas);
        } else {
          this.listZones.push(zonas);
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

  redirectUpdateSupervisor(id: any) {
    const idEncrypt = this.localData.encryptIdUser(id);
    this.router.navigate(["editarSupervisor", idEncrypt]);
  }

  supervisorActualSeleccionado(supervisor: any, zonas?:any) {
    this.supervisorActual=supervisor;
    this.zonasActual=zonas;
  }

  dataTableOptions() {
    this.dtOptionsSupervisorAsignados = {
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
        url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json'
      }
    };
    this.dtOptionsSupervisorNoAsignados = {
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
        url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json'
      }
    };
  }

}
