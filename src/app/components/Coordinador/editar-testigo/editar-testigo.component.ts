import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import Swal from 'sweetalert2';
import { filter } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-editar-testigo',
  templateUrl: './editar-testigo.component.html',
  styleUrls: ['./editar-testigo.component.scss']
})
export class EditarTestigoComponent implements OnInit {

  dropdownSettingsStation: IDropdownSettings = {};
  dropdownSettingsTable: IDropdownSettings = {};
  stationAssign: any = [];
  tableAssign: any = [];
  dataStations: any = [];
  dataFiltered: any = [];
  dataTables: any = [];

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
  idTestigo: any;
  subscriber: any;

  constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.getTestigo();
    this.getStationsTestigo();
    this.getTablesTestigo();

    this.subscriber = this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event) => {
      window.location.reload();
    });

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
    this.tableAssign = [];
    this.dataFiltered = [];
    this.dataFiltered = this.dataTables.filter((dataTable: any) => dataTable.codigo_puesto_votacion == item.codigo_unico);
  }

  onItemDeSelect(item: any) {
    this.tableAssign = [];
    this.dataFiltered = [];
  }

  getTestigo() {
    this.idTestigo = this.activatedRoute.snapshot.params['id'];
    this.apiService.getTestigo(this.idTestigo).subscribe((resp: any) => {
      const { testigo, puesto_asignado, mesas_asignadas } = resp;
      this.testigo.nombres = testigo.nombres;
      this.testigo.apellidos = testigo.apellidos;
      this.testigo.genero_id = testigo.genero_id;
      this.testigo.email = testigo.email;
      this.testigo.password = testigo.password;
      this.testigo.tipo_documento_id = testigo.tipo_documento_id;
      this.testigo.numero_documento = testigo.numero_documento;
      this.stationAssign = puesto_asignado;
      this.tableAssign = mesas_asignadas;
      console.log(resp);
    }, (err: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message,
      });
    })
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
      if (this.stationAssign.length > 0) {
        this.dataFiltered = this.dataTables.filter((dataTable: any) => dataTable.codigo_puesto_votacion == this.stationAssign[0].codigo_unico);
      }
      console.log(resp)
    }, (err: any) => {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message,
      });
    })
  }

  updateTestigo() {
    let { nombres, apellidos, genero_id, tipo_documento_id, numero_documento, email } = this.testigo;

    if (nombres && apellidos && genero_id && tipo_documento_id && numero_documento && email) {
      const codigo_unico = this.getCodeTables();
      this.testigo.mesas = codigo_unico;
      
      this.apiService.updateTestigo(this.idTestigo, this.testigo).subscribe((resp: any) => {
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

  getCodeTables() {
    return this.tableAssign.map((tableAssign: any) => {
      const { codigo_unico } = tableAssign;
      return codigo_unico;
    });
  }

}
