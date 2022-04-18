import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consultar-supervisor',
  templateUrl: './consultar-supervisor.component.html',
  styleUrls: ['./consultar-supervisor.component.scss']
})
export class ConsultarSupervisorComponent implements OnInit {

  listSupervisorAsignados: any = [];
  listSupervisorNoAsignados: any = [];
  listZones: any = [];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.getSupervisores();
  }

  getSupervisores() {
    this.apiService.getSupervisores().subscribe((resp: any) => {
      console.log(resp)
      const { supervisores_asignados, supervisores_no_asignados } = resp;
      this.listSupervisorAsignados = supervisores_asignados;
      this.listSupervisorNoAsignados = supervisores_no_asignados;
      for (let supervisor of this.listSupervisorAsignados) {
        let zonas = this.getZones(supervisor.zonas);
        let lastZonas;
        if (zonas.length > 1) {
          lastZonas = zonas.shift();
          this.listZones.push(zonas.join(', ') + " y " + lastZonas);
        } else {
          this.listZones.push(zonas);
        }
        //
      }
    }, (err: any) => {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message,
      });
    })
  }

  getZones(data: any) {
    return data.map((zone: any) => {
      const { nombre } = zone;
      return nombre;
    });
  }

}
