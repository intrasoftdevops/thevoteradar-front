import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-ver-puesto-coordinador',
  templateUrl: './ver-puesto-coordinador.component.html',
  styleUrls: ['./ver-puesto-coordinador.component.scss']
})
export class VerPuestoCoordinadorComponent implements OnInit {

  tabla: boolean = false;
  percent:number = 0;
  dataStations: any = [];
  searchForm: FormGroup = this.fb.group({
    puestos: [null],
  });
  dataStateStation:any = [];
  stateActual: any = {};

  constructor(private apiService: ApiService, private fb: FormBuilder) { }

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
      if (this.dataStations.length > 0) {
        this.searchForm.get('puestos')?.setValue(this.dataStations[0].codigo_unico);
        this.getSelectedStation(this.dataStations[0]);
      }
    })
  }

  getNecesitadosPuesto(data: any) {
    this.apiService.getNecesitadosPuesto(data).subscribe((resp: any) => {
      this.dataStateStation = [resp];
    })
  }

  createPercent(existentes: any, necesitados: any) {
    const percent = Math.round((existentes / necesitados) * 100) / 100;
    if (necesitados == 0) {
      return `(0%)`;
    }
    return `(${percent}%)`;
  }

  textColor(existentes: any, necesitados: any) {
    let percent = Math.round((existentes / necesitados) * 100) / 100;
    if (percent == 100) {
      return "text-success";
    } else if ((percent >= 0 && percent <= 50) && (existentes < necesitados)) {
      return "text-danger";
    } else if (percent > 50 && percent < 100) {
      return "text-warning";
    } else if (percent > 100) {
      return "text-primary";
    } else {
      return "text-success";
    }
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

  stateSeleccionado(state: any) {
    this.stateActual=state;
  }

}
