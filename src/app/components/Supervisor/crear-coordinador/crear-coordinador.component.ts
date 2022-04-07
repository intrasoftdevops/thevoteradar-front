import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-crear-coordinador',
  templateUrl: './crear-coordinador.component.html',
  styleUrls: ['./crear-coordinador.component.scss']
})
export class CrearCoordinadorComponent implements OnInit {

  selectedStations: any = [];
  dropdownSettingsZones: IDropdownSettings = {};
  dropdownSettingsStations: IDropdownSettings = {};
  dataZones: any = [];
  dataStations: any = [];
  dataFiltered: any = [];

  coordinador: any = {
    tipo_documento_id: '',
    numero_documento: '',
    genero_id: '',
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    puestos: [],
  }

  constructor(private apiService: ApiService) { }

  dropdownSettings: IDropdownSettings = {};
  ngOnInit() {
    this.getZonesSupervisor();
    this.getStationCoordinador();
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
      singleSelection: false,
      idField: 'codigo_unico',
      textField: 'nombre',
      itemsShowLimit: 2,
      searchPlaceholderText: "Buscar",
      allowSearchFilter: true
    };
  }

  onItemSelect(item: any) {
    this.dataFiltered = [];
    this.selectedStations = [];
    this.dataFiltered = this.dataStations.filter((dataStation: any) => dataStation.codigo_zona_votacion == item.codigo_unico);
  }
  onItemDeSelect() {
    this.dataFiltered = [];
    this.selectedStations = [];
  }


  getZonesSupervisor() {
    this.apiService.getZonesSupervisor().subscribe((resp: any) => {
      this.dataZones = resp;
      console.log(resp)
    }, (err: any) => {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message,
      });
    })
  }

  getStationCoordinador() {
    this.apiService.getStationsCoordinador().subscribe((resp: any) => {
      this.dataStations = resp;
      console.log(resp)
    }, (err: any) => {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message,
      });
    })
  }

  createCoordinador() {
    console.log(this.dataFiltered)
    let { nombres, apellidos, genero_id, tipo_documento_id, numero_documento, email, password } = this.coordinador;

    if (nombres.trim() && apellidos.trim() && genero_id.trim() && tipo_documento_id.trim() && numero_documento && email.trim() && password.trim()) {

      const codigo_unico = this.getCodeStations();

      this.coordinador.puestos = codigo_unico;

      console.log(this.coordinador);

      this.apiService.createCoordinador(this.coordinador).subscribe((resp: any) => {

        console.log(resp);

        Swal.fire({
          icon: 'success',
          title: resp.message,
          confirmButtonText: 'Ok',
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        })

      }, (err: any) => {
        console.log(err);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: err.message,
        });
      });

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: "Los campos no pueden estar vacios a excepción de departamento y municipio.",
      });
    }


  }

  getCodeStations() {
    return this.selectedStations.map((selectedStation: any) => {
      const { codigo_unico } = selectedStation;
      return codigo_unico;
    });
  }

}
