import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { ApiService } from '../../../services/api/api.service';
import { AlertService } from '../../../services/alert/alert.service';

@Component({
  selector: 'app-ver-puesto-gerente',
  templateUrl: './ver-puesto-gerente.component.html',
  styleUrls: ['./ver-puesto-gerente.component.scss']
})
export class VerPuestoGerenteComponent implements OnInit {

  tabla: boolean = false;
  dataMunicipals: any = [];
  dataZones: any = [];
  dataStations: any = [];
  selectedZone: any = [];
  selectedStation: any = [];
  supervisores: any = {};
  coordinadores: any = {};
  testigos: any = {};

  constructor(private apiService: ApiService, private alertService: AlertService) { }

  ngOnInit() {
    this.getMunicipalAdmin();
  }

  getSelectedMunicipal(item: any) {
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { municipio: codigo_unico };
      this.getNecesitadosMunicipio(data);
      this.tabla = true;
    } else {
      this.tabla = false;
    }
  }

  getMunicipalAdmin() {
    this.apiService.getMunicipalGerente().subscribe(resp => {
      this.dataMunicipals = resp;
    });
  }

  getNecesitadosMunicipio(data: any) {
    this.apiService.getNecesitadosMunicipio(data).subscribe((resp: any) => {
      console.log(resp)
      this.supervisores = resp.supervisores;
      this.coordinadores = resp.coordinadores;
      this.testigos = resp.testigos;
      this.tabla = true;
    })
  }

  textColor(existentes: any, necesitados: any) {
    if (existentes == necesitados) {
      return 'text-success';
    } else if (existentes < necesitados) {
      return 'text-primary';
    } else {
      return 'text-danger'
    }
  }

  createPercent(existentes: any, necesitados: any) {
    const percent = (existentes / necesitados) * 100;
    if (necesitados == 0) {
      return '(0%)';
    }
    return `(${Math.round(percent * 100) / 100}%)`;
  }

  validObjects() {
    if ((Object.keys(this.supervisores).length !== 0) && (Object.keys(this.coordinadores).length !== 0) && (Object.keys(this.testigos).length !== 0)) {
      return true;
    }
    return false;
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

}
