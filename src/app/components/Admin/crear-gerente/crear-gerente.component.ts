import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-crear-gerente',
  templateUrl: './crear-gerente.component.html',
  styleUrls: ['./crear-gerente.component.scss']
})
export class CrearGerenteComponent implements OnInit {

  selectedMunicipals: any = [];
  dropdownSettingsDepartment: IDropdownSettings = {};
  dropdownSettingsMunicipal: IDropdownSettings = {};
  dataMunicipals: any = [];
  dataDepartments: any = [];
  dataFiltered: any = [];

  gerente: any = {
    nombres: '',
    apellidos: '',
    genero_id: '',
    tipo_documento_id: '',
    numero_documento: '',
    email: '',
    password: '',
    municipios: [],
  }

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.getDepartmentAdmin();
    this.getMunicipalAdmin();
    this.dropdownSettingsDepartment = {
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
    this.dropdownSettingsMunicipal = {
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

  onItemSelectDepartment(item: any) {
    this.selectedMunicipals = [];
    this.dataFiltered = this.dataMunicipals.filter((dataMunicipal: any) => dataMunicipal.codigo_departamento_votacion == item.codigo_unico);
  }

  onItemDeSelectDepartment() {
    this.dataFiltered = [];
    this.selectedMunicipals = [];
  }

  getDepartmentAdmin() {
    this.apiService.getDepartmentAdmin().subscribe((resp: any) => {
      this.dataDepartments = resp;
    }, (err: any) => {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message,
      });
    })
  }

  getMunicipalAdmin() {
    this.apiService.getMunicipalAdmin().subscribe((resp: any) => {
      this.dataMunicipals = resp;
    }, (err: any) => {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message,
      });
    });
  }

  createGerente() {

    let { nombres, apellidos, genero_id, tipo_documento_id, numero_documento, email, password } = this.gerente;

    if (nombres.trim() && apellidos.trim() && genero_id.trim() && tipo_documento_id.trim() && numero_documento && email.trim() && password.trim()) {

      const codigo_unico = this.getCodeMunicipals();

      this.gerente.municipios = codigo_unico;

      this.apiService.createGerente(this.gerente).subscribe((resp: any) => {

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

  getCodeMunicipals() {
    return this.selectedMunicipals.map((selectedMunicipal: any) => {
      const { codigo_unico } = selectedMunicipal;
      return codigo_unico;
    });
  }

}
