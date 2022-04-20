import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';

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

  constructor(private apiService: ApiService) { }


  ngOnInit(): void {
    this.getPuestos();
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
    }, (err: any) => {
      this.showError(err);
    })
  }

  getMesas(data: any) {
    this.apiService.getTablesTestigo().subscribe((resp: any) => {
      this.dataTables = resp.filter((dataTable: any) => dataTable.codigo_puesto_votacion == data);
    }, (err: any) => {
      this.showError(err);
    })
  }

  getTestigoMesa(data: any) {
    this.apiService.getTestigoMesa(data).subscribe((resp: any) => {
      const { testigos } = resp;
      this.listTestigos = testigos;
    }, (err: any) => {
      this.showError(err);
    })
  }

  getCode(item: any) {
    const { codigo_unico } = item;
    return codigo_unico;
  }

  showError(err: any) {
    console.log(err);
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: err.message,
    });
  }

}
