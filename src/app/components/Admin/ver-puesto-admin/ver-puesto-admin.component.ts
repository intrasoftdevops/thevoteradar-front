import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ver-puesto-admin',
  templateUrl: './ver-puesto-admin.component.html',
  styleUrls: ['./ver-puesto-admin.component.scss']
})
export class VerPuestoAdminComponent implements OnInit {

  constructor(private apiService: ApiService) { }

  tabla: string = "ninguna";
  dropdownSettingsDepartments: IDropdownSettings = {};
  dropdownSettingsMunicipals: IDropdownSettings = {};
  dropdownSettingsZones: IDropdownSettings = {};
  dropdownSettingsStations: IDropdownSettings = {};
  dataDepartments: any = [];
  dataMunicipals: any = [];
  dataZones: any = [];
  dataStations: any = [];
  selectedMunicipal: any = [];
  selectedZone: any = [];
  selectedStation: any = [];
  gerentesNecesitados: any = {
    cantidad_gerentes_hay: '',
    cantidad_gerentes_necesitada: ''
  };
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

  ngOnInit(): void {
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

  }

  onItemSelectDepartment(item: any) {
    this.selectedMunicipal = [];
    this.selectedZone = [];
    this.selectedStation = [];
    const codigo_unico = this.getCode(item);
    this.getGerentesNecesitados(codigo_unico);
    this.getMunicipalAdmin(codigo_unico);
    this.tabla = "gerente";
  }

  onItemDeSelectDepartment() {
    this.selectedMunicipal = [];
    this.selectedZone = [];
    this.selectedStation = [];
    this.tabla = "ninguna";
  }

  onItemSelectMunicipal(item: any) {
    this.selectedZone = [];
    this.selectedStation = [];
    const codigo_unico = this.getCode(item);
    const data = { municipio: codigo_unico }
    this.getZonasyGerentes(data);
    this.getSupervisoresNecesitados(data);
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
    this.getPuestosySupervisores(data);
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
      const { zonas } = resp;
      this.dataZones = zonas;
    }, (err: any) => {
      this.showError(err);
    })
  }

  getPuestosySupervisores(data: any) {
    this.apiService.getPuestosySupervisores(data).subscribe((resp: any) => {
      const { puestos } = resp;
      this.dataStations = puestos;
    }, (err: any) => {
      this.showError(err);
    })
  }


  getGerentesNecesitados(codigo_unico: any) {

    const data = { departamento: codigo_unico };

    this.apiService.getGerentesNecesitados(data).subscribe((resp: any) => {
      console.log(resp);
      this.gerentesNecesitados = resp;
    }, (err: any) => {
      console.log(err)
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
