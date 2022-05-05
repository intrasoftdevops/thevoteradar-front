import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-ver-puesto-supervisor',
  templateUrl: './ver-puesto-supervisor.component.html',
  styleUrls: ['./ver-puesto-supervisor.component.scss']
})
export class VerPuestoSupervisorComponent implements OnInit {

  tabla: string = "ninguna";
  percent: number = 0;
  dataZones: any = [];
  dataStations: any = [];
  selectedStation: any = [];
  coordinadores: any = {};
  testigos: any = {};
  testigosCoordinador: any = {};
  searchForm: FormGroup = this.fb.group({
    zonas: [null],
    puestos: [null],
  });

  constructor(private apiService: ApiService, private fb: FormBuilder) { }

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
      this.tabla = "coordinador"
    } else {
      this.tabla = "ninguna"
    }
  }

  getSelectedStation(item: any) {
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { puesto: codigo_unico }
      this.getNecesitadosPuesto(data);
      this.tabla = "testigo";
    } else {
      this.tabla = "coordinador"
    }
  }

  getPuestos(data: any) {
    this.apiService.getStationsCoordinador().subscribe((resp: any) => {
      this.dataStations = resp.filter((dataStation: any) => dataStation.codigo_zona_votacion == data);
    })
  }

  getNecesitadosZona(data: any) {
    this.apiService.getNecesitadosZona(data).subscribe((resp: any) => {
      this.coordinadores = resp.coordinadores;
      this.testigos = resp.testigos;
    })
  }

  getNecesitadosPuesto(data: any) {
    this.apiService.getNecesitadosPuesto(data).subscribe((resp: any) => {
      this.testigosCoordinador = resp.testigos;
    })
  }

  createPercent(existentes: any, necesitados: any) {
    this.percent = Math.round((existentes / necesitados) * 100) / 100;
    if (necesitados == 0) {
      this.percent = 0;
      return `(${this.percent}%)`;
    }
    return `(${this.percent}%)`;
  }

  getZonas() {
    this.apiService.getZonesSupervisor().subscribe((resp: any) => {
      this.dataZones = resp;
    })
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

}
