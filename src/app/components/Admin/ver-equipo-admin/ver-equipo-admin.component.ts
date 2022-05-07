import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { Filtro } from '../../../models/filtro';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-ver-equipo-admin',
  templateUrl: './ver-equipo-admin.component.html',
  styleUrls: ['./ver-equipo-admin.component.scss']
})
export class VerEquipoAdminComponent implements OnInit {

  constructor(private apiService: ApiService,private sanitizer: DomSanitizer) { }

  tabla: string = "ninguna";
  dataDepartments: any = [];
  dataMunicipals: any = [];
  dataZones: any = [];
  dataStations: any = [];
  dataTables: any = [];
  listGerentes: any = [];
  listSupervisores: any = [];
  listCoordinadores: any = [];
  listTestigos: any = [];
  selectedMunicipal: any = [];
  selectedZone: any = [];
  selectedStation: any = [];
  selectedTable: any = [];
  filtro: any;
  idCliente: any;
  urlSafe!: SafeResourceUrl;
  showMap: boolean = false;
  dtOptionsGerente: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  ngOnInit() {
    this.getDepartmentAdmin();
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
    const objeto = new Filtro(1, 1, [1]);
    //const objeto = new Filtro(this.idCliente, 2, ['1', '16'], ['001_01'], ['99_001_01'], ['B2_99_001_01'])
    this.filtro = objeto.generar_filtro().replace(new RegExp(" ", "g"), "%20").replace(new RegExp("/", "g"), "%2F");
    const url = environment.powerBiURL + this.filtro;
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    return this.urlSafe;
  }

  getSelectedDepartment(item: any) {
    this.selectedMunicipal = [];
    this.selectedZone = [];
    this.selectedStation = [];
    this.selectedTable = [];
    if (item) {
      this.getMunicipalAdmin(item.codigo_unico);
      this.tabla = "ninguna"
    } else {
      this.dataMunicipals = [];
      this.tabla = "ninguna"
    }
  }

  getSelectedMunicipal(item: any) {
    this.selectedZone = [];
    this.selectedStation = [];
    this.selectedTable = [];
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { municipio: codigo_unico }
      this.getZonasyGerentes(data);
      this.tabla = "gerente";
    } else {
      this.dataZones = [];
      this.tabla = "ninguna"
    }
  }

  getSelectedZone(item: any) {
    this.selectedStation = [];
    this.selectedTable = [];
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { zona: codigo_unico }
      this.getPuestosySupervisores(data);
      this.tabla = "supervisor";
    } else {
      this.dataStations = [];
      this.tabla = "gerente"
    }
  }

  getSelectedStation(item: any) {
    this.selectedTable = [];
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

  getZonasyGerentes(data: any) {
    this.apiService.getZonasyGerentes(data).subscribe((resp: any) => {
      const { zonas, gerentes } = resp;
      this.dataZones = zonas;
      this.listGerentes = gerentes;
    })
  }

  getPuestosySupervisores(data: any) {
    this.apiService.getPuestosySupervisores(data).subscribe((resp: any) => {
      const { puestos, supervisores } = resp;
      this.dataStations = puestos;
      this.listSupervisores = supervisores;
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
