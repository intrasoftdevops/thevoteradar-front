import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-ver-puesto-gerente',
  templateUrl: './ver-puesto-gerente.component.html',
  styleUrls: ['./ver-puesto-gerente.component.scss']
})
export class VerPuestoGerenteComponent implements OnInit {

  tabla: string = "ninguna";
  dataMunicipals: any = [];
  dataZones: any = [];
  dataStations: any = [];
  selectedZone: any = [];
  selectedStation: any = [];
  supervisoresNecesitados: any = {
    cantidad_supervisores_hay: '',
    cantidad_supervisores_necesitada: ''
  };
  coordinadoresNecesitados: any = {
    cantidad_coordinadores_hay: '',
    cantidad_coordinadores_necesitada: ''
  };
  testigosNecesitados: any = {
    cantidad_testigos_hay: '',
    cantidad_testigos_necesitada: ''
  };

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.getMunicipalAdmin();

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

  getPuestos(data: any) {
    this.apiService.getPuestosySupervisores(data).subscribe((resp: any) => {
      const { puestos } = resp;
      this.dataStations = puestos;
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
