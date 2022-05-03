import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { AlertService } from '../../../services/alert/alert.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CustomValidationService } from '../../../services/validations/custom-validation.service';

@Component({
  selector: 'app-ver-puesto-admin',
  templateUrl: './ver-puesto-admin.component.html',
  styleUrls: ['./ver-puesto-admin.component.scss']
})
export class VerPuestoAdminComponent implements OnInit {

  tabla: string = "ninguna";
  dataDepartments: any = [];
  dataMunicipals: any = [];
  dataZones: any = [];
  dataStations: any = [];
  gerentes: any = {}
  supervisores: any = {};
  coordinadores: any = {};
  testigos: any = {};
  supervisoresGerente: any = {};
  coordinadoresGerente: any = {};
  testigosGerente: any = {};
  coordinadoresSupervisor: any = {};
  testigosSupervisor: any = {};
  testigosCoordinador: any = {};
  searchForm: FormGroup = this.fb.group({
    departamentos: [null],
    municipios: [null],
    zonas: [null],
    puestos: [null],
  });

  constructor(private apiService: ApiService, private alertService: AlertService, private customValidator: CustomValidationService, private fb: FormBuilder) { }

  ngOnInit() {
    this.getDepartmentAdmin();
  }

  get searchFormControl() {
    return this.searchForm.controls;
  }

  getSelectedDepartment(item: any) {
    this.searchFormControl['municipios'].reset();
    this.searchFormControl['zonas'].reset();
    this.searchFormControl['puestos'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { departamento: codigo_unico };
      this.getNecesitadosDepartamento(data);
      this.getMunicipalAdmin(item.codigo_unico);
      this.tabla = "gerente"
    } else {
      this.tabla = "ninguna"
    }
  }

  getSelectedMunicipal(item: any) {
    this.searchFormControl['zonas'].reset();
    this.searchFormControl['puestos'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { municipio: codigo_unico }
      this.getNecesitadosMunicipio(data);
      this.getZonas(data);
      this.tabla = "supervisor";
    } else {
      this.dataZones = [];
      this.tabla = "gerente"
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

  getDepartmentAdmin() {
    this.apiService.getDepartmentAdmin().subscribe((resp: any) => {
      this.dataDepartments = resp;
    })
  }

  getMunicipalAdmin(data: any) {
    this.apiService.getMunicipalAdmin().subscribe((resp: any) => {
      this.dataMunicipals = resp.filter((dataMunicipal: any) => dataMunicipal.codigo_departamento_votacion == data);
    })
  }

  getZonas(data: any) {
    this.apiService.getZonasyGerentes(data).subscribe((resp: any) => {
      const { zonas } = resp;
      this.dataZones = zonas;
    })
  }


  getPuestos(data: any) {
    this.apiService.getPuestosySupervisores(data).subscribe((resp: any) => {
      const { puestos } = resp;
      this.dataStations = puestos;
    })
  }

  getNecesitadosDepartamento(data: any) {
    this.apiService.getNecesitadosDepartamento(data).subscribe((resp: any) => {
      this.gerentes = resp.gerentes;
      this.supervisores = resp.supervisores;
      this.coordinadores = resp.coordinadores;
      this.testigos = resp.testigos;
    })
  }

  getNecesitadosMunicipio(data: any) {
    this.apiService.getNecesitadosMunicipio(data).subscribe((resp: any) => {
      this.supervisoresGerente = resp.supervisores;
      this.coordinadoresGerente = resp.coordinadores;
      this.testigosGerente = resp.testigos;
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
