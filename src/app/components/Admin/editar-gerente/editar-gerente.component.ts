import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { filter } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-gerente',
  templateUrl: './editar-gerente.component.html',
  styleUrls: ['./editar-gerente.component.scss']
})
export class EditarGerenteComponent implements OnInit {

  dropdownList: any = [];
  selectedItems: any = [];
  dropdownSettings: IDropdownSettings = {};
  municipios: any = [];
  municipioSelect: any = [];
  municipioAssign: any = [];
  assignedItems: any = [];
  sendMunicipals: any = [];

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
    cliente_id: 1,
  }
  idGerente: any;
  subscriber: any;

  constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.getGerente();

    this.subscriber = this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.getGerente();
    });

    this.apiService.getMunicipalAdmin().subscribe((resp: any) => {
      this.municipios = resp;
      console.log(resp)
      this.municipioSelect = this.municipios.map((municipio: any) => {
        const { codigo_unico, nombre } = municipio;
        return { codigo_unico, nombre };
      });
    }, (err: any) => Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: err,
    }))
    this.dropdownSettings = {
      enableCheckAll: false,
      singleSelection: false,
      idField: 'codigo_unico',
      textField: 'nombre',
      itemsShowLimit: 2,
      searchPlaceholderText: "Buscar",
      allowSearchFilter: true
    };
  }

  ngOnDestroy() {
    this.subscriber?.unsubscribe();
  }


  onItemSelect(item: any) {
    this.sendMunicipals.push(item.codigo_unico);
    console.log(this.sendMunicipals);
  }

  onItemDeSelect(item: any) {
    const index = this.sendMunicipals.indexOf(item.codigo_unico);
    this.sendMunicipals.splice(index, 1);
    console.log(this.sendMunicipals)
  }

  getGerente() {
    this.idGerente = this.activatedRoute.snapshot.params['id'];
    this.apiService.getUserById(this.idGerente).subscribe((res: any) => {
      this.gerente.nombres = res.nombres;
      this.gerente.apellidos = res.apellidos;
      this.gerente.genero_id = res.genero_id;
      this.gerente.tipo_documento_id = res.tipo_documento_id;
      this.gerente.numero_documento = res.numero_documento;
      this.gerente.email = res.email;
      this.apiService.getMunicipalAssignedGerente(res.id).subscribe((res: any) => {
        const { municipios_asignados } = res;
        this.municipioAssign = municipios_asignados.map((municipio: any) => {
          const { codigo_unico, nombre } = municipio;
          return { codigo_unico, nombre };
        });
        console.log(this.municipioAssign)
        this.assignedItems = this.municipioAssign.map((municipio: any) => {
          const { codigo_unico } = municipio;
          return codigo_unico;
        });
        console.log(this.assignedItems)
        this.sendMunicipals = this.assignedItems;
      }, (err: any) => Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err,
      }))
    }, (err: any) => Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: err,
    }));
  }

  updateGerente() {

    if (this.sendMunicipals.length > 0) {
      this.gerente.estado_id = 2;
    }

    console.log(this.gerente);

    this.apiService.updateGerente(this.gerente, this.idGerente).subscribe((res: any) => {
      Swal.fire(
        'Exitoso!',
        "Cuenta editada exitosamente.",
        'success'
      );
      console.log(res)
    }, (err: any) => Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: err,
    }))

    const dataUpdateGerente = {
      gerente_id: this.idGerente,
      municipios: this.sendMunicipals,
    }
    console.log(dataUpdateGerente);
    this.apiService.updateMunicipal(dataUpdateGerente).subscribe((res: any) => {
      console.log(res)
    }, (err: any) => Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: err,
    }))
  }



}
