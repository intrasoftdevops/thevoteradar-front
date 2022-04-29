import { Component, OnInit, } from '@angular/core';
import { Filtro } from 'src/app/models/filtro';
import { ApiService } from '../../../services/api/api.service';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { DomSanitizer } from '@angular/platform-browser';
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

  constructor(private apiService: ApiService, private localData: LocalDataService, private sanitizer: DomSanitizer) { }


  ngOnInit(): void {
    this.getPuestos();
  }

  getUrl() {
    const objeto = new Filtro(1, 1, 1);
    //const objeto= new Filtro(1,4,1,'001_01','99_001_01','B2_99_001_01')
    this.filtro = this.generar_filtro(objeto.rol, objeto.cliente, objeto.departamento, objeto.municipio, objeto.zona_votacion, objeto.puesto_votacion);
    const url = "https://app.powerbi.com/reportEmbed?reportId=35ce5323-acad-49fc-af76-fb6665b3e10e&autoAuth=true&ctid=2009fbbb-7f05-4d0a-9beb-5bc1df6a7d3a&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXBhYXMtMS1zY3VzLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0LyJ9" + this.filtro;
    //console.log(url)
    //console.log(this.sanitizer.bypassSecurityTrustResourceUrl(url));
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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

  generar_filtro(rol: any, cliente: any, departamento: any, municipio: any, zona_votacion: any, puesto_votacion: any) {
    let aux = ''
    switch (rol) {
      case 1:
        aux = this.filtro_administrador(cliente, rol, departamento);
        break;
      case 2:
        aux = this.filtro_gerente(cliente, rol, departamento, municipio);
        break
      case 3:
        aux = this.filtro_supervisor(cliente, rol, departamento, municipio, zona_votacion);
        break
      case 4:
        aux = this.filtro_coordinador(cliente, rol, departamento, municipio, zona_votacion, puesto_votacion);
        break
      default:
        aux = ''
        break;
    }
    return aux;
  }


  filtro_administrador(cliente: any, rol: any, departamento: any) {
    return `&filter=candidatos/id eq ${cliente} and roles/id eq ${rol} and departamentos_votacion/codigo_unico in (${departamento})`
  }
  filtro_gerente(cliente: any, rol: any, departamento: any, municipio: any) {
    return `&filter=candidatos/id eq ${cliente} and roles/id eq ${rol} and departamentos_votacion/codigo_unico in (${departamento}) and municipios_votacion/codigo_unico in (${municipio})`
  }
  filtro_supervisor(cliente: any, rol: any, departamento: any, municipio: any, zona_votacion: any) {
    return `&filter=candidatos/id eq ${cliente} and roles/id eq ${rol} and departamentos_votacion/codigo_unico in (${departamento}) and municipios_votacion/codigo_unico in (${municipio}) and zonas_votacion/codigo_unico in (${zona_votacion}) `
  }
  filtro_coordinador(cliente: any, rol: any, departamento: any, municipio: any, zona_votacion: any, puesto_votacion: any) {
    return `&filter=candidatos/id eq ${cliente} and roles/id eq ${rol} and departamentos_votacion/codigo_unico in (${departamento}) and municipios_votacion/codigo_unico in (${municipio}) and zonas_votacion/codigo_unico in (${zona_votacion}) 
     and puestos_votacion/codigo_unico in (${puesto_votacion})`
  }
}

