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

  dropdownList: any = [];
  selectedItems: any = [];
  dropdownSettings: IDropdownSettings = {};
  municipios: any = [];
  municipioSelect: any = [];
  idDepartamentoVotacion: any;

  gerente: any = {
    rol_id: 2,
    tipo_documento_id: '',
    numero_documento: '',
    estado_id: 1,
    genero_id: '',
    localidad_residencia: '',
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    cliente_id: 1,
  }

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.apiService.getMunicipalAdmin().subscribe((resp: any) => {
      this.municipios = resp;
      this.municipioSelect = this.municipios.map((municipio: any) => {
        const { codigo_unico, nombre } = municipio;
        return { codigo_unico, nombre };
      });
    }, err => console.log(err))
    this.dropdownSettings = {
      enableCheckAll: false,
      singleSelection: false,
      idField: 'codigo_unico',
      textField: 'nombre',
      itemsShowLimit: 3,
      searchPlaceholderText: "Buscar",
      allowSearchFilter: true
    };
  }

  onItemSelect(item: any) {
    this.selectedItems.push(item.codigo_unico);
  }

  onItemDeSelect(item: any) {
    const index = this.selectedItems.indexOf(item.codigo_unico);
    console.log(index);
    this.selectedItems.splice(index, 1);
    console.log(this.selectedItems);
  }

  createGerente() {

    if (this.selectedItems.length > 0) {
      this.gerente.estado_id = 2;
    }

    this.apiService.createUser(this.gerente).subscribe((resp: any) => {
      console.log("Crear gerente")
      console.log(resp);
      const { res, message, user_id } = resp;
      if (res == true) {
        Swal.fire(message);

        Swal.fire(
          'Exitoso!',
          message,
          'success'
        );

        const dataMunicipal = {
          municipios: this.selectedItems,
          gerente_id: user_id,

        }



        this.apiService.addMunicipals(dataMunicipal).subscribe((resp: any) => {
          console.log("Agregar municipios")
          console.log(resp);
        }, (err: any) => console.log(err));
        this.apiService.getDepartmentAdmin().subscribe((resp: any) => {
          console.log("Obtener departamento")
          console.log(resp);
          const { codigo_unico } = resp;
          this.idDepartamentoVotacion = codigo_unico;
          const dataDepartament = {
            c_departamento_votacion: this.idDepartamentoVotacion,
            gerente_id: user_id
          }

          console.log(dataDepartament);

          this.apiService.createDepartmentGerente(dataDepartament).subscribe((resp: any) => {
            console.log("Crear departamento gerente")
            console.log(resp);
          }, (err: any) => console.log(err));
        }, (err: any) => console.log(err));

      } else {
        console.log(resp);
        console.log("Algo salio mal")
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: "Algo salio mal",
        })
      }
    }, (err: any) => Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: err,
    }));
  }

}
