import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';

@Component({
  selector: 'app-impugnar',
  templateUrl: './impugnar.component.html',
  styleUrls: ['./impugnar.component.scss']
})
export class ImpugnarComponent implements OnInit {

  dataCandidatos: any = [];
  tabla: boolean = false;
  dataRevisar: any = [];
  dataImpugnar: any = [];
  dataNoImpugnados: any = [];
  dataRevisarActual:any={};

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.getInteresesCandidato();
  }

  getSelectedValue(item: any) {
    if (item) {
      const data = { candidato_comparacion: item };
      this.getImpugnaciones(data);
      this.tabla = true;
    } else {
      this.tabla = false;
    }
  }

  getInteresesCandidato() {
    this.apiService.getInteresesCandidato().subscribe((resp: any) => {
      this.dataCandidatos = resp;
    })
  }

  getImpugnaciones(data: any) {
    this.apiService.getImpugnaciones(data).subscribe((resp: any) => {
      this.dataRevisar = resp.reportes_no_revisados;
      this.dataImpugnar = resp.reportes_revisados;
      this.dataNoImpugnados = resp.reportes_no_impugnados;
    })
  }

  ModalRevisarActual(revisar:any){
    console.log(revisar);
    this.dataRevisarActual=revisar;
  }

}
