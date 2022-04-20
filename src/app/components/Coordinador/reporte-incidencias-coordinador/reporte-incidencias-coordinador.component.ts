import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-reporte-incidencias-coordinador',
  templateUrl: './reporte-incidencias-coordinador.component.html',
  styleUrls: ['./reporte-incidencias-coordinador.component.scss']
})
export class ReporteIncidenciasCoordinadorComponent implements OnInit {

  dataIncidenciasAbiertas: any = [];
  dataIncidenciasCerradas: any = [];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.getIncidenciasDeCoordinador();
  }

  getIncidenciasDeCoordinador() {
    this.apiService.getIncidenciasDeCoordinador().subscribe((resp: any) => {
      //this.dataIncidencias = resp;
      this.dataIncidenciasAbiertas = resp.filter((incidencia: any) => {
        return incidencia.estado === 0;
      }
      );
      this.dataIncidenciasCerradas = resp.filter((incidencia: any) => {
        return incidencia.estado === 1;
      }
      );
      console.log(resp)
    }, (err: any) => {
      console.log(err)
    })
  }

}
