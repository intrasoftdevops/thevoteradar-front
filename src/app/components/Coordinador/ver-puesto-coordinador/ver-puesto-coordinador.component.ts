import { Component, OnInit } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import Swal from 'sweetalert2';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-ver-puesto-coordinador',
  templateUrl: './ver-puesto-coordinador.component.html',
  styleUrls: ['./ver-puesto-coordinador.component.scss']
})
export class VerPuestoCoordinadorComponent implements OnInit {

  tabla: boolean = false;
  dropdownSettingsStations: IDropdownSettings = {};
  dataStations: any = [];
  testigosNecesitados: any = {
    cantidad_testigos_hay: '',
    cantidad_testigos_necesitada: ''
  };

  constructor(private apiService: ApiService) { }

  ngOnInit() {
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

  }

  onItemSelectStation(item: any) {
    const codigo_unico = this.getCode(item);
    const data = { puesto: codigo_unico }
    this.tabla = true;
  }

  onItemDeSelectStation() {
    this.tabla = false;
  }

  getPuestos() {
    this.apiService.getStationsTestigo().subscribe((resp: any) => {
      this.dataStations = resp;
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
