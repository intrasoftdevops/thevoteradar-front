import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ver-equipo-admin',
  templateUrl: './ver-equipo-admin.component.html',
  styleUrls: ['./ver-equipo-admin.component.scss']
})
export class VerEquipoAdminComponent implements OnInit {

  constructor(private apiService: ApiService) { }

  tablaGerentes: Boolean = false;
  tablaSupervisores: Boolean = false;
  tablaCoordinadores: Boolean = false;
  tablaTestigos: Boolean = false;
  botonAtrasSupervisores: Boolean = false;
  botonAtrasCoordinadores: Boolean = false;
  botonAtrasTestigos: Boolean = false;
  dropdownSettingsDepartments: IDropdownSettings = {};
  dropdownSettingsMunicipals: IDropdownSettings = {};
  dropdownSettingsZones: IDropdownSettings = {};
  dropdownSettingsStations: IDropdownSettings = {};
  dropdownSettingsTables: IDropdownSettings = {};
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

    this.dropdownSettingsDepartments = {
      noDataAvailablePlaceholderText: "No hay informacion disponible",
      clearSearchFilter: false,
      enableCheckAll: false,
      singleSelection: true,
      idField: 'codigo_unico',
      textField: 'nombre_departamento_votacion',
      itemsShowLimit: 2,
      searchPlaceholderText: "Buscar",
      allowSearchFilter: true
    };

    this.dropdownSettingsMunicipals = {
      noDataAvailablePlaceholderText: "No hay informacion disponible",
      clearSearchFilter: false,
      enableCheckAll: false,
      singleSelection: true,
      idField: 'codigo_unico',
      textField: 'nombre',
      itemsShowLimit: 2,
      searchPlaceholderText: "Buscar",
      allowSearchFilter: true
    };

    this.dropdownSettingsZones = {
      noDataAvailablePlaceholderText: "No hay informacion disponible",
      clearSearchFilter: false,
      enableCheckAll: false,
      singleSelection: true,
      idField: 'codigo_unico',
      textField: 'nombre',
      itemsShowLimit: 2,
      searchPlaceholderText: "Buscar",
      allowSearchFilter: true
    };

    this.dropdownSettingsStations = {
      noDataAvailablePlaceholderText: "No hay informacion disponible",
      clearSearchFilter: false,
      enableCheckAll: false,
      singleSelection: true,
      idField: 'codigo_unico',
      textField: 'nombre',
      itemsShowLimit: 2,
      searchPlaceholderText: "Buscar",
      allowSearchFilter: true
    };

