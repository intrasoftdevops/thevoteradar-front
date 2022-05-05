import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { AlertService } from '../../../services/alert/alert.service';

@Component({
  selector: 'app-ver-puesto-coordinador',
  templateUrl: './ver-puesto-coordinador.component.html',
  styleUrls: ['./ver-puesto-coordinador.component.scss']
})
export class VerPuestoCoordinadorComponent implements OnInit {

  tabla: boolean = false;
  percent:number = 0;
  dataStations: any = [];
  testigos: any = {};

  constructor(private apiService: ApiService, private alertService: AlertService) { }

  ngOnInit() {
    this.getPuestos();
  }

  getSelectedStation(item: any) {
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { puesto: codigo_unico };
      this.getNecesitadosPuesto(data);
      this.tabla = true;
    } else {
      this.tabla = false;
    }
  }

  getPuestos() {
    this.apiService.getStationsTestigo().subscribe((resp: any) => {
      this.dataStations = resp;
    })
  }

  getNecesitadosPuesto(data: any) {
    this.apiService.getNecesitadosPuesto(data).subscribe((resp: any) => {
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
    this.percent = Math.round((existentes / necesitados) * 100) / 100;
    if (necesitados == 0) {
      this.percent = 0;
      return `(${this.percent}%)`;
    }
    return `(${this.percent}%)`;
  }

  validObjects() {
    if ((Object.keys(this.testigos).length !== 0)) {
      return true;
    }
    return false;
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

}
