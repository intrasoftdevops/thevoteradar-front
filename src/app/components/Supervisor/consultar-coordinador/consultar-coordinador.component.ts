import { Component, OnInit } from '@angular/core';
import { AlertService } from '../../../services/alert/alert.service';
import { ApiService } from '../../../services/api/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consultar-coordinador',
  templateUrl: './consultar-coordinador.component.html',
  styleUrls: ['./consultar-coordinador.component.scss']
})
export class ConsultarCoordinadorComponent implements OnInit {

  listCoordinadorAsignados: any = [];
  listCoordinadorNoAsignados: any = [];
  listStations: any = [];

  constructor(private alertService: AlertService,private apiService: ApiService) { }

  ngOnInit() {
    this.getCoordinadores();
  }

  getCoordinadores() {
    this.apiService.getCoordinadores().subscribe((resp: any) => {
      console.log(resp)
      const { coordinadores_asignados, coordinadores_no_asignados } = resp;
      console.log(coordinadores_asignados)
      this.listCoordinadorAsignados = coordinadores_asignados;
      this.listCoordinadorNoAsignados = coordinadores_no_asignados;
      for (let coordinador of this.listCoordinadorAsignados) {
        let puestos = this.getZones(coordinador.puestos);
        let lastPuestos;
        if (puestos.length > 1) {
          lastPuestos = puestos.shift();
          this.listStations.push(puestos.join(', ') + " y " + lastPuestos);
        } else {
          this.listStations.push(puestos);
        }
        //
      }
    })
  }

  getZones(data: any) {
    return data.map((zone: any) => {
      const { nombre } = zone;
      return nombre;
    });
  }

}
