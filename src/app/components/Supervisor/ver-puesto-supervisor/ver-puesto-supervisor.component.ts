import { Component, OnInit } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import Swal from 'sweetalert2';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-ver-puesto-supervisor',
  templateUrl: './ver-puesto-supervisor.component.html',
  styleUrls: ['./ver-puesto-supervisor.component.scss']
})
export class VerPuestoSupervisorComponent implements OnInit {

  tabla: string = "ninguna";
  dropdownSettingsZones: IDropdownSettings = {};
  dropdownSettingsStations: IDropdownSettings = {};
  dataZones: any = [];
  dataStations: any = [];
  selectedStation: any = [];
  coordinadoresNecesitados: any = {
    cantidad_coordinadores_hay: '',
    cantidad_coordinadores_necesitada: ''
  };
  testigosNecesitados: any = {
    cantidad_testigos_hay: '',
    cantidad_testigos_necesitada: ''
  };

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

  }

  onItemSelectZone(item: any) {
    this.selectedStation = [];
    const codigo_unico = this.getCode(item);
    const data = { zona: codigo_unico }
    this.getPuestos(codigo_unico);
    this.getCoordinadoresNecesitados(data);
    this.tabla = "coordinador";
  }

  onItemDeSelectZone() {
    this.selectedStation = [];
    this.tabla = "supervisor";
  }

  onItemSelectStation(item: any) {
    const codigo_unico = this.getCode(item);
    const data = { puesto: codigo_unico }
    this.getTestigosNecesitados(data);
    this.tabla = "testigo";
  }

  onItemDeSelectStation() {
    this.tabla = "coordinador";
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

  getCoordinadoresNecesitados(data: any) {
    this.apiService.getCoordinadoresNecesitados(data).subscribe((resp: any) => {
      console.log(resp);
      this.coordinadoresNecesitados = resp;
    }, (err: any) => {
      console.log(err)
    })
  }

  getTestigosNecesitados(data: any) {
    this.apiService.getTestigosNecesitados(data).subscribe((resp: any) => {
      console.log(resp);
      this.testigosNecesitados = resp;
    }, (err: any) => {
      console.log(err)
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
