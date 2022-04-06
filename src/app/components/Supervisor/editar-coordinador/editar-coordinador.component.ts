import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import Swal from 'sweetalert2';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { filter } from 'rxjs';

@Component({
  selector: 'app-editar-coordinador',
  templateUrl: './editar-coordinador.component.html',
  styleUrls: ['./editar-coordinador.component.scss']
})
export class EditarCoordinadorComponent implements OnInit {

  dropdownSettingsStation: IDropdownSettings = {};
  dropdownSettingsZone: IDropdownSettings = {};
  dataZones: any = [];
  dataStations: any = [];
  puestoAssign: any = [];
  zoneAssign: any = [];
  dataFiltered: any = [];

  coordinador: any = {
    tipo_documento_id: '',
    numero_documento: '',
    genero_id: '',
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    puestos: [],
  }

  idCoordinador: any;
  subscriber: any;

  constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.getCoordinador();
    this.getZonesSupervisor();
    this.getStationsSupervisor();

    this.subscriber = this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event) => {
      window.location.reload();
    });

    this.dropdownSettingsZone = {
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

    this.dropdownSettingsStation = {
      noDataAvailablePlaceholderText: "No hay informacion disponible",
      enableCheckAll: false,
      singleSelection: false,
      idField: 'codigo_unico',
      textField: 'nombre',
      itemsShowLimit: 2,
      searchPlaceholderText: "Buscar",
      allowSearchFilter: true
    };

  }

  onItemSelect(item: any) {
    this.puestoAssign = [];
    this.dataFiltered = [];
    this.dataFiltered = this.dataStations.filter((dataStation: any) => dataStation.codigo_zona_votacion == item.codigo_unico);
  }

  onItemDeSelect(item: any) {
    this.puestoAssign = [];
    this.dataFiltered = [];
  }

  getZonesSupervisor() {
    this.apiService.getZonesSupervisor().subscribe((resp: any) => {
      this.dataZones = resp;
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

  getStationsSupervisor() {
    this.apiService.getStationsCoordinador().subscribe((resp: any) => {
      this.dataStations = resp;
      console.log(this.zoneAssign)
      if (this.zoneAssign.length > 0) {
        this.dataFiltered = this.dataStations.filter((dataStation: any) => dataStation.codigo_zona_votacion == this.zoneAssign[0].codigo_unico);
      }
      console.log(this.dataFiltered)
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

  getCoordinador() {
    this.idCoordinador = this.activatedRoute.snapshot.params['id'];
    this.apiService.getCoordinador(this.idCoordinador).subscribe((resp: any) => {
      const { coordinador, puestos_asignados, zonas_asignadas } = resp;
      this.coordinador.nombres = coordinador.nombres;
      this.coordinador.apellidos = coordinador.apellidos;
      this.coordinador.genero_id = coordinador.genero_id;
      this.coordinador.tipo_documento_id = coordinador.tipo_documento_id;
      this.coordinador.numero_documento = coordinador.numero_documento;
      this.coordinador.email = coordinador.email;
      this.coordinador.password = coordinador.password;
      this.zoneAssign = zonas_asignadas;
      this.puestoAssign = puestos_asignados;
      console.log(resp)
    }, (err: any) => {
      console.log(err)
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message,
      });
    })
  }

  updateCoordinador() {
    console.log(this.coordinador);

    let { nombres, apellidos, genero_id, tipo_documento_id, numero_documento, email } = this.coordinador;

    if (nombres && apellidos && genero_id && tipo_documento_id && numero_documento && email) {
      const codigo_unico = this.getCodeStations();
      this.coordinador.puestos = codigo_unico;

      this.apiService.updateCoordinador(this.idCoordinador, this.coordinador).subscribe((resp: any) => {
        console.log(resp)
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

  getCodeStations() {
    return this.puestoAssign.map((puestoAssign: any) => {
      const { codigo_unico } = puestoAssign;
      return codigo_unico;
    });
  }

}
