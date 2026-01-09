import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { BackofficeAdminService } from '../../../services/backoffice-admin/backoffice-admin.service';
import { AlertService } from '../../../services/alert/alert.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';
import { environment } from '../../../../environments/environment';
import { DevDataService } from '../../../services/dev-data/dev-data.service';

@Component({
  selector: 'app-ver-puesto-admin',
  templateUrl: './ver-puesto-admin.component.html',
  styleUrls: ['./ver-puesto-admin.component.scss'],
})
export class VerPuestoAdminComponent implements OnInit {
  tabla: string = 'ninguna';
  dataDepartments: any = [];
  dataMunicipals: any = [];
  dataZones: any = [];
  dataStations: any = [];
  searchForm: FormGroup = this.fb.group({
    departamentos: [null],
    municipios: [null],
    zonas: [null],
    puestos: [null],
  });
  dataStateDepartment: any = [];
  dataStateMunicipal: any = [];
  dataStateZone: any = [];
  dataStateStation: any = [];
  stateActual: any = {};
  isDevelopmentMode: boolean = this.checkDevelopmentMode();

  constructor(
    private apiService: ApiService,
    private backofficeAdminService: BackofficeAdminService,
    private fb: FormBuilder,
    private devDataService: DevDataService
  ) {}

  private checkDevelopmentMode(): boolean {
    
    return environment.development && 
           !environment.production && 
           (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('dev') ||
            window.location.hostname.includes('test'));
  }

  ngOnInit() {
    if (this.isDevelopmentMode) {
      this.loadDevData();
    } else {
      this.getDepartmentAdmin();
    }
  }

  loadDevData() {
    
    this.dataDepartments = this.devDataService.getDepartments();
    this.dataMunicipals = this.devDataService.getMunicipals();
    this.dataZones = this.devDataService.getZones();
    this.dataStations = this.devDataService.getStations();

    
    this.dataStateDepartment = [this.devDataService.getTeamStatistics()];
    this.dataStateMunicipal = [this.devDataService.getTeamStatistics()];
    this.dataStateZone = [this.devDataService.getTeamStatistics()];
    this.dataStateStation = [this.devDataService.getTeamStatistics()];

    
    this.tabla = 'gerente';

    
    if (this.dataDepartments.length > 0) {
      this.searchForm.get('departamentos')?.setValue(this.dataDepartments[0].codigo_unico);
    }
  }

  get searchFormControl() {
    return this.searchForm.controls;
  }

  getSelectedDepartment(item: any) {
    this.searchFormControl['municipios'].reset();
    this.searchFormControl['zonas'].reset();
    this.searchFormControl['puestos'].reset();
    if (item) {
      if (this.isDevelopmentMode) {
        
        this.dataMunicipals = this.devDataService.getMunicipals().filter(
          (municipal: any) => municipal.codigo_departamento_votacion === item.codigo_unico
        );
        this.tabla = 'gerente';
      } else {
        const codigo_unico = this.getCode(item);
        const data = { departamento: codigo_unico };
        this.getNecesitadosDepartamento(data);
        this.getMunicipalAdmin(item.codigo_unico);
        this.tabla = 'gerente';
      }
    } else {
      this.dataMunicipals = [];
      this.dataZones = [];
      this.dataStations = [];
      this.tabla = 'ninguna';
    }
  }

  getSelectedMunicipal(item: any) {
    this.searchFormControl['zonas'].reset();
    this.searchFormControl['puestos'].reset();
    if (item) {
      if (this.isDevelopmentMode) {
        
        this.dataZones = this.devDataService.getZones();
        this.tabla = 'supervisor';
      } else {
        const codigo_unico = this.getCode(item);
        const data = { municipio: codigo_unico };
        this.getNecesitadosMunicipio(data);
        this.getZonas(data);
        this.tabla = 'supervisor';
      }
    } else {
      this.dataZones = [];
      this.dataStations = [];
      this.tabla = 'gerente';
    }
  }

  getSelectedZone(item: any) {
    this.searchFormControl['puestos'].reset();
    if (item) {
      if (this.isDevelopmentMode) {
        
        this.dataStations = this.devDataService.getStations();
        this.tabla = 'coordinador';
      } else {
        const codigo_unico = this.getCode(item);
        const data = { zona: codigo_unico };
        this.getNecesitadosZona(data);
        this.getPuestos(data);
        this.tabla = 'coordinador';
      }
    } else {
      this.dataStations = [];
      this.tabla = 'supervisor';
    }
  }

  getSelectedStation(item: any) {
    if (item) {
      if (this.isDevelopmentMode) {
        
        this.tabla = 'testigo';
      } else {
        const codigo_unico = this.getCode(item);
        const data = { puesto: codigo_unico };
        this.getNecesitadosPuesto(data);
        this.tabla = 'testigo';
      }
    } else {
      this.tabla = 'coordinador';
    }
  }

  getDepartmentAdmin() {
    this.backofficeAdminService.getDepartamentosAdmin().subscribe({
      next: (resp: any) => {
        this.dataDepartments = resp.departamentos || resp || [];
        if (this.dataDepartments.length > 0) {
          this.searchForm
            .get('departamentos')
            ?.setValue(this.dataDepartments[0].codigo_unico);
          this.getSelectedDepartment(this.dataDepartments[0]);
        }
      },
      error: (error: any) => {
        this.dataDepartments = [];
      }
    });
  }

  getMunicipalAdmin(data: any) {
    this.apiService.getMunicipalAdmin().subscribe((resp: any) => {
      this.dataMunicipals = resp.filter(
        (dataMunicipal: any) =>
          dataMunicipal.codigo_departamento_votacion == data
      );
    });
  }

  getZonas(data: any) {
    this.apiService.getZonasyGerentes(data).subscribe((resp: any) => {
      const { zonas } = resp;
      this.dataZones = zonas;
    });
  }

  getPuestos(data: any) {
    this.apiService.getPuestosySupervisores(data).subscribe((resp: any) => {
      const { puestos } = resp;
      this.dataStations = puestos;
    });
  }

  getNecesitadosDepartamento(data: any) {
    this.apiService.getNecesitadosDepartamento(data).subscribe((resp: any) => {
      this.dataStateDepartment = [resp];
    });
  }

  getNecesitadosMunicipio(data: any) {
    this.apiService.getNecesitadosMunicipio(data).subscribe((resp: any) => {
      this.dataStateMunicipal = [resp];
    });
  }

  getNecesitadosZona(data: any) {
    this.apiService.getNecesitadosZona(data).subscribe((resp: any) => {
      this.dataStateZone = [resp];
    });
  }

  getNecesitadosPuesto(data: any) {
    this.apiService.getNecesitadosPuesto(data).subscribe((resp: any) => {
      this.dataStateStation = [resp];
    });
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
      return 'text-success';
    } else if (percent >= 0 && percent <= 50 && existentes < necesitados) {
      return 'text-danger';
    } else if (percent > 50 && percent < 100) {
      return 'text-warning';
    } else if (percent > 100) {
      return 'text-primary';
    } else {
      return 'text-success';
    }
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

  stateSeleccionado(state: any) {
    this.stateActual = state;
  }
}
