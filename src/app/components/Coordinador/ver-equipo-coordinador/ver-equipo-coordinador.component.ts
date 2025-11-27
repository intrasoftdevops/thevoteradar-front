import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-ver-equipo-coordinador',
  templateUrl: './ver-equipo-coordinador.component.html',
  styleUrls: ['./ver-equipo-coordinador.component.scss'],
})
export class VerEquipoCoordinadorComponent implements OnDestroy, OnInit {
  tabla = true;
  dataZones: any[] = [];
  dataStations: any[] = [];
  dataTables: any[] = [];
  listTestigos: any[] = [];
  listMesas: any[] = [];
  filtro: any;
  urlSafe!: SafeResourceUrl;
  showMap = false;
  searchForm: FormGroup;
  dataGraphics: any = {};
  listTestigoAsignados: any[] = [];
  testigosMesas: { [key: number]: string[] } = {};
  puestoSeleccionado = '';
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective)
  dtElement!: any;
  notFirstTime = false;

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      puestos: [null],
      mesas: [null],
    });
  }

  ngOnInit(): void {
    this.getPuestos();
    this.dtOptions = {
      destroy:true,
      processing: true,
      pageLength: 20,
      language: { url: '
    };
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  get searchFormControl() {
    return this.searchForm.controls;
  }

  getSelectedStation(item: any) {
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { puesto: codigo_unico };
      this.puestoSeleccionado = data.puesto;
      console.log(this.puestoSeleccionado)
      this.getTestigos();
      this.tabla = true;
    } else {
      this.tabla = false;
    }
  }

  getSelectedTable(item: any) {
    if (item) {
      const codigo_unico = this.getCode(item);
      const data = { mesa: codigo_unico };
      this.tabla = true;
    } else {
      this.tabla = false;
    }
  }

  getMesas(data: any) {
    this.apiService.getTablesTestigo().subscribe((resp: any) => {
      this.dataTables = resp.filter((dataTable: any) => dataTable.codigo_puesto_votacion == data);
      if (this.dataTables.length > 0) {
        this.searchForm.get('mesas')?.setValue(this.dataTables[0].codigo_unico);
        this.getSelectedTable(this.dataTables[0]);
      }
    });
  }

  getTestigos() {
    this.apiService.getTestigos().subscribe((resp: any) => {
      const { testigos_asignados, testigos_no_asignados } = resp;
      this.listTestigoAsignados = testigos_asignados.filter((testigo: any) => {
        
        testigo.mesas = testigo.mesas.filter((mesa: any) => mesa.codigo_puesto_votacion === this.puestoSeleccionado);
        
        return testigo.mesas.length > 0;
    });
      this.renderer();
      this.notFirstTime = true;
    });
  }

  renderer() {
    if (this.notFirstTime) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.draw();
        dtInstance.destroy();
      });
    }
    setTimeout(() => {
      this.dtTrigger.next(void 0);
    });
  }

  getCode(item: any) {
    return item.codigo_unico;
  }

  getTablesForTestigo(testigo: any) {
    const testigoId = testigo.id;
    this.apiService.getTestigo(testigoId).subscribe((resp: any) => {
      const mesas_asignadas = resp.mesas_asignadas.map((mesa: any) => mesa.numero_mesa);
      testigo.mesas_asignadas = mesas_asignadas;
    });
  }

  getPuestos() {
    this.apiService.getStationsTestigo().subscribe((resp: any) => {
      this.dataStations = resp;
      if (this.dataStations.length > 0) {
        this.searchForm.get('puestos')?.setValue(this.dataStations[0].codigo_unico);
        this.getSelectedStation(this.dataStations[0]);
      }
    });
  }

}
