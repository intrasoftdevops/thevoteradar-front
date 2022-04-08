import { Component, OnInit } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ver-equipo-gerente',
  templateUrl: './ver-equipo-gerente.component.html',
  styleUrls: ['./ver-equipo-gerente.component.scss']
})
export class VerEquipoGerenteComponent implements OnInit {

  constructor(private apiService: ApiService) { }

  tablaSupervisores: Boolean = false;
  tablaCoordinadores: Boolean = false;
  tablaTestigos: Boolean = false;
  botonAtrasCoordinadores: Boolean = false;
  botonAtrasTestigos: Boolean = false;
  dropdownSettingsMunicipals: IDropdownSettings = {};
  dropdownSettingsZones: IDropdownSettings = {};
  dropdownSettingsStations: IDropdownSettings = {};
  dropdownSettingsTables: IDropdownSettings = {};
  dataMunicipals: any = [];
  dataZones: any = [];
  dataStations: any = [];
  dataTables: any = [];
  listSupervisores: any = [];
  listCoordinadores: any = [];
  listTestigos: any = [];
  selectedZone: any = [];
  selectedStation: any = [];
  selectedTable: any = [];


  ngOnInit(): void {
    this.getMunicipalAdmin();

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

  onItemSelectMunicipal(item: any) {
    this.tablaSupervisores = false;
    this.tablaCoordinadores = false;
    this.tablaTestigos = false;
    this.selectedZone = [];
    this.selectedStation = [];
    this.selectedTable = [];
    const codigo_unico = this.getCode(item);
    this.getZonas(codigo_unico);
  }

  onItemDeSelectMunicipal() {
    this.tablaSupervisores = false;
    this.tablaCoordinadores = false;
    this.tablaTestigos = false;
    this.selectedZone = [];
    this.selectedStation = [];
    this.selectedTable = [];
  }

  onItemSelectZone(item: any) {
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
    this.selectedStation = [];
    this.selectedTable = [];
  }

  onItemSelectStation(item: any) {
    this.tablaTestigos = false;
    this.tablaSupervisores = false;
    this.selectedTable = [];
    const codigo_unico = this.getCode(item);
    const data = { puesto: codigo_unico }
    this.getMesasyCoordinadores(data);
    this.tablaCoordinadores = true;
  }

  onItemDeSelectStation() {
    this.tablaCoordinadores = false;
    this.tablaTestigos = false;
    this.tablaSupervisores = true;
    this.selectedTable = [];
  }

  onItemSelectTable(item: any) {
    this.tablaSupervisores = false;
    this.tablaCoordinadores = false;
    const codigo_unico = this.getCode(item);
    const data = { mesa: codigo_unico }
    this.getTestigoMesa(data);
    this.tablaTestigos = true;
  }

  onItemDeSelectTable() {
    this.tablaSupervisores = false;
    this.tablaTestigos = false;
    this.tablaCoordinadores = true;
  }

  getMunicipalAdmin() {
    this.apiService.getMunicipalGerente().subscribe(resp => {
      this.dataMunicipals = resp;
    }, (err: any) => {
      this.showError(err);
    });
  }

  getZonas(data: any) {
    this.apiService.getZoneGerente().subscribe((resp: any) => {
      this.dataZones = resp.filter((dataZone: any) => dataZone.codigo_municipio_votacion == data);
    }, (err: any) => {
      this.showError(err);
    });
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
