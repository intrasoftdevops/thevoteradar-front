import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';

@Component({
  selector: 'app-ver-puesto-supervisor',
  templateUrl: './ver-puesto-supervisor.component.html',
  styleUrls: ['./ver-puesto-supervisor.component.scss'],
})
export class VerPuestoSupervisorComponent implements OnInit {
  tabla: string = 'ninguna';
  percent: number = 0;
  dataZones: any = [];
  dataStations: any = [];
  selectedStation: any = [];
  searchForm: UntypedFormGroup = this.fb.group({
    zonas: [null],
    puestos: [null],
  });
  dataStateZone: any = [];
  dataStateStation: any = [];
  stateActual: any = {};

  constructor(private apiService: ApiService, private fb: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.getZonas();
  }

  get searchFormControl() {
    return this.searchForm.controls;
  }

  getSelectedZone(item: any) {
    this.searchFormControl['puestos'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { zona: codigo_unico };
      this.getNecesitadosZona(data);
      this.getPuestos(codigo_unico);
      this.tabla = 'coordinador';
    } else {
      this.dataStations = [];
      this.tabla = 'ninguna';
    }
  }

  getSelectedStation(item: any) {
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { puesto: codigo_unico };
      this.getNecesitadosPuesto(data);
      this.tabla = 'testigo';
    } else {
      this.tabla = 'coordinador';
    }
  }

  getPuestos(data: any) {
    this.apiService.getStationsCoordinador().subscribe((resp: any) => {
      this.dataStations = resp.filter(
        (dataStation: any) => dataStation.codigo_zona_votacion == data
      );
    });
  }

  getNecesitadosZona(data: any) {
    this.apiService.getNecesitadosZona(data).subscribe((resp: any) => {
      this.dataStateZone = [resp];
    });
  }

  getNecesitadosPuesto(data: any) {
    this.apiService.getNecesitadosPuesto(data).subscribe((resp: any) => {
      this.dataStateStation = [resp];
    });
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
      return 'text-success';
    } else if (percent >= 0 && percent <= 50 && existentes < necesitados) {
      return 'text-danger';
    } else if (percent > 50 && percent < 100) {
      return 'text-warning';
    } else if (percent > 100) {
      return 'text-primary';
    } else {
      return 'text-success';
    }
  }

  getZonas() {
    this.apiService.getZonesSupervisor().subscribe((resp: any) => {
      this.dataZones = resp;
      if (this.dataZones.length > 0) {
        this.searchForm.get('zonas')?.setValue(this.dataZones[0].codigo_unico);
        this.getSelectedZone(this.dataZones[0]);
      }
    });
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

  stateSeleccionado(state: any) {
    this.stateActual = state;
  }
}
