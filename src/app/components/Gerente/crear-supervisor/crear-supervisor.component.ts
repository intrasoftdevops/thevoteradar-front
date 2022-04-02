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
    rol_id: 3,
    tipo_documento_id: '',
    numero_documento: '',
    estado_id: 1,
    genero_id: '',
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    cliente_id: 1,
  }
  zonas: any = [];
  dropdownList: any = [];
  selectedItems: any = [];
  dropdownSettings: IDropdownSettings = {};
  zonaSelect: any = [];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.apiService.getZoneGerente().subscribe((resp: any) => {
      this.zonas = resp;
      console.log(resp)
      this.zonaSelect = this.zonas.map((zona: any) => {
        const { codigo_unico, id } = zona;
        return { codigo_unico, id };
      });
      console.log(this.zonaSelect)
    }, (err: any) => Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: err,
    }));
    this.dropdownSettings = {
      enableCheckAll: false,
      singleSelection: false,
      idField: 'codigo_unico',
      textField: 'id',
      itemsShowLimit: 3,
      searchPlaceholderText: "Buscar",
      allowSearchFilter: true
    };
  }
  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

  createSupervisor() {
    console.log(this.supervisor);
    this.apiService.createUser(this.supervisor).subscribe((resp: any) => {
      console.log(resp);
      const { res, message } = resp;
      if (res == true) {
        Swal.fire(
          'Exitoso',
          message,
          'success'
        )
        Swal.fire(message)
      } else {
        console.log(resp);
        console.log("Algo salio mal")
        Swal.fire('La Contraseña o el Usuario son equivocados')
      }
    }, (err: any) => Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: err,
    }));
  }

}
