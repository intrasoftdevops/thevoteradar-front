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
  dropdownSettingsZone: IDropdownSettings = {};
  dropdownSettingsMunicipal: IDropdownSettings = {};
  zonaSelect: any = [];
  municipioAssign: any = [];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.apiService.getMunicipalAssignedGerente(this.apiService.getId()).subscribe((res: any) => {
      const { municipios_asignados } = res;
      this.municipioAssign = municipios_asignados.map((municipio: any) => {
        const { codigo_unico, nombre } = municipio;
        return { codigo_unico, nombre };
      });
      console.log(this.municipioAssign);
    })
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
    this.dropdownSettingsMunicipal = {
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

  }

}
