import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Filtro } from 'src/app/models/filtro';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ver-equipo-supervisor',
  templateUrl: './ver-equipo-supervisor.component.html',
  styleUrls: ['./ver-equipo-supervisor.component.scss']
})
export class VerEquipoSupervisorComponent implements OnInit {

  tabla: string = "ninguna";
  dataZones: any = [];
  dataStations: any = [];
  dataTables: any = [];
  listCoordinadores: any = [];
  listTestigos: any = [];
  filtro: any;
  urlSafe!: SafeResourceUrl;
  showMap: boolean = false;
  searchForm: FormGroup = this.fb.group({
    zonas: [null],
    puestos: [null],
    mesas: [null]
  });
  dataGraphics: any = {};

  constructor(private apiService: ApiService, private fb: FormBuilder, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.getZonas();
    this.getDataGraphics();
  }

  get searchFormControl() {
    return this.searchForm.controls;
  }

  getDataGraphics() {
    this.apiService.getDataGraphics().subscribe((resp: any) => {
      this.dataGraphics = resp;
      this.getUrl();
    })
  }

  getUrl() {
    const objeto = new Filtro(this.dataGraphics.cliente, 3, this.dataGraphics.departamento, this.dataGraphics.municipio, this.dataGraphics.zonas);
    //const objeto = new Filtro(this.idCliente, 2, ['1', '16'], ['001_01'], ['99_001_01'], ['B2_99_001_01'])
    this.filtro = objeto.generar_filtro().replace(new RegExp(" ", "g"), "%20").replace(new RegExp("/", "g"), "%2F");
    const url = environment.powerBiURL + this.filtro;
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getSelectedZone(item: any) {
    this.searchFormControl['puestos'].reset();
    this.searchFormControl['mesas'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      this.getPuestos(codigo_unico);
      this.tabla = "ninguna";
    } else {
      this.dataStations = [];
      this.tabla = "ninguna"
    }
  }

  getSelectedStation(item: any) {
    this.searchFormControl['mesas'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { puesto: codigo_unico }
      this.getMesasyCoordinadores(data);
      this.tabla = "coordinador";
    } else {
      this.dataTables = [];
      this.tabla = "supervisor"
    }
  }

  getSelectedTable(item: any) {
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { mesa: codigo_unico }
      this.getTestigoMesa(data);
      this.tabla = "testigo";
    } else {
      this.tabla = "coordinador"
    }
  }

  getZonas() {
    this.apiService.getZonesSupervisor().subscribe((resp: any) => {
      this.dataZones = resp;
      if (this.dataZones.length > 0) {
        this.searchForm.get('zonas')?.setValue(this.dataZones[0].codigo_unico);
        this.getSelectedZone(this.dataZones[0]);
      }
    })
  }

  getPuestos(data: any) {
    this.apiService.getStationsCoordinador().subscribe((resp: any) => {
      this.dataStations = resp.filter((dataStation: any) => dataStation.codigo_zona_votacion == data);
      if (this.dataStations.length > 0) {
        this.searchForm.get('puestos')?.setValue(this.dataStations[0].codigo_unico);
        this.getSelectedStation(this.dataStations[0]);
      }
    })
  }

  getMesasyCoordinadores(data: any) {
    this.apiService.getMesasyCoordinadores(data).subscribe((resp: any) => {
      const { mesas, coordinadores } = resp;
      this.dataTables = mesas;
      this.listCoordinadores = coordinadores;
    })
  }

  getTestigoMesa(data: any) {
    this.apiService.getTestigoMesa(data).subscribe((resp: any) => {
      const { testigos } = resp;
      this.listTestigos = testigos;
    })
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

  showIframe() {
    this.showMap = !this.showMap;
  }

}
