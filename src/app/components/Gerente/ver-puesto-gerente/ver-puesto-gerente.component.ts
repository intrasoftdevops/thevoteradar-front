import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-ver-puesto-gerente',
  templateUrl: './ver-puesto-gerente.component.html',
  styleUrls: ['./ver-puesto-gerente.component.scss']
})
export class VerPuestoGerenteComponent implements OnInit {

  tabla: string = "ninguna";
  dataMunicipals: any = [];
  dataZones: any = [];
  dataStations: any = [];
  selectedZone: any = [];
  selectedStation: any = [];
  supervisores: any = {};
  coordinadores: any = {};
  testigos: any = {};
  coordinadoresSupervisor: any = {};
  testigosSupervisor: any = {};
  testigosCoordinador: any = {};
  searchForm: FormGroup = this.fb.group({
    municipios: [null],
    zonas: [null],
    puestos: [null],
  });

  constructor(private apiService: ApiService, private fb: FormBuilder) { }

  ngOnInit() {
    this.getMunicipalAdmin();
  }

  get searchFormControl() {
    return this.searchForm.controls;
  }

  getSelectedMunicipal(item: any) {
    this.searchFormControl['zonas'].reset();
    this.searchFormControl['puestos'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { municipio: codigo_unico };
      this.getNecesitadosMunicipio(data);
      this.getZonas(codigo_unico);
      this.tabla = "supervisor";
    } else {
      this.tabla = "ninguna";
    }
  }

  getSelectedZone(item: any) {
    this.searchFormControl['puestos'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { zona: codigo_unico }
      this.getNecesitadosZona(data);
      this.getPuestos(data);
      this.tabla = "coordinador";
    } else {
      this.dataStations = [];
      this.tabla = "supervisor"
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

  getMunicipalAdmin() {
    this.apiService.getMunicipalGerente().subscribe(resp => {
      this.dataMunicipals = resp;
    });
  }

  getZonas(data: any) {
    this.apiService.getZoneGerente().subscribe((resp: any) => {
      this.dataZones = resp.filter((dataZone: any) => dataZone.codigo_municipio_votacion == data);
    });
  }

  getPuestos(data: any) {
    this.apiService.getPuestosySupervisores(data).subscribe((resp: any) => {
      const { puestos } = resp;
      this.dataStations = puestos;
    })
  }

  getNecesitadosMunicipio(data: any) {
    this.apiService.getNecesitadosMunicipio(data).subscribe((resp: any) => {
      this.supervisores = resp.supervisores;
      this.coordinadores = resp.coordinadores;
      this.testigos = resp.testigos;
    })
  }

  getNecesitadosZona(data: any) {
    this.apiService.getNecesitadosZona(data).subscribe((resp: any) => {
      this.coordinadoresSupervisor = resp.coordinadores;
      this.testigosSupervisor = resp.testigos;
    })
  }

  getNecesitadosPuesto(data: any) {
    this.apiService.getNecesitadosPuesto(data).subscribe((resp: any) => {
      this.testigosCoordinador = resp.testigos;
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
    const percent = (existentes / necesitados) * 100;
    if (necesitados == 0) {
      return '(0%)';
    }
    return `(${Math.round(percent * 100) / 100}%)`;
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

}
