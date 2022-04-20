import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ver-equipo-gerente',
  templateUrl: './ver-equipo-gerente.component.html',
  styleUrls: ['./ver-equipo-gerente.component.scss']
})
export class VerEquipoGerenteComponent implements OnInit {

  constructor(private apiService: ApiService) { }

  tabla: string = "ninguna";
  dataMunicipals: any = [];
  dataZones: any = [];
  dataStations: any = [];
  dataTables: any = [];
  listSupervisores: any = [];
  listCoordinadores: any = [];
  listTestigos: any = [];
  selectedZone: any = [];
  selectedStation: any = [];
  selectedTable: any = [];


  ngOnInit(): void {
    this.getMunicipalAdmin();
  }

  getSelectedMunicipal(item: any) {
    this.selectedZone = [];
    this.selectedStation = [];
    this.selectedTable = [];
    if (item) {
      const codigo_unico = this.getCode(item);
      this.getZonas(codigo_unico);
      this.tabla = "ninguna";
    } else {
      this.dataZones = [];
      this.tabla = "ninguna"
    }
  }

  getSelectedZone(item: any) {
    this.selectedStation = [];
    this.selectedTable = [];
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { zona: codigo_unico }
      this.getPuestosySupervisores(data);
      this.tabla = "supervisor";
    } else {
      this.dataStations = [];
      this.tabla = "ninguna"
    }
  }

  getSelectedStation(item: any) {
    this.selectedTable = [];
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { puesto: codigo_unico }
      this.getMesasyCoordinadores(data);
      this.tabla = "coordinador";
    } else {
      this.dataTables = [];
      this.tabla = "supervisor"
    }
  }

  getSelectedTable(item: any) {
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { mesa: codigo_unico }
      this.getTestigoMesa(data);
      this.tabla = "testigo";
    } else {
      this.tabla = "coordinador"
    }
  }

  getMunicipalAdmin() {
    this.apiService.getMunicipalGerente().subscribe(resp => {
      this.dataMunicipals = resp;
    }, (err: any) => {
      this.showError(err);
    });
  }

  getZonas(data: any) {
    this.apiService.getZoneGerente().subscribe((resp: any) => {
      this.dataZones = resp.filter((dataZone: any) => dataZone.codigo_municipio_votacion == data);
    }, (err: any) => {
      this.showError(err);
    });
  }

  getPuestosySupervisores(data: any) {
    this.apiService.getPuestosySupervisores(data).subscribe((resp: any) => {
      const { puestos, supervisores } = resp;
      this.dataStations = puestos;
      this.listSupervisores = supervisores;
    }, (err: any) => {
      this.showError(err);
    })
  }

  getMesasyCoordinadores(data: any) {
    this.apiService.getMesasyCoordinadores(data).subscribe((resp: any) => {
      const { mesas, coordinadores } = resp;
      console.log(resp)
      this.dataTables = mesas;
      this.listCoordinadores = coordinadores;
    }, (err: any) => {
      this.showError(err);
    })
  }

  getTestigoMesa(data: any) {
    this.apiService.getTestigoMesa(data).subscribe((resp: any) => {
      const { testigos } = resp;
      this.listTestigos = testigos;
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
