import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { Filtro } from 'src/app/models/filtro';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ver-equipo-gerente',
  templateUrl: './ver-equipo-gerente.component.html',
  styleUrls: ['./ver-equipo-gerente.component.scss'],
})
export class VerEquipoGerenteComponent implements OnInit {
  tabla: string = 'ninguna';
  dataMunicipals: any = [];
  dataZones: any = [];
  dataStations: any = [];
  dataTables: any = [];
  listSupervisores: any = [];
  listCoordinadores: any = [];
  listTestigos: any = [];
  filtro: any;
  urlSafe!: SafeResourceUrl;
  showMap: boolean = false;
  searchForm: FormGroup = this.fb.group({
    municipios: [null],
    zonas: [null],
    puestos: [null],
    mesas: [null],
  });
  dataGraphics: any = {};

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.getMunicipalAdmin();
    //this.getDataGraphics();
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
    //const objeto = new Filtro(this.dataGraphics.cliente, 2, this.dataGraphics.departamentos, this.dataGraphics.municipios);
    //const objeto = new Filtro(this.idCliente, 2, ['1', '16'], ['001_01'], ['99_001_01'], ['B2_99_001_01'])
    //this.filtro = objeto.generar_filtro().replace(new RegExp(" ", "g"), "%20").replace(new RegExp("/", "g"), "%2F");
    let url = environment.powerBiURL;
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getSelectedMunicipal(item: any) {
    this.searchFormControl['zonas'].reset();
    this.searchFormControl['puestos'].reset();
    this.searchFormControl['mesas'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      this.getZonas(codigo_unico);
      this.tabla = 'ninguna';
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
      this.getPuestosySupervisores(data);
      this.tabla = 'supervisor';
    } else {
      this.dataStations = [];
      this.dataTables = [];
      this.tabla = 'ninguna';
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

  getMunicipalAdmin() {
    this.apiService.getMunicipalGerente().subscribe((resp) => {
      this.dataMunicipals = resp;
      if (this.dataMunicipals.length > 0) {
        this.searchForm
          .get('municipios')
          ?.setValue(this.dataMunicipals[0].codigo_unico);
        this.getSelectedMunicipal(this.dataMunicipals[0]);
      }
    });
  }

  getZonas(data: any) {
    this.apiService.getZoneGerente().subscribe((resp: any) => {
      this.dataZones = resp.filter(
        (dataZone: any) => dataZone.codigo_municipio_votacion == data
      );
      if (this.dataZones.length > 0) {
        this.searchForm.get('zonas')?.setValue(this.dataZones[0].codigo_unico);
        this.getSelectedZone(this.dataZones[0]);
      }
    });
  }

  getPuestosySupervisores(data: any) {
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
