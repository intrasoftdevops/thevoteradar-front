import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { Router } from '@angular/router';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-consultar-gerente',
  templateUrl: './consultar-gerente.component.html',
  styleUrls: ['./consultar-gerente.component.scss']
})
export class ConsultarGerenteComponent implements OnDestroy, OnInit {

  listGerenteAsignados: any = [];
  listGerenteNoAsignados: any = [];
  listMunicipals: any = [];
  dtOptionsGerenteAsignados: DataTables.Settings = {};
  dtOptionsGerenteNoAsignados: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  constructor(private apiService: ApiService, private router: Router, private localData: LocalDataService) { }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  ngOnInit() {
    this.dtOptionsGerenteAsignados = {
      pageLength: 10,
      columns: [{
        orderable: true,
      }, {
        orderable: true,
        className: 'd-none d-md-block'
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
    this.dtOptionsGerenteNoAsignados = {
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
    this.getGerentes();
  }

  getGerentes() {
    this.apiService.getAssignedMunicipal().subscribe((resp: any) => {
      const { gerentes_asignados, gerentes_no_asignados } = resp;
      this.listGerenteAsignados = gerentes_asignados;
      this.listGerenteNoAsignados = gerentes_no_asignados;
      for (let gerente of this.listGerenteAsignados) {
        let municipios = this.getMunicipals(gerente.municipios);
        let lastMunicipio;
        if (municipios.length > 1) {
          lastMunicipio = municipios.shift();
          this.listMunicipals.push(municipios.join(', ') + " y " + lastMunicipio);
        } else {
          this.listMunicipals.push(municipios);
        }
      }
      setTimeout(() => {
        this.dtTrigger.next(void 0);
      });
      console.log(this.listGerenteAsignados)
    });
  }

  getMunicipals(data: any) {
    return data.map((municipal: any) => {
      const { nombre } = municipal;
      return nombre;
    });
  }

  redirectUpdateGerente(id: any) {
    const idEncrypt = this.localData.encryptIdUser(id);
    this.router.navigate(["editarGerente", idEncrypt]);
  }

}
