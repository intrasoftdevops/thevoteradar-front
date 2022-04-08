import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ver-equipo-supervisor',
  templateUrl: './ver-equipo-supervisor.component.html',
  styleUrls: ['./ver-equipo-supervisor.component.scss']
})
export class VerEquipoSupervisorComponent implements OnInit {

  tablaCoordinadores: Boolean = false;
  tablaTestigos: Boolean = false;
  botonAtrasTestigos: Boolean = false;
  dropdownSettingsZones: IDropdownSettings = {};
  dropdownSettingsStations: IDropdownSettings = {};
  dropdownSettingsTables: IDropdownSettings = {};
  dataZones: any = [];
  dataStations: any = [];
  dataTables: any = [];
  listCoordinadores: any = [];
  listTestigos: any = [];
  selectedStation: any = [];
  selectedTable: any = [];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.getZonas();

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

  onItemSelectZone(item: any) {
    this.tablaCoordinadores = false;
    this.tablaTestigos = false;
    this.selectedStation = [];
    this.selectedTable = [];
    const codigo_unico = this.getCode(item);
    this.getPuestos(codigo_unico);
  }

  onItemDeSelectZone() {
    this.tablaCoordinadores = false;
    this.tablaTestigos = false;
    this.selectedStation = [];
    this.selectedTable = [];
  }

  onItemSelectStation(item: any) {
    this.tablaTestigos = false;
    this.selectedTable = [];
    const codigo_unico = this.getCode(item);
    const data = { puesto: codigo_unico }
    this.getMesasyCoordinadores(data);
    this.tablaCoordinadores = true;
  }

  onItemDeSelectStation() {
    this.tablaCoordinadores = false;
    this.tablaTestigos = false;
    this.selectedTable = [];
  }

  onItemSelectTable(item: any) {
    this.tablaCoordinadores = false;
    const codigo_unico = this.getCode(item);
    const data = { mesa: codigo_unico }
    this.getTestigoMesa(data);
    this.tablaTestigos = true;
  }

  onItemDeSelectTable() {
    this.tablaTestigos = false;
    this.tablaCoordinadores = true;
  }

  getZonas() {
    this.apiService.getZonesSupervisor().subscribe((resp: any) => {
      this.dataZones = resp;
    }, (err: any) => {
      this.showError(err);
    })
  }

  getPuestos(data: any) {
    this.apiService.getStationsCoordinador().subscribe((resp: any) => {
      this.dataStations = resp.filter((dataStation: any) => dataStation.codigo_zona_votacion == data);
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
