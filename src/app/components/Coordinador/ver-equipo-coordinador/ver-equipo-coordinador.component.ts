import { Component, OnInit } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ver-equipo-coordinador',
  templateUrl: './ver-equipo-coordinador.component.html',
  styleUrls: ['./ver-equipo-coordinador.component.scss']
})
export class VerEquipoCoordinadorComponent implements OnInit {

  tablaTestigos: Boolean = false;
  dropdownSettingsStations: IDropdownSettings = {};
  dropdownSettingsTables: IDropdownSettings = {};
  dataZones: any = [];
  dataStations: any = [];
  dataTables: any = [];
  listTestigos: any = [];
  selectedTable: any = [];

  constructor(private apiService: ApiService) { }


  ngOnInit(): void {
    this.getPuestos();

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

  onItemSelectStation(item: any) {
    this.tablaTestigos = false;
    this.selectedTable = [];
    const codigo_unico = this.getCode(item);
    this.getMesas(codigo_unico);
  }

  onItemDeSelectStation() {
    this.tablaTestigos = false;
    this.selectedTable = [];
  }

  onItemSelectTable(item: any) {
    const codigo_unico = this.getCode(item);
    const data = { mesa: codigo_unico }
    this.getTestigoMesa(data);
    this.tablaTestigos = true;
  }

  onItemDeSelectTable() {
    this.tablaTestigos = false;
  }

  getPuestos() {
    this.apiService.getStationsTestigo().subscribe((resp: any) => {
      this.dataStations = resp;
    }, (err: any) => {
      this.showError(err);
    })
  }

  getMesas(data: any) {
    this.apiService.getTablesTestigo().subscribe((resp: any) => {
      this.dataTables = resp.filter((dataTable: any) => dataTable.codigo_puesto_votacion == data);
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
