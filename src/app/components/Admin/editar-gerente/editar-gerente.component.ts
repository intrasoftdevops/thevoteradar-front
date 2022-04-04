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

  dropdownSettingsMunicipal: IDropdownSettings = {};
  dropdownSettingsDepartment: IDropdownSettings = {};
  dataDepartments: any = [];
  dataMunicipals: any = [];
  municipioAssign: any = [];
  departmentAssign: any = [];
  assignedItems: any = [];
  dataFiltered: any = [];

  gerente: any = {
    tipo_documento_id: '',
    numero_documento: '',
    genero_id: '',
    nombres: '',
    apellidos: '',
    email: '',
    municipios: [],
  }
  idGerente: any;
  subscriber: any;

  constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.getGerente();
    this.getDepartmentAdmin();
    this.getMunicipalAdmin();

    this.subscriber = this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event) => {
      window.location.reload();
    });

    this.dropdownSettingsDepartment = {
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
      enableCheckAll: false,
      singleSelection: false,
      idField: 'codigo_unico',
      textField: 'nombre',
      itemsShowLimit: 2,
      searchPlaceholderText: "Buscar",
      allowSearchFilter: true
    };
  }

  getDepartmentAdmin() {
    this.apiService.getDepartmentAdmin().subscribe((resp: any) => {
      console.log(resp)
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
      console.log(resp);
      this.dataMunicipals = resp;
      this.dataFiltered = this.dataMunicipals;
    }, (err: any) => {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message,
      });
    });
  }

  ngOnDestroy() {
    this.subscriber?.unsubscribe();
  }


  onItemSelect(item: any) {
    this.municipioAssign = [];
    this.dataFiltered = this.dataMunicipals.filter((dataMunicipal: any) => dataMunicipal.codigo_departamento_votacion == item.codigo_unico);
  }

  onItemDeSelect() {
    this.dataFiltered = [];
    this.municipioAssign = [];
  }

  getGerente() {
    this.idGerente = this.activatedRoute.snapshot.params['id'];
    this.apiService.getGerente(this.idGerente).subscribe((resp: any) => {
      const { gerente, municipios_asignados, departamentos_asignados } = resp;
      this.gerente.nombres = gerente.nombres;
      this.gerente.apellidos = gerente.apellidos;
      this.gerente.genero_id = gerente.genero_id;
      this.gerente.email = gerente.email;
      this.gerente.tipo_documento_id = gerente.tipo_documento_id;
      this.gerente.numero_documento = gerente.numero_documento;
      this.municipioAssign = municipios_asignados;
      this.departmentAssign = departamentos_asignados;
      console.log(resp);
    })
  }

  updateGerente() {
    console.log(this.gerente);

    let { nombres, apellidos, genero_id, tipo_documento_id, numero_documento, email } = this.gerente;

    if (nombres && apellidos && genero_id && tipo_documento_id && numero_documento && email) {
      const codigo_unico = this.getCodeMunicipals();
      this.gerente.municipios = codigo_unico;

      this.apiService.updateGerente(this.idGerente, this.gerente).subscribe((resp: any) => {
        Swal.fire({
          icon: 'success',
          title: resp.res,
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
    return this.municipioAssign.map((selectedMunicipal: any) => {
      const { codigo_unico } = selectedMunicipal;
      return codigo_unico;
    });
  }



}
