import { Component, OnInit } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import Swal from 'sweetalert2';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-ver-puesto-gerente',
  templateUrl: './ver-puesto-gerente.component.html',
  styleUrls: ['./ver-puesto-gerente.component.scss']
})
export class VerPuestoGerenteComponent implements OnInit {

  tabla: string = "ninguna";
  dropdownSettingsMunicipals: IDropdownSettings = {};
  dropdownSettingsZones: IDropdownSettings = {};
  dropdownSettingsStations: IDropdownSettings = {};
  dataMunicipals: any = [];
  dataZones: any = [];
  dataStations: any = [];
  selectedZone: any = [];
  selectedStation: any = [];
  supervisoresNecesitados: any = {
    cantidad_supervisores_hay: '',
    cantidad_supervisores_necesitada: ''
  };
  coordinadoresNecesitados: any = {
    cantidad_coordinadores_hay: '',
    cantidad_coordinadores_necesitada: ''
  };
  testigosNecesitados: any = {
    cantidad_testigos_hay: '',
    cantidad_testigos_necesitada: ''
  };

  constructor(private apiService: ApiService) { }

  ngOnInit() {
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

  }

  onItemSelectMunicipal(item: any) {
    this.selectedZone = [];
    this.selectedStation = [];
    const codigo_unico = this.getCode(item);
    const data = { municipio: codigo_unico }
    this.getSupervisoresNecesitados(data);
    this.getZonas(codigo_unico);
    this.tabla = "supervisor";
  }

  onItemDeSelectMunicipal() {
    this.selectedZone = [];
    this.selectedStation = [];
    this.tabla = "gerente";
  }

  onItemSelectZone(item: any) {
    this.selectedStation = [];
    const codigo_unico = this.getCode(item);
    const data = { zona: codigo_unico }
    this.getPuestos(data);
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

  getPuestos(data: any) {
    this.apiService.getPuestosySupervisores(data).subscribe((resp: any) => {
      const { puestos } = resp;
      this.dataStations = puestos;
    }, (err: any) => {
      this.showError(err);
    })
  }

  getSupervisoresNecesitados(data: any) {
    this.apiService.getSupervisoresNecesitados(data).subscribe((resp: any) => {
      console.log(resp);
      this.supervisoresNecesitados = resp;
    }, (err: any) => {
      console.log(err)
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
