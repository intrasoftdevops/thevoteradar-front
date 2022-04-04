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

  coordinador: any = {
    rol_id: 4,
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

  constructor(private apiService: ApiService) { }

  dropdownList: any = [];
  selectedItems: any = [];
  dropdownSettings: IDropdownSettings = {};
  ngOnInit() {
    this.dropdownList = [
      { item_id: 1, item_text: 'Puesto 1' },
      { item_id: 2, item_text: 'Puesto 2' },
      { item_id: 3, item_text: 'Puesto 3' },
      { item_id: 4, item_text: 'Puesto 4' },
      { item_id: 5, item_text: 'Puesto 5' }
    ];
    this.dropdownSettings = {
      enableCheckAll: false,
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
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

  createCoordinador() {
    console.log(this.coordinador);
  }

}
