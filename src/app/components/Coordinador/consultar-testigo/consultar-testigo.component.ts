import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { Router } from '@angular/router';
import { LocalDataService } from '../../../services/localData/local-data.service';

@Component({
  selector: 'app-consultar-testigo',
  templateUrl: './consultar-testigo.component.html',
  styleUrls: ['./consultar-testigo.component.scss']
})
export class ConsultarTestigoComponent implements OnInit {

  listTestigoAsignados: any = [];
  listTestigoNoAsignados: any = [];
  listTables: any = [];

  constructor(private apiService: ApiService,private router: Router,private localData: LocalDataService) { }

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
    })
  }

  getTables(data: any) {
    return data.map((table: any) => {
      const { numero_mesa } = table;
      return numero_mesa;
    });
  }

  redirectUpdateTestigo(id: any) {
    const idEncrypt = this.localData.encryptIdUser(id);
    this.router.navigate(["editarTestigo",idEncrypt]);
  }

}
