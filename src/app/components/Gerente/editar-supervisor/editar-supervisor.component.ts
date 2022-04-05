import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import Swal from 'sweetalert2';
import { filter } from 'rxjs';

@Component({
  selector: 'app-editar-supervisor',
  templateUrl: './editar-supervisor.component.html',
  styleUrls: ['./editar-supervisor.component.scss']
})
export class EditarSupervisorComponent implements OnInit {

  dropdownSettingsMunicipal: IDropdownSettings = {};
  dropdownSettingsZone: IDropdownSettings = {};
  municipioAssign: any = [];
  zoneAssign: any = [];
  dataMunicipals: any = [];
  dataZones: any = [];
  dataFiltered: any = [];

  supervisor: any = {
    tipo_documento_id: '',
    numero_documento: '',
    genero_id: '',
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    zonas: [],
  }

  idSupervisor: any;
  subscriber: any;

  constructor(private apiService: ApiService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.getSupervisor();
    this.getMunicipalSupervisor();
    this.getZoneSupervisor();

    this.subscriber = this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe((event) => {
      window.location.reload();
    });

    this.dropdownSettingsMunicipal = {
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

    this.dropdownSettingsZone = {
      noDataAvailablePlaceholderText: "No hay informacion disponible",
      enableCheckAll: false,
      singleSelection: false,
      idField: 'codigo_unico',
      textField: 'codigo_unico',
      itemsShowLimit: 2,
      searchPlaceholderText: "Buscar",
      allowSearchFilter: true
    };


  }

  onItemSelect(item: any) {
    this.zoneAssign = [];
    this.dataFiltered = this.dataZones.filter((dataZones: any) => dataZones.codigo_municipio_votacion == item.codigo_unico);
  }

  onItemDeSelect(item: any) {
    this.dataFiltered = [];
    this.zoneAssign = [];
  }

  getMunicipalSupervisor() {
    this.apiService.getMunicipalGerente().subscribe((resp: any) => {
      console.log(resp)
      this.dataMunicipals = resp;
    }, (err: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message,
      })
    })
  }

  getZoneSupervisor() {
    this.apiService.getZoneGerente().subscribe((resp: any) => {
      this.dataZones = resp;
      console.log(resp)
      console.log(this.municipioAssign)
      console.log(this.dataZones)
      if (this.municipioAssign.length > 0) {
        this.dataFiltered = this.dataZones.filter((dataZones: any) => dataZones.codigo_municipio_votacion == this.municipioAssign[0].codigo_unico);
      }
      console.log(this.dataFiltered)
    }, (err: any) => Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: err.message,
    }));
  }

  getSupervisor() {
    this.idSupervisor = this.activatedRoute.snapshot.params['id'];
    this.apiService.getSupervisor(this.idSupervisor).subscribe((resp: any) => {
      const { municipios_asignados, supervisor, zonas_asignadas } = resp;
      this.supervisor.nombres = supervisor.nombres;
      this.supervisor.apellidos = supervisor.apellidos;
      this.supervisor.genero_id = supervisor.genero_id;
      this.supervisor.tipo_documento_id = supervisor.tipo_documento_id;
      this.supervisor.numero_documento = supervisor.numero_documento;
      this.supervisor.email = supervisor.email;
      this.supervisor.password = supervisor.password;
      this.zoneAssign = zonas_asignadas;
      this.municipioAssign = municipios_asignados;
      console.log(resp);
    }, (err: any) => {
      console.log(err)
    })
  }

  updateSupervisor() {
    console.log(this.supervisor);
    let { nombres, apellidos, genero_id, tipo_documento_id, numero_documento, email } = this.supervisor;

    if (nombres && apellidos && genero_id && tipo_documento_id && numero_documento && email) {
      const codigo_unico = this.getCodeZones();
      this.supervisor.zonas = codigo_unico;

      this.apiService.updateSupervisor(this.idSupervisor, this.supervisor).subscribe((resp: any) => {
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
        text: "Los campos no pueden estar vacios a excepción de municipio y zona.",
      });
    }

  }

  getCodeZones() {
    return this.zoneAssign.map((zoneAssign: any) => {
      const { codigo_unico } = zoneAssign;
      return codigo_unico;
    });
  }

}
