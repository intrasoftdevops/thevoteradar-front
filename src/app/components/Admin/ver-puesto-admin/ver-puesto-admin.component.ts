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

  dropdownSettingsDepartments: IDropdownSettings = {};
  dataDepartments: any = [];
  data:any = {
    gerentes:{
      cantidad_gerentes_existentes:'',
      cantidad_gerentes_necesitados:'',
      cantidad_gerentes_por_asignar:''
    },
    supervisores:{
      cantidad_supervisores_existentes:'',
      cantidad_supervisores_necesitados:'',
      cantidad_supervisores_por_asignar:''
    },
    coordinadores:{
      cantidad_coordinadores_existentes:'',
      cantidad_coordinadores_necesitados:'',
      cantidad_coordinadores_por_asignar:''
    },
    testigos:{
      cantidad_testigos_existentes:'',
      cantidad_testigos_necesitados:'',
      cantidad_testigos_por_asignar:''
    }
  };

  constructor(private apiService: ApiService) { }

  ngOnInit() {
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

  }

  onItemSelectDepartment(item: any) {

    const codigo_unico = this.getCode(item);
    const data = { departamento: codigo_unico };
    this.getNecesitadosDepartamento(data);
  }

  getDepartmentAdmin() {
    this.apiService.getDepartmentAdmin().subscribe((resp: any) => {
      this.dataDepartments = resp;
    }, (err: any) => {
      this.showError(err);
    })
  }

  getNecesitadosDepartamento(data: any) {
    this.apiService.getNecesitadosDepartamento(data).subscribe((resp: any) => {
      console.log(resp)
      this.data=resp;
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
