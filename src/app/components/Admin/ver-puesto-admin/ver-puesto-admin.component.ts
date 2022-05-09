import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { AlertService } from '../../../services/alert/alert.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-ver-puesto-admin',
  templateUrl: './ver-puesto-admin.component.html',
  styleUrls: ['./ver-puesto-admin.component.scss']
})
export class VerPuestoAdminComponent implements OnInit, OnDestroy {

  tabla: string = "ninguna";
  dataDepartments: any = [];
  dataMunicipals: any = [];
  dataZones: any = [];
  dataStations: any = [];
  gerentes: any = {}
  supervisores: any = {};
  coordinadores: any = {};
  testigos: any = {};
  supervisoresGerente: any = {};
  coordinadoresGerente: any = {};
  testigosGerente: any = {};
  coordinadoresSupervisor: any = {};
  testigosSupervisor: any = {};
  testigosCoordinador: any = {};
  searchForm: FormGroup = this.fb.group({
    departamentos: [null],
    municipios: [null],
    zonas: [null],
    puestos: [null],
  });
  dataStateDepartment: any = {};
  dtOptionsGerente: DataTables.Settings = {};
  dtOptionsSupervisor: DataTables.Settings = {};
  dtOptionsCoordinador: DataTables.Settings = {};
  dtOptionsTestigo: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  constructor(private apiService: ApiService, private alertService: AlertService, private customValidator: CustomValidationService, private fb: FormBuilder) { }

  ngOnInit() {
    this.getDepartmentAdmin();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  get searchFormControl() {
    return this.searchForm.controls;
  }

  getSelectedDepartment(item: any) {
    this.searchFormControl['municipios'].reset();
    this.searchFormControl['zonas'].reset();
    this.searchFormControl['puestos'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { departamento: codigo_unico };
      this.getNecesitadosDepartamento(data);
      this.getMunicipalAdmin(item.codigo_unico);
      this.tabla = "gerente"
    } else {
      this.tabla = "ninguna"
    }
  }

  getSelectedMunicipal(item: any) {
    this.searchFormControl['zonas'].reset();
    this.searchFormControl['puestos'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { municipio: codigo_unico }
      this.getNecesitadosMunicipio(data);
      this.getZonas(data);
      this.tabla = "supervisor";
    } else {
      this.dataZones = [];
      this.tabla = "gerente"
    }
  }

  getSelectedZone(item: any) {
    this.searchFormControl['puestos'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { zona: codigo_unico }
      this.getNecesitadosZona(data);
      this.getPuestos(data);
      this.tabla = "coordinador";
    } else {
      this.dataStations = [];
      this.tabla = "supervisor"
    }
  }

  getSelectedStation(item: any) {
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { puesto: codigo_unico }
      this.getNecesitadosPuesto(data);
      this.tabla = "testigo";
    } else {
      this.tabla = "coordinador"
    }
  }

  getDepartmentAdmin() {
    this.apiService.getDepartmentAdmin().subscribe((resp: any) => {
      this.dataDepartments = resp;
    })
  }

  getMunicipalAdmin(data: any) {
    this.apiService.getMunicipalAdmin().subscribe((resp: any) => {
      this.dataMunicipals = resp.filter((dataMunicipal: any) => dataMunicipal.codigo_departamento_votacion == data);
    })
  }

  getZonas(data: any) {
    this.apiService.getZonasyGerentes(data).subscribe((resp: any) => {
      const { zonas } = resp;
      this.dataZones = zonas;
    })
  }


  getPuestos(data: any) {
    this.apiService.getPuestosySupervisores(data).subscribe((resp: any) => {
      const { puestos } = resp;
      this.dataStations = puestos;
    })
  }

  getNecesitadosDepartamento(data: any) {
    this.apiService.getNecesitadosDepartamento(data).subscribe((resp: any) => {
      this.dataStateDepartment = [resp];
      this.dataTableOptionsGerente();
      setTimeout(() => {
        this.dtTrigger.next(void 0);
      });
    })
  }

  getNecesitadosMunicipio(data: any) {
    this.apiService.getNecesitadosMunicipio(data).subscribe((resp: any) => {
      this.supervisoresGerente = resp.supervisores;
      this.coordinadoresGerente = resp.coordinadores;
      this.testigosGerente = resp.testigos;
    })
  }

  getNecesitadosZona(data: any) {
    this.apiService.getNecesitadosZona(data).subscribe((resp: any) => {
      this.coordinadoresSupervisor = resp.coordinadores;
      this.testigosSupervisor = resp.testigos;
    })
  }

  getNecesitadosPuesto(data: any) {
    this.apiService.getNecesitadosPuesto(data).subscribe((resp: any) => {
      this.testigosCoordinador = resp.testigos;
    })
  }

  createPercent(existentes: any, necesitados: any) {
    const percent = Math.round((existentes / necesitados) * 100) / 100;
    if (necesitados == 0) {
      return `(0%)`;
    }
    return `(${percent}%)`;
  }

  textColor(existentes: any, necesitados: any) {
    let percent = Math.round((existentes / necesitados) * 100) / 100;
    if (percent == 100) {
      return "text-success";
    } else if ((percent >= 0 && percent <= 50) && (existentes < necesitados)) {
      return "text-danger";
    } else if (percent > 50 && percent < 100) {
      return "text-warning";
    } else if (percent > 100) {
      return "text-primary";
    } else {
      return "text-success";
    }
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

  dataTableOptionsGerente() {
    this.dtOptionsGerente = {
      data: this.dataStateDepartment,
      processing: true,
      destroy: true,
      pageLength: 10,
      searchDelay: 5000,
      columns: [{
        title: 'GERENTES',
        data: function (row, type, set) {
          const percent = createPercent(row.gerentes.gerentes_con_municipio, row.gerentes.cantidad_gerentes_necesitados);
            return `${row.gerentes.gerentes_con_municipio}/${row.gerentes.cantidad_gerentes_necesitados} ${percent}`;
        },
        createdCell: (td, cellData, rowData, row, col) => {
          $(td).addClass(this.textColor(rowData.gerentes.gerentes_con_municipio, rowData.gerentes.cantidad_gerentes_necesitados));
        },
        orderable: false,
      }, {
        title: 'SUPERVISORES',
        render: (data, type, row) => {
          return `${row.supervisores.supervisores_con_municipio}/${row.supervisores.cantidad_supervisores_necesitados} ${this.createPercent(row.supervisores.supervisores_con_municipio, row.supervisores.cantidad_supervisores_necesitados)}`;
        },
        orderable: false,
      }, {
        title: 'COORDINADORES',
        render: (data, type, row) => {
          return `${row.coordinadores.coordinadores_con_puesto}/${row.coordinadores.cantidad_coordinadores_necesitados} ${this.createPercent(row.coordinadores.coordinadores_con_puesto, row.coordinadores.cantidad_coordinadores_necesitados)}`;
        },
        orderable: false,
      }, {
        title: 'TESTIGOS',
        render: (data, type, row) => {
          return `${row.testigos.testigos_con_mesa}/${row.testigos.cantidad_testigos_necesitados} ${this.createPercent(row.testigos.testigos_con_mesa, row.testigos.cantidad_testigos_necesitados)}`;
        },
        orderable: false,
      },
      ],
      responsive: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json'
      }
    };
  }

}

function createPercent(existentes: any, necesitados: any) {
  const percent = Math.round((existentes / necesitados) * 100) / 100;
    if (necesitados == 0) {
      return `(0%)`;
    }
    return `(${percent}%)`;
}

