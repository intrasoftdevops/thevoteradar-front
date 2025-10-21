import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { Router } from '@angular/router';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-consultar-gerente',
  templateUrl: './consultar-gerente.component.html',
  styleUrls: ['./consultar-gerente.component.scss'],
})
export class ConsultarGerenteComponent implements OnDestroy, OnInit {

  listGerenteAsignados: any = [];
  listGerenteNoAsignados: any = [];
  listMunicipals: any = [];
  gerenteActual: any={};
  municipiosActual: any='';
  dtOptionsGerenteAsignados: DataTables.Settings = {};
  dtOptionsGerenteNoAsignados: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective)
  dtElement!: any;
  notFirstTime = false;

  constructor(private apiService: ApiService, private router: Router, private localData: LocalDataService,private fb: FormBuilder) { }

  ngOnInit() {
    this.dataTableOptions();
    this.getGerentes();
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
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
          this.listMunicipals.push(municipios['0']);
        }
      }
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

  redirectSwitchRolGerente(id: any) {
    const idEncrypt = this.localData.encryptIdUser(id);
    this.router.navigate(["cambiarRolGerente", idEncrypt]);
  }

  gerenteActualSeleccionado(gerente: any, municipios?:any) {
    this.gerenteActual=gerente;
    this.municipiosActual=municipios;
  }

  dataTableOptions() {
    this.dtOptionsGerenteAsignados = {
      destroy:true,
      processing: true,
      pageLength: 10,
      columns: [{
        orderable: true,
      }, {
        orderable: true,
        className: 'd-none d-md-table-cell',
      },{
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
    this.dtOptionsGerenteNoAsignados = {
      destroy:true,
      processing: true,
      pageLength: 10,
      columns: [{
        orderable: true,
      },{
        orderable: true,
        className: 'd-none d-md-table-cell',
      },
       {
        orderable: true,
        className: 'd-none d-md-table-cell',
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
