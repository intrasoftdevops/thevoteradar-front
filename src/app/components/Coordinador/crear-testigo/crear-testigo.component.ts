import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-crear-testigo',
  templateUrl: './crear-testigo.component.html',
  styleUrls: ['./crear-testigo.component.scss']
})
export class CrearTestigoComponent implements OnInit {

  dropdownSettingsStation: IDropdownSettings = {};
  dropdownSettingsTable: IDropdownSettings = {};
  dataStations: any = [];
  dataFiltered: any = [];
  dataTables: any = [];
  selectedTables: any = [];

  testigo: any = {
    tipo_documento_id: '',
    numero_documento: '',
    genero_id: '',
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    mesas: [],
  }

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.getStationsTestigo();
    this.getTablesTestigo();

    this.dropdownSettingsStation = {
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
    this.dropdownSettingsTable = {
      noDataAvailablePlaceholderText: "No hay informacion disponible",
      clearSearchFilter: false,
      enableCheckAll: false,
      singleSelection: false,
      idField: 'codigo_unico',
      textField: 'numero_mesa',
      itemsShowLimit: 2,
      searchPlaceholderText: "Buscar",
      allowSearchFilter: true
    };

  }
  onItemSelect(item: any) {
    this.dataFiltered = [];
    this.selectedTables = [];
    this.dataFiltered = this.dataTables.filter((dataTable: any) => dataTable.codigo_puesto_votacion == item.codigo_unico);
    console.log(this.dataFiltered)
  }
  onItemDeSelect() {
    this.dataFiltered = [];
    this.selectedTables = [];
  }

  getStationsTestigo() {
    this.apiService.getStationsTestigo().subscribe((resp: any) => {
      this.dataStations = resp;
    }, (err: any) => {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message,
      });
    })
  }

  getTablesTestigo() {
    this.apiService.getTablesTestigo().subscribe((resp: any) => {
      this.dataTables = resp;
    }, (err: any) => {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message,
      });
    })
  }

  createTestigo() {
    console.log(this.testigo);
    let { nombres, apellidos, genero_id, tipo_documento_id, numero_documento, email, password } = this.testigo;

    if (nombres.trim() && apellidos.trim() && genero_id.trim() && tipo_documento_id.trim() && numero_documento && email.trim() && password.trim()) {

      const codigo_unico = this.getCodeTables();

      this.testigo.mesas = codigo_unico;

      this.apiService.createTestigo(this.testigo).subscribe((resp: any) => {

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
      })


    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: "Los campos no pueden estar vacios a excepción de departamento y municipio.",
      });
    }

  }

  getCodeTables() {
    return this.selectedTables.map((selectedMunicipal: any) => {
      const { codigo_unico } = selectedMunicipal;
      return codigo_unico;
    });
  }

}
