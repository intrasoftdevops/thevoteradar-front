import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-ver-equipo-admin',
  templateUrl: './ver-equipo-admin.component.html',
  styleUrls: ['./ver-equipo-admin.component.scss']
})
export class VerEquipoAdminComponent implements OnInit {

  constructor(private apiService: ApiService, private alertService: AlertService) { }

  showLoading: boolean = false;
  tabla: string = "ninguna";
  dataDepartments: any = [];
  dataMunicipals: any = [];
  dataZones: any = [];
  dataStations: any = [];
  dataTables: any = [];
  listGerentes: any = [];
  listSupervisores: any = [];
  listCoordinadores: any = [];
  listTestigos: any = [];
  selectedMunicipal: any = [];
  selectedZone: any = [];
  selectedStation: any = [];
  selectedTable: any = [];

  ngOnInit() {
    this.getDepartmentAdmin();
  }

  getSelectedDepartment(item: any) {
    this.selectedMunicipal = [];
    this.selectedZone = [];
    this.selectedStation = [];
    this.selectedTable = [];
    if (item) {
      this.getMunicipalAdmin(item.codigo_unico);
      this.tabla = "ninguna"
    } else {
      this.dataMunicipals = [];
      this.tabla = "ninguna"
    }
  }

  getSelectedMunicipal(item: any) {
    this.selectedZone = [];
    this.selectedStation = [];
    this.selectedTable = [];
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { municipio: codigo_unico }
      this.getZonasyGerentes(data);
      this.tabla = "gerente";
    } else {
      this.dataZones = [];
      this.tabla = "ninguna"
    }
  }

  getSelectedZone(item: any) {
    this.selectedStation = [];
    this.selectedTable = [];
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { zona: codigo_unico }
      this.getPuestosySupervisores(data);
      this.tabla = "supervisor";
    } else {
      this.dataStations = [];
      this.tabla = "gerente"
    }
  }

  getSelectedStation(item: any) {
    this.selectedTable = [];
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { puesto: codigo_unico }
      this.getMesasyCoordinadores(data);
      this.tabla = "coordinador";
    } else {
      this.dataTables = [];
      this.tabla = "supervisor"
    }
  }

  getSelectedTable(item: any) {
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { mesa: codigo_unico }
      this.getTestigoMesa(data);
      this.tabla = "testigo";
    } else {
      this.tabla = "coordinador"
    }
  }

  getDepartmentAdmin() {
    this.showLoading = true;
    this.apiService.getDepartmentAdmin().subscribe((resp: any) => {
      this.showLoading = false;
      this.dataDepartments = resp;
    }, (err: any) => {
      this.showLoading = false;
      this.alertService.errorAlert(err.message);
    })
  }

  getMunicipalAdmin(data: any) {
    this.showLoading = true;
    this.apiService.getMunicipalAdmin().subscribe((resp: any) => {
      this.showLoading = false;
      this.dataMunicipals = resp.filter((dataMunicipal: any) => dataMunicipal.codigo_departamento_votacion == data);
    }, (err: any) => {
      this.showLoading = false;
      this.alertService.errorAlert(err.message);
    })
  }

  getZonasyGerentes(data: any) {
    this.showLoading = true;
    this.apiService.getZonasyGerentes(data).subscribe((resp: any) => {
      this.showLoading = false;
      const { zonas, gerentes } = resp;
      this.dataZones = zonas;
      this.listGerentes = gerentes;
    }, (err: any) => {
      this.showLoading = false;
      this.alertService.errorAlert(err.message);
    })
  }

  getPuestosySupervisores(data: any) {
    this.showLoading = true;
    this.apiService.getPuestosySupervisores(data).subscribe((resp: any) => {
      this.showLoading = false;
      const { puestos, supervisores } = resp;
      this.dataStations = puestos;
      this.listSupervisores = supervisores;
    }, (err: any) => {
      this.showLoading = false;
      this.alertService.errorAlert(err.message);
    })
  }

  getMesasyCoordinadores(data: any) {
    this.showLoading = true;
    this.apiService.getMesasyCoordinadores(data).subscribe((resp: any) => {
      this.showLoading = false;
      const { mesas, coordinadores } = resp;
      this.dataTables = mesas;
      this.listCoordinadores = coordinadores;
    }, (err: any) => {
      this.showLoading = false;
      console.log(err)
      this.alertService.errorAlert(err.message);
    })
  }

  getTestigoMesa(data: any) {
    this.showLoading = true;
    this.apiService.getTestigoMesa(data).subscribe((resp: any) => {
      this.showLoading = false;
      const { testigos } = resp;
      this.listTestigos = testigos;
    }, (err: any) => {
      this.showLoading = false;
      this.alertService.errorAlert(err.message);
    })
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

}
