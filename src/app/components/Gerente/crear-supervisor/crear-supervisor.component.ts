import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-crear-supervisor',
  templateUrl: './crear-supervisor.component.html',
  styleUrls: ['./crear-supervisor.component.scss']
})
export class CrearSupervisorComponent implements OnInit {

  supervisor: any = {
    tipo_documento_id: '',
    numero_documento: '',
    genero_id: '',
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    zonas: []
  }

  dropdownSettingsZone: IDropdownSettings = {};
  dropdownSettingsMunicipal: IDropdownSettings = {};
  dataZones: any = [];
  dataMunicipals: any = [];
  selectedZones: any = [];
  dataFiltered: any = [];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.getMunicipalGerente();
    this.getZoneGerente();
    this.dropdownSettingsMunicipal = {
      noDataAvailablePlaceholderText: "No hay informacion disponible",
      limitSelection: 1,
      enableCheckAll: false,
      singleSelection: false,
      idField: 'codigo_unico',
      textField: 'nombre',
      itemsShowLimit: 3,
      searchPlaceholderText: "Buscar",
      allowSearchFilter: true
    };
    this.dropdownSettingsZone = {
      noDataAvailablePlaceholderText: "No hay informacion disponible",
      enableCheckAll: false,
      singleSelection: false,
      idField: 'codigo_unico',
      textField: 'codigo_unico',
      itemsShowLimit: 3,
      searchPlaceholderText: "Buscar",
      allowSearchFilter: true
    };
  }

  getZoneGerente() {
    this.apiService.getZoneGerente().subscribe((resp: any) => {
      this.dataZones = resp;
    }, (err: any) => Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: err.message,
    }));
  }

  getMunicipalGerente() {
    this.apiService.getMunicipalGerente().subscribe(resp => {
      this.dataMunicipals = resp;
    }, (err: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message,
      });
    });
  }

  onItemSelect(item: any) {
    this.selectedZones = [];
    this.dataFiltered = this.dataZones.filter((dataMunicipal: any) => dataMunicipal.codigo_municipio_votacion == item.codigo_unico);
  }
  onItemDeSelect() {
    this.dataFiltered = [];
    this.selectedZones = [];
  }

  createSupervisor() {
    console.log(this.supervisor);

    const { tipo_documento_id, numero_documento, genero_id, nombres, apellidos, email, password } = this.supervisor;

    if (tipo_documento_id.trim() && numero_documento && genero_id.trim() && nombres.trim() && apellidos.trim() && email.trim() && password.trim()) {

      const codigo_unico = this.getCodeZones();

      this.supervisor.zonas = codigo_unico;

      this.apiService.createSupervisor(this.supervisor).subscribe((resp: any) => {

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
        text: "Los campos no pueden estar vacios a excepción de municipio y zona.",
      });
    }

  }

  getCodeZones() {
    return this.selectedZones.map((selectedZone: any) => {
      const { codigo_unico } = selectedZone;
      return codigo_unico;
    });
  }

}