    this.dropdownSettingsTables = {
      noDataAvailablePlaceholderText: "No hay informacion disponible",
      clearSearchFilter: false,
      enableCheckAll: false,
      singleSelection: true,
      idField: 'codigo_unico',
      textField: 'numero_mesa',
      itemsShowLimit: 2,
      searchPlaceholderText: "Buscar",
      allowSearchFilter: true
    };

  }

  onItemSelectDepartment(item: any) {
    this.tablaGerentes = false;
    this.tablaSupervisores = false;
    this.tablaCoordinadores = false;
    this.tablaTestigos = false;
    this.selectedMunicipal = [];
    this.selectedZone = [];
    this.selectedStation = [];
    this.selectedTable = [];
    const codigo_unico = this.getCode(item);
    console.log(codigo_unico);
    this.getMunicipalAdmin(codigo_unico);
  }

  onItemDeSelectDepartment() {
    this.tablaGerentes = false;
    this.tablaSupervisores = false;
    this.tablaCoordinadores = false;
    this.tablaTestigos = false;
    this.selectedMunicipal = [];
    this.selectedZone = [];
    this.selectedStation = [];
    this.selectedTable = [];
  }

  onItemSelectMunicipal(item: any) {
    this.tablaSupervisores = false;
    this.tablaCoordinadores = false;
    this.tablaTestigos = false;
    this.selectedZone = [];
    this.selectedStation = [];
    this.selectedTable = [];
    const codigo_unico = this.getCode(item);
    const data = { municipio: codigo_unico }
    this.getZonasyGerentes(data);
    this.tablaGerentes = true;
  }

  onItemDeSelectMunicipal() {
    this.tablaGerentes = false;
    this.tablaSupervisores = false;
    this.tablaCoordinadores = false;
    this.tablaTestigos = false;
    this.selectedZone = [];
    this.selectedStation = [];
    this.selectedTable = [];
  }

  onItemSelectZone(item: any) {
    this.tablaGerentes = false;
    this.tablaCoordinadores = false;
    this.tablaTestigos = false;
    this.selectedStation = [];
    this.selectedTable = [];
    const codigo_unico = this.getCode(item);
    const data = { zona: codigo_unico }
    this.getPuestosySupervisores(data);
    this.tablaSupervisores = true;
  }

  onItemDeSelectZone() {
    this.tablaSupervisores = false;
    this.tablaCoordinadores = false;
    this.tablaTestigos = false;
    this.tablaGerentes = true;
    this.selectedStation = [];
    this.selectedTable = [];
  }

  onItemSelectStation(item: any) {
    this.tablaTestigos = false;
    this.tablaGerentes = false;
    this.tablaSupervisores = false;
    this.selectedTable = [];
    const codigo_unico = this.getCode(item);
    const data = { puesto: codigo_unico }
    this.getMesasyCoordinadores(data);
    this.tablaCoordinadores = true;
  }

  onItemDeSelectStation() {
    this.tablaGerentes = false;
    this.tablaCoordinadores = false;
    this.tablaTestigos = false;
    this.tablaSupervisores = true;
    this.selectedTable = [];
  }

  onItemSelectTable(item: any) {
    this.tablaGerentes = false;
    this.tablaSupervisores = false;
    this.tablaCoordinadores = false;
    const codigo_unico = this.getCode(item);
    const data = { mesa: codigo_unico }
    this.getTestigoMesa(data);
    this.tablaTestigos = true;
  }

  onItemDeSelectTable() {
    this.tablaGerentes = false;
    this.tablaSupervisores = false;
    this.tablaTestigos = false;
    this.tablaCoordinadores = true;
  }

  getDepartmentAdmin() {
    this.apiService.getDepartmentAdmin().subscribe((resp: any) => {
      this.dataDepartments = resp;
    }, (err: any) => {
      this.showError(err);
    })
  }

  getMunicipalAdmin(data: any) {
    this.apiService.getMunicipalAdmin().subscribe((resp: any) => {
      this.dataMunicipals = resp.filter((dataMunicipal: any) => dataMunicipal.codigo_departamento_votacion == data);
    }, (err: any) => {
      this.showError(err);
    })
  }

  getZonasyGerentes(data: any) {
    this.apiService.getZonasyGerentes(data).subscribe((resp: any) => {
      const { zonas, gerentes } = resp;
      this.dataZones = zonas;
      this.listGerentes = gerentes;
    }, (err: any) => {
      this.showError(err);
    })
  }

  getPuestosySupervisores(data: any) {
    this.apiService.getPuestosySupervisores(data).subscribe((resp: any) => {
      const { puestos, supervisores } = resp;
      this.dataStations = puestos;
      this.listSupervisores = supervisores;
    }, (err: any) => {
      this.showError(err);
    })
  }

  getMesasyCoordinadores(data: any) {
    this.apiService.getMesasyCoordinadores(data).subscribe((resp: any) => {
      const { mesas, coordinadores } = resp;
      this.dataTables = mesas;
      this.listCoordinadores = coordinadores;
    }, (err: any) => {
      this.showError(err);
    })
  }

  getTestigoMesa(data: any) {
    this.apiService.getTestigoMesa(data).subscribe((resp: any) => {
      const { testigos } = resp;
      this.listTestigos = testigos;
    }, (err: any) => {
      this.showError(err);
    })
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

  showError(err: any) {
    console.log(err);
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: err.message,
    });
  }

}
