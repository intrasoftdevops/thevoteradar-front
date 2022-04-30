import { Component, OnInit, } from '@angular/core';
import { Filtro } from 'src/app/models/filtro';
import { ApiService } from '../../../services/api/api.service';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UrlTree } from '@angular/router';

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
  selectedTable: any = [];
  filtro: any;
  idCliente: any;
  urlSafe!:SafeResourceUrl;

  constructor(private apiService: ApiService, private localData: LocalDataService, public sanitizer: DomSanitizer) { }


  ngOnInit(): void {
    this.getPuestos();
    this.getUrl();
    this.getCliente();
  }

  getCliente() {
    this.apiService.getCliente().subscribe((resp: any) => {
      const { id } = resp;
      this.idCliente = id;
    })
  }

  getUrl() {
    //const objeto = new Filtro(1, 1, 1);
    // const objeto= new Filtro({cliente:1,rol:4,departamento:1,municipio:`'001_01'`,zona_votacion:`'99_001_01'`,puesto_votacion:`'B2_99_001_01'`})
    const objeto = new Filtro(1, 2, ['1','16'], ['001_01'], ['99_001_01'], ['B2_99_001_01'])
    this.filtro = '&'+objeto.generar_filtro().replace(new RegExp(" ", 'g'), "%20").replace(new RegExp("/", 'g'), "%2F").replace(new RegExp("'", 'g'), "%27");
    const url = "https://app.powerbi.com/reportEmbed?reportId=35ce5323-acad-49fc-af76-fb6665b3e10e&autoAuth=true&ctid=2009fbbb-7f05-4d0a-9beb-5bc1df6a7d3a&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXBhYXMtMS1zY3VzLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0LyJ9"+this.filtro;
    this.urlSafe=this.sanitizer.bypassSecurityTrustResourceUrl(url);
    return this.urlSafe;
  }

  getSelectedStation(item: any) {
    this.selectedTable = [];
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
    })
  }

  getMesas(data: any) {
    this.apiService.getTablesTestigo().subscribe((resp: any) => {
      this.dataTables = resp.filter((dataTable: any) => dataTable.codigo_puesto_votacion == data);
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

}

