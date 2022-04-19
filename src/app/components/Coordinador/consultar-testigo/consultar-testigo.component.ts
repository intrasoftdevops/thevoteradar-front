import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { AlertService } from '../../../services/alert.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consultar-testigo',
  templateUrl: './consultar-testigo.component.html',
  styleUrls: ['./consultar-testigo.component.scss']
})
export class ConsultarTestigoComponent implements OnInit {

  listTestigoAsignados: any = [];
  listTestigoNoAsignados: any = [];
  listTables: any = [];

  constructor(private alertService: AlertService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.getTestigos();
  }

  getTestigos() {
    this.apiService.getTestigos().subscribe((resp: any) => {
      console.log(resp)
      const { testigos_asignados, testigos_no_asignados } = resp;
      this.listTestigoAsignados = testigos_asignados;
      this.listTestigoNoAsignados = testigos_no_asignados;
      for (let testigo of this.listTestigoAsignados) {
        let mesas = this.getTables(testigo.mesas);
        let lastMesas;
        if (mesas.length > 1) {
          lastMesas = mesas.shift();
          this.listTables.push(mesas.join(', ') + " y " + lastMesas);
        } else {
          this.listTables.push(mesas);
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

  getTables(data: any) {
    return data.map((table: any) => {
      const { numero_mesa } = table;
      return numero_mesa;
    });
  }

}
