import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { ApiService } from '../../../services/api/api.service';
import { AlertService } from '../../../services/alert/alert.service';

@Component({
  selector: 'app-ver-puesto-supervisor',
  templateUrl: './ver-puesto-supervisor.component.html',
  styleUrls: ['./ver-puesto-supervisor.component.scss']
})
export class VerPuestoSupervisorComponent implements OnInit {

  tabla: boolean = false;
  dataZones: any = [];
  dataStations: any = [];
  selectedStation: any = [];
  coordinadores: any = {};
  testigos: any = {};

  constructor(private apiService: ApiService, private alertService: AlertService) { }

  ngOnInit(): void {
    this.getZonas();

  }

  getSelectedZone(item: any) {
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { zona: codigo_unico };
      this.getNecesitadosZona(data);
      this.tabla = true;
    } else {
      this.tabla = false;
    }
  }

  getNecesitadosZona(data: any) {
    this.apiService.getNecesitadosZona(data).subscribe((resp: any) => {
      console.log(resp)
      this.coordinadores = resp.coordinadores;
      this.testigos = resp.testigos;
      this.tabla = true;
    })
  }

  createPercent(existentes: any, necesitados: any) {
    const percent = (existentes / necesitados) * 100;
    if (necesitados == 0) {
      return '(0%)';
    }
    return `(${Math.round(percent * 100) / 100}%)`;
  }

  validObjects() {
    if ((Object.keys(this.coordinadores).length !== 0) && (Object.keys(this.testigos).length !== 0)) {
      return true;
    }
    return false;
  }

  getZonas() {
    this.apiService.getZonesSupervisor().subscribe((resp: any) => {
      this.dataZones = resp;
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

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

}
