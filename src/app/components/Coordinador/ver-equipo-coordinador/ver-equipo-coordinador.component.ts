import { Component, OnInit } from '@angular/core';
import { Filtro } from 'src/app/models/filtro';
import { ApiService } from '../../../services/api/api.service';
import { LocalDataService } from '../../../services/localData/local-data.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment.prod';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-ver-equipo-coordinador',
  templateUrl: './ver-equipo-coordinador.component.html',
  styleUrls: ['./ver-equipo-coordinador.component.scss'],
})
export class VerEquipoCoordinadorComponent implements OnInit {
  tabla: boolean = true;
  dataZones: any = [];
  dataStations: any = [];
  dataTables: any = [];
  listTestigos: any = [];
  listMesas:any = [];
  filtro: any;
  urlSafe!: SafeResourceUrl;
  showMap: boolean = false;
  searchForm: UntypedFormGroup = this.fb.group({
    puestos: [null],
    mesas: [null],
  });
  dataGraphics: any = {};
  listTestigoAsignados:any = []
  dtElement: DataTableDirective | undefined;
  dtTrigger: Subject<any> = new Subject<any>();
  testigosMesas: { [key: number]: string[] } = {};
  puestoSeleccionado = '';

  constructor(
    private apiService: ApiService,
    private sanitizer: DomSanitizer,
    private fb: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.getPuestos();
    this.getDataGraphics();
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
    const objeto = new Filtro(
      this.dataGraphics.cliente,
      4,
      this.dataGraphics.departamento,
      this.dataGraphics.municipio,
      this.dataGraphics.zona,
      this.dataGraphics.puestos
    );
    //const objeto = new Filtro(this.idCliente, 2, ['1', '16'], ['001_01'], ['99_001_01'], ['B2_99_001_01'])
    this.filtro = objeto
      .generar_filtro()
      .replace(new RegExp(' ', 'g'), '%20')
      .replace(new RegExp('/', 'g'), '%2F');
    const url = environment.powerBiURL + this.filtro;
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getSelectedStation(item: any) {
   
    
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { puesto: codigo_unico };
      this.puestoSeleccionado = data.puesto
      console.log(this.puestoSeleccionado)
      this.getTestigos();
      console.log(this.listTestigoAsignados)
      this.tabla = true;
    } else {
      this.tabla = false;
    }
  }

  getSelectedTable(item: any) {
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { mesa: codigo_unico };
      this.getTestigoMesa(data);
      this.tabla = true;
    } else {
      this.tabla = false;
    }
  }

 

  getMesas(data: any) {
    this.apiService.getTablesTestigo().subscribe((resp: any) => {
      this.dataTables = resp.filter(
        (dataTable: any) => dataTable.codigo_puesto_votacion == data
      );
      if (this.dataTables.length > 0) {
        this.searchForm.get('mesas')?.setValue(this.dataTables[0].codigo_unico);
        this.getSelectedTable(this.dataTables[0]);
      }
    });
  }

  getTestigoMesa(data: any) {

    
    
    /*this.apiService.getTestigoMesa(data).subscribe((resp: any) => {
      console.log(resp)
      const { testigos } = resp;
      this.listTestigos = testigos;
    });*/
  }

 

  getTestigos() {
    this.apiService.getTestigos().subscribe((resp: any) => {
      const { testigos_asignados, testigos_no_asignados } = resp;
      this.listTestigoAsignados = testigos_asignados;
      // for (let testigo of this.listTestigoAsignados) {
      //   this.getTables(testigo);
      // }
      setTimeout(() => {
        if (this.dtElement) {
          this.dtElement.dtInstance?.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy();
            this.dtTrigger.next(void 0); // Proporciona un valor (puede ser void 0 o cualquier otro valor)
          });
        }
      });
    });
  }
  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

  showIframe() {
    this.showMap = !this.showMap;
  }

  getTablesForTestigo(testigo: any) {
    const testigoId = testigo.id;
    this.apiService.getTestigo(testigoId).subscribe((resp: any) => {
      const mesas_asignadas = resp.mesas_asignadas.map(
        (mesa: any) => mesa.numero_mesa
      );
      testigo.mesas_asignadas = mesas_asignadas; // Almacena las mesas asignadas en el objeto del testigo
    });
  }

  

  getTables(testigo: any) {
    const testigoId = testigo.id
    this.apiService.getTestigo(testigoId).subscribe((resp: any) => {
      if (resp.puestos_asignados.codigo_unico == this.puestoSeleccionado) {
        const mesas_asignadas = resp.mesas_asignadas.map(
          (mesa: any) => mesa.numero_mesa
        );
       
        this.testigosMesas[testigoId] = mesas_asignadas;
      }
      else{
        const newTestigos = this.listTestigoAsignados.filter((item: any) => item !== testigo);
        this.listTestigoAsignados = newTestigos
      }
    });
  }

  

  getPuestos() {
    this.apiService.getStationsTestigo().subscribe((resp: any) => {
      this.dataStations = resp;
      if (this.dataStations.length > 0) {
        this.searchForm
          .get('puestos')
          ?.setValue(this.dataStations[0].codigo_unico);
        this.getSelectedStation(this.dataStations[0]);
      }
    });
  }

  
}
