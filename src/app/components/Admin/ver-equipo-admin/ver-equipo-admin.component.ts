import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { BackofficeAdminService } from '../../../services/backoffice-admin/backoffice-admin.service';
import { Filtro } from '../../../models/filtro';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-ver-equipo-admin',
  templateUrl: './ver-equipo-admin.component.html',
  styleUrls: ['./ver-equipo-admin.component.scss'],
})
export class VerEquipoAdminComponent implements OnInit {
  tabla: string = 'ninguna';
  dataDepartments: any = [];
  dataMunicipals: any = [];
  dataZones: any = [];
  dataStations: any = [];
  dataTables: any = [];
  listGerentes: any = [];
  listSupervisores: any = [];
  listCoordinadores: any = [];
  listTestigos: any = [];
  filtro: any;
  urlSafe!: SafeResourceUrl;
  showMap: boolean = false;
  searchForm: FormGroup = this.fb.group({
    departamentos: [null],
    municipios: [null],
    zonas: [null],
    puestos: [null],
    mesas: [null],
  });
  dataGraphics: any = {};

  constructor(
    private apiService: ApiService,
    private backofficeAdminService: BackofficeAdminService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.getDepartmentAdmin();
    
    this.getUrl();
  }

  get searchFormControl() {
    return this.searchForm.controls;
  }

  getDataGraphics() {
    this.apiService.getDataGraphics().subscribe((resp: any) => {
      this.dataGraphics = resp;
      this.getUrl();
    });
  }

  getUrl() {
    
    
    
    let url = environment.powerBiURL;
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getSelectedDepartment(item: any) {
    this.searchFormControl['municipios'].reset();
    this.searchFormControl['zonas'].reset();
    this.searchFormControl['puestos'].reset();
    this.searchFormControl['mesas'].reset();
    if (item) {
      this.getMunicipalAdmin(item.codigo_unico);
      this.tabla = 'ninguna';
    } else {
      this.dataMunicipals = [];
      this.dataZones = [];
      this.dataStations = [];
      this.dataTables = [];
      this.tabla = 'ninguna';
    }
  }

  getSelectedMunicipal(item: any) {
    this.searchFormControl['zonas'].reset();
    this.searchFormControl['puestos'].reset();
    this.searchFormControl['mesas'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { municipio: codigo_unico };
      this.getZonasGerentes(data);
      this.tabla = 'gerente';
    } else {
      this.dataZones = [];
      this.dataStations = [];
      this.dataTables = [];
      this.tabla = 'ninguna';
    }
  }

  getSelectedZone(item: any) {
    this.searchFormControl['puestos'].reset();
    this.searchFormControl['mesas'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { zona: codigo_unico };
      this.getPuestosSupervisores(data);
      this.tabla = 'supervisor';
    } else {
      this.dataStations = [];
      this.dataTables = [];
      this.tabla = 'gerente';
    }
  }

  getSelectedStation(item: any) {
    this.searchFormControl['mesas'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { puesto: codigo_unico };
      this.getMesasyCoordinadores(data);
      this.tabla = 'coordinador';
    } else {
      this.dataTables = [];
      this.tabla = 'supervisor';
    }
  }

  getSelectedTable(item: any) {
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { mesa: codigo_unico };
      this.getTestigoMesa(data);
      this.tabla = 'testigo';
    } else {
      this.tabla = 'coordinador';
    }
  }

  getDepartmentAdmin() {
    this.backofficeAdminService.getDepartamentosAdmin().subscribe({
      next: (resp: any) => {
        this.dataDepartments = resp.departamentos || resp || [];
        if (this.dataDepartments.length > 0) {
          this.searchForm
            .get('departamentos')
            ?.setValue(this.dataDepartments[0].codigo_unico);
          this.getSelectedDepartment(this.dataDepartments[0]);
        }
      },
      error: (error: any) => {
        this.dataDepartments = [];
      }
    });
  }

  getMunicipalAdmin(data: any) {
    this.apiService.getMunicipalAdmin().subscribe({
      next: (resp: any) => {
        this.dataMunicipals = resp.filter(
          (dataMunicipal: any) =>
            dataMunicipal.codigo_departamento_votacion == data
        );
        if (this.dataMunicipals.length > 0) {
          this.searchForm
            .get('municipios')
            ?.setValue(this.dataMunicipals[0].codigo_unico);
          this.getSelectedMunicipal(this.dataMunicipals[0]);
        } else {
          this.tabla = 'ninguna';
        }
      },
      error: (error: any) => {
        this.dataMunicipals = [];
        this.tabla = 'ninguna';
      }
    });
  }

  getZonasGerentes(data: any) {
    this.apiService.getZonasyGerentes(data).subscribe({
      next: (resp: any) => {
        const { zonas, gerentes } = resp;
        this.dataZones = zonas || [];
        this.listGerentes = gerentes || [];
        // Si no hay gerentes, mantener la tabla en 'ninguna'
        if (!gerentes || gerentes.length === 0) {
          this.tabla = 'ninguna';
        } else {
          this.tabla = 'gerente';
        }
      },
      error: (error: any) => {
        this.dataZones = [];
        this.listGerentes = [];
        this.tabla = 'ninguna';
      }
    });
  }

  getPuestosSupervisores(data: any) {
    this.apiService.getPuestosySupervisores(data).subscribe((resp: any) => {
      const { puestos, supervisores } = resp;
      this.dataStations = puestos;
      this.listSupervisores = supervisores;
    });
  }

  getMesasyCoordinadores(data: any) {
    this.apiService.getMesasyCoordinadores(data).subscribe((resp: any) => {
      const { mesas, coordinadores } = resp;
      this.dataTables = mesas;
      this.listCoordinadores = coordinadores;
    });
  }

  getTestigoMesa(data: any) {
    this.apiService.getTestigoMesa(data).subscribe((resp: any) => {
      const { testigos } = resp;
      this.listTestigos = testigos;
    });
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

  showIframe() {
    this.showMap = !this.showMap;
  }
}
