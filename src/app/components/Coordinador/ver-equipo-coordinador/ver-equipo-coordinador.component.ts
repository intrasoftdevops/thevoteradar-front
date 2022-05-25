import { Component, OnInit, } from '@angular/core';
import { Filtro } from 'src/app/models/filtro';
import { ApiService } from '../../../services/api/api.service';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment.prod';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-ver-equipo-coordinador',
  templateUrl: './ver-equipo-coordinador.component.html',
  styleUrls: ['./ver-equipo-coordinador.component.scss']
})

export class VerEquipoCoordinadorComponent implements OnInit {

  tabla: boolean = false;
  dataZones: any = [];
  dataStations: any = [];
  dataTables: any = [];
  listTestigos: any = [];
  filtro: any;
  urlSafe!: SafeResourceUrl;
  showMap: boolean = false;
  searchForm: FormGroup = this.fb.group({
    puestos: [null],
    mesas: [null]
  });
  dataGraphics: any = {};

  constructor(private apiService: ApiService, private sanitizer: DomSanitizer, private fb: FormBuilder) { }


  ngOnInit(): void {
    this.getPuestos();
    this.getDataGraphics();
  }

  get searchFormControl() {
    return this.searchForm.controls;
  }

  getDataGraphics() {
    this.apiService.getDataGraphics().subscribe((resp: any) => {
      this.dataGraphics=resp;
      this.getUrl();
    })
  }

  getUrl() {
    const objeto = new Filtro(this.dataGraphics.cliente, 4, this.dataGraphics.departamento, this.dataGraphics.municipio, this.dataGraphics.zona,this.dataGraphics.puestos);
    //const objeto = new Filtro(this.idCliente, 2, ['1', '16'], ['001_01'], ['99_001_01'], ['B2_99_001_01'])
    this.filtro = objeto.generar_filtro().replace(new RegExp(" ", "g"), "%20").replace(new RegExp("/", "g"), "%2F");
    const url = environment.powerBiURL + this.filtro;
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getSelectedStation(item: any) {
    this.searchFormControl['mesas'].reset();
    if (item) {
      const codigo_unico = this.getCode(item);
      this.getMesas(codigo_unico);
      this.tabla = false;
    } else {
      this.dataStations = [];
      this.tabla = false
    }
  }

  getSelectedTable(item: any) {
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { mesa: codigo_unico }
      this.getTestigoMesa(data);
      this.tabla = true;
    } else {
      this.tabla = false
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

  getMesas(data: any) {
    this.apiService.getTablesTestigo().subscribe((resp: any) => {
      this.dataTables = resp.filter((dataTable: any) => dataTable.codigo_puesto_votacion == data);
      if (this.dataTables.length > 0) {
        this.searchForm.get('mesas')?.setValue(this.dataTables[0].codigo_unico);
        this.getSelectedTable(this.dataTables[0]);
      }
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

